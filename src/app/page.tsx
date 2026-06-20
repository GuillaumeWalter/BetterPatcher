import { GitBranch, Sparkles, Zap } from "lucide-react";

import { PatchNoteGenerator } from "@/components/patch-note-generator";
import { WaitlistSection } from "@/components/waitlist-section";
import { Badge } from "@/components/ui/badge";

const features = [
  {
    icon: GitBranch,
    label: "Commits → changelog",
    description: "Transforme un log brut en Markdown structuré",
  },
  {
    icon: Sparkles,
    label: "Tonalité au choix",
    description: "Technique, marketing ou grand public",
  },
  {
    icon: Zap,
    label: "Post réseaux inclus",
    description: "LinkedIn & X prêts à copier-coller",
  },
];

export default function Home() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-16">
      <section className="relative mb-14 space-y-6 text-center sm:text-left">
        <Badge
          variant="secondary"
          className="border border-primary/25 bg-primary/10 px-3 py-1 text-primary"
        >
          Outil gratuit · Phase 1
        </Badge>

        <div className="space-y-4">
          <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl sm:leading-[1.1]">
            De vos commits au{" "}
            <span className="gradient-text">patch note</span>, en une minute
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Release Hub transforme un log de commits brut en changelog Markdown
            et en post réseaux — adapté aux devs, marketers et studios indés.
          </p>
        </div>

        <div className="grid gap-3 pt-2 sm:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.label}
              className="surface-card gradient-border rounded-2xl p-4 text-left"
            >
              <div className="mb-3 flex size-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
                <feature.icon className="size-4" />
              </div>
              <p className="text-sm font-semibold">{feature.label}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <PatchNoteGenerator />

      <section className="mt-16">
        <WaitlistSection />
      </section>
    </div>
  );
}
