"use client";

import { ArrowRight, Loader2, Rocket } from "lucide-react";
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
    <Card className="surface-card gradient-border relative overflow-hidden">
      <div className="absolute inset-0 bg-[image:var(--gradient-warm-soft)] opacity-40" />
      <CardHeader className="relative text-center sm:text-left">
        <div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-[image:var(--gradient-warm)] text-primary-foreground shadow-sm shadow-primary/15 sm:mb-0 sm:inline-flex">
          <Rocket className="size-4" />
        </div>
        <CardTitle className="text-xl sm:mt-3">
          Release Hub automatisé — bientôt disponible
        </CardTitle>
        <CardDescription className="max-w-2xl text-base">
          Connectez GitHub, déclenchez la génération à chaque release et
          récupérez patch notes + assets marketing sans effort. Rejoignez la
          liste d&apos;attente pour un accès anticipé.
        </CardDescription>
      </CardHeader>
      <CardContent className="relative">
        {submitted ? (
          <p className="rounded-xl border border-primary/15 bg-primary/8 px-4 py-3 text-sm text-primary">
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
                className="h-10 border-border bg-white"
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
