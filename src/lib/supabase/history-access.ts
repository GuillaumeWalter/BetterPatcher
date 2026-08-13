import { getTeamSnapshot } from "@/lib/supabase/team";
import { getUserProfile } from "@/lib/supabase/users";

/** User IDs whose patch notes the current user may list or open. */
export async function resolveHistoryUserIds(userId: string): Promise<string[]> {
  const profile = await getUserProfile(userId);
  if (!profile) return [userId];

  const team = await getTeamSnapshot(userId);
  if (!team) return [userId];

  if (team.isMember && team.ownerId) {
    const memberIds = team.members.map((member) => member.userId);
    return uniqueIds([team.ownerId, ...memberIds, userId]);
  }

  if (team.isOwner) {
    const memberIds = team.members.map((member) => member.userId);
    return uniqueIds([userId, ...memberIds]);
  }

  return [userId];
}

export function uniqueIds(ids: string[]): string[] {
  return [...new Set(ids.filter((id) => id.length > 0))];
}
