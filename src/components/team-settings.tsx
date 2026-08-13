"use client";

import { useEffect, useState } from "react";
import { Loader2, Mail, UserMinus, Users } from "lucide-react";

import { BILLING } from "@/lib/billing/constants";
import type { TeamSnapshot } from "@/lib/supabase/team";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function TeamSettings() {
  const [team, setTeam] = useState<TeamSnapshot | null>(null);
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      void (async () => {
        setIsLoading(true);
        try {
          const response = await fetch("/api/team", {
            credentials: "same-origin",
          });
          if (!response.ok) return;
          const payload = (await response.json()) as TeamSnapshot;
          setTeam(payload);
        } finally {
          setIsLoading(false);
        }
      })();
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  async function reloadTeam() {
    const response = await fetch("/api/team", { credentials: "same-origin" });
    if (!response.ok) return;
    const payload = (await response.json()) as TeamSnapshot;
    setTeam(payload);
  }

  async function postAction(body: Record<string, string>) {
    setIsSaving(true);
    setError(null);
    setMessage(null);
    try {
      const response = await fetch("/api/team", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(payload.error ?? "Request failed.");
      }
      setMessage("Team updated.");
      setEmail("");
      await reloadTeam();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed.");
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <Card className="surface-card gradient-border">
        <CardContent className="flex items-center gap-2 py-8 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Loading team…
        </CardContent>
      </Card>
    );
  }

  if (!team) return null;

  if (team.isMember) {
    return (
      <Card className="surface-card gradient-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="size-5 text-primary" />
            Pro team
          </CardTitle>
          <CardDescription>
            You are on a Pro team
            {team.ownerEmail ? ` (${team.ownerEmail})` : ""}. Generations use
            the team&apos;s shared quota.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            type="button"
            variant="outline"
            disabled={isSaving}
            onClick={() => void postAction({ action: "leave" })}
          >
            {isSaving ? <Loader2 className="animate-spin" /> : <UserMinus />}
            Leave team
          </Button>
          {error ? (
            <p className="mt-3 text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}
          {message ? (
            <p className="mt-3 text-sm text-emerald-400">{message}</p>
          ) : null}
        </CardContent>
      </Card>
    );
  }

  if (!team.canManage) {
    return (
      <Card className="surface-card gradient-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="size-5 text-primary" />
            Pro team seats
          </CardTitle>
          <CardDescription>
            Subscribe to Pro to invite up to {BILLING.PRO_MAX_TEAM_SEATS - 1}{" "}
            teammates on one shared quota.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="surface-card gradient-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Users className="size-5 text-primary" />
          Pro team seats
        </CardTitle>
        <CardDescription>
          {team.seatsUsed} / {team.seatsMax} seats used · invite by email (they
          sign in with GitHub using that address).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="team-email">Invite teammate</Label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              id="team-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="teammate@studio.com"
              className="sm:flex-1"
            />
            <Button
              type="button"
              disabled={isSaving || !email.trim()}
              onClick={() =>
                void postAction({ action: "invite", email: email.trim() })
              }
            >
              {isSaving ? <Loader2 className="animate-spin" /> : <Mail />}
              Invite
            </Button>
          </div>
        </div>

        {team.members.length > 0 ? (
          <div className="space-y-2">
            <p className="text-sm font-medium">Members</p>
            <ul className="space-y-2 text-sm">
              {team.members.map((member) => (
                <li
                  key={member.userId}
                  className="flex items-center justify-between rounded-lg border border-border/60 px-3 py-2"
                >
                  <span>{member.email ?? member.userId}</span>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    disabled={isSaving}
                    onClick={() =>
                      void postAction({
                        action: "remove",
                        memberId: member.userId,
                      })
                    }
                  >
                    Remove
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {team.pendingInvites.length > 0 ? (
          <div className="space-y-2">
            <p className="text-sm font-medium">Pending invites</p>
            <ul className="space-y-2 text-sm">
              {team.pendingInvites.map((invite) => (
                <li
                  key={invite.id}
                  className="flex items-center justify-between rounded-lg border border-border/60 px-3 py-2"
                >
                  <span>{invite.inviteeEmail}</span>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    disabled={isSaving}
                    onClick={() =>
                      void postAction({ action: "revoke", inviteId: invite.id })
                    }
                  >
                    Revoke
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {message ? (
          <p className="text-sm text-emerald-400">{message}</p>
        ) : null}
        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
