import { formatTicketContextForPrompt, fetchLinearIssues } from "@/lib/linear";
import { parseTicketKeys } from "@/lib/tickets/parse-keys";
import { getLinearAccessToken } from "@/lib/supabase/users";
import { isPaidPlan } from "@/lib/billing/constants";

export type ResolvedTicket = {
  key: string;
  title: string | null;
  state: string | null;
};

export type TicketResolution = {
  keys: string[];
  tickets: ResolvedTicket[];
  enriched: boolean;
  linearConnected: boolean;
  canEnrich: boolean;
};

export async function resolveTicketsForGeneration(input: {
  userId: string;
  commits: string;
  plan: string;
}): Promise<{ ticketContext: string; resolution: TicketResolution }> {
  const keys = parseTicketKeys(input.commits);
  const canEnrich = isPaidPlan(input.plan);
  const token = canEnrich ? await getLinearAccessToken(input.userId) : null;
  const linearConnected = Boolean(token);

  const empty: TicketResolution = {
    keys,
    tickets: keys.map((key) => ({ key, title: null, state: null })),
    enriched: false,
    linearConnected,
    canEnrich,
  };

  if (!canEnrich || !token || keys.length === 0) {
    return { ticketContext: "", resolution: empty };
  }

  const issues = await fetchLinearIssues(token, keys);
  const ticketContext = formatTicketContextForPrompt(issues);

  const tickets: ResolvedTicket[] = keys.map((key) => {
    const match = issues.find(
      (issue) => issue.identifier.toUpperCase() === key.toUpperCase(),
    );
    return {
      key,
      title: match?.title ?? null,
      state: match?.state ?? null,
    };
  });

  return {
    ticketContext,
    resolution: {
      keys,
      tickets,
      enriched: issues.length > 0,
      linearConnected: true,
      canEnrich: true,
    },
  };
}
