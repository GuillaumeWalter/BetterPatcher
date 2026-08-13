"use client";

import { useState } from "react";
import { Loader2, Trash2 } from "lucide-react";

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

export function AccountDangerZone() {
  const [confirmation, setConfirmation] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setIsDeleting(true);
    setError(null);

    try {
      const response = await fetch("/api/account", {
        method: "DELETE",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmation }),
      });

      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(data.error ?? "Deletion failed.");
      }

      window.location.href = "/api/auth/signout?callbackUrl=/?deleted=1";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Deletion failed.");
      setIsDeleting(false);
    }
  }

  return (
    <Card className="surface-card border-destructive/30">
      <CardHeader>
        <CardTitle className="text-lg text-destructive">Delete account</CardTitle>
        <CardDescription>
          Permanently delete your Easy Patch account, patch note history, and
          integration settings. Billing records may be retained as required by
          law. This cannot be undone.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="delete-confirm">
            Type <strong>DELETE</strong> to confirm
          </Label>
          <Input
            id="delete-confirm"
            value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)}
            placeholder="DELETE"
            autoComplete="off"
          />
        </div>
        <Button
          type="button"
          variant="destructive"
          disabled={confirmation !== "DELETE" || isDeleting}
          onClick={handleDelete}
        >
          {isDeleting ? (
            <>
              <Loader2 className="animate-spin" />
              Deleting…
            </>
          ) : (
            <>
              <Trash2 />
              Delete my account
            </>
          )}
        </Button>
        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
