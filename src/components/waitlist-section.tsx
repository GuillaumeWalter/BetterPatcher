"use client";

import { ArrowRight, Loader2 } from "lucide-react";
import { useState } from "react";

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

export function WaitlistSection() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "Inscription impossible.");
      }

      setSubmitted(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Une erreur est survenue.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-card/50 to-card/50">
      <CardHeader className="text-center sm:text-left">
        <CardTitle className="text-xl">
          Release Hub automatisé — bientôt disponible
        </CardTitle>
        <CardDescription className="max-w-2xl">
          Connectez GitHub, déclenchez la génération à chaque release et
          récupérez patch notes + assets marketing sans effort. Rejoignez la
          liste d&apos;attente pour un accès anticipé.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {submitted ? (
          <p className="text-sm text-muted-foreground">
            Merci ! Nous vous préviendrons dès que la version automatisée sera
            prête.
          </p>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-3 sm:flex-row sm:items-end"
          >
            <div className="flex-1 space-y-2">
              <Label htmlFor="email">Email professionnel</Label>
              <Input
                id="email"
                type="email"
                placeholder="vous@entreprise.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <Button
              type="submit"
              size="lg"
              className="sm:shrink-0"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" />
                  Inscription…
                </>
              ) : (
                <>
                  Rejoindre la liste
                  <ArrowRight />
                </>
              )}
            </Button>
            {error ? (
              <p className="text-sm text-destructive sm:col-span-2" role="alert">
                {error}
              </p>
            ) : null}
          </form>
        )}
      </CardContent>
    </Card>
  );
}
