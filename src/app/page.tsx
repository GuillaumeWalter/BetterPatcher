import { PatchNoteGenerator } from "@/components/patch-note-generator";
import { WaitlistSection } from "@/components/waitlist-section";

export default function Home() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
      <section className="mb-10 space-y-4 text-center sm:text-left">
        <p className="text-sm font-medium text-primary">
          Outil gratuit · Phase 1
        </p>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          De vos commits au patch note, en une minute
        </h1>
        <p className="max-w-2xl text-base text-muted-foreground sm:text-lg">
          Release Hub transforme un log de commits brut en changelog Markdown et
          en post réseaux — adapté aux devs, marketers et studios indés.
        </p>
      </section>

      <PatchNoteGenerator />

      <section className="mt-14">
        <WaitlistSection />
      </section>
    </div>
  );
}
