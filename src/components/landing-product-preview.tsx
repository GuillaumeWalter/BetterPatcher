"use client";

/**
 * Stylized product preview for the landing hero.
 * Shows paste → patch note without relying on screenshots.
 */
export function LandingProductPreview() {
  return (
    <div
      className="landing-preview relative mx-auto mt-12 w-full max-w-3xl"
      aria-hidden
    >
      <div className="landing-preview-glow pointer-events-none absolute -inset-6 -z-10 rounded-[2rem] opacity-70" />
      <div className="surface-card gradient-border overflow-hidden rounded-2xl shadow-lg shadow-primary/10">
        <div className="flex items-center gap-2 border-b border-border/60 bg-muted/40 px-4 py-2.5">
          <span className="size-2.5 rounded-full bg-primary/35" />
          <span className="size-2.5 rounded-full bg-primary/25" />
          <span className="size-2.5 rounded-full bg-primary/15" />
          <span className="ml-2 text-xs font-medium text-muted-foreground">
            Easy Patch · Paste any log
          </span>
        </div>
        <div className="grid gap-0 sm:grid-cols-2">
          <div className="space-y-3 border-b border-border/50 p-4 sm:border-b-0 sm:border-r">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-primary/80">
              Source
            </p>
            <ul className="space-y-2 font-mono text-[11px] leading-relaxed text-muted-foreground sm:text-xs">
              <li className="landing-preview-line landing-preview-line-1 rounded-md bg-muted/50 px-2.5 py-1.5">
                feat(gameplay): add dodge roll
              </li>
              <li className="landing-preview-line landing-preview-line-2 rounded-md bg-muted/50 px-2.5 py-1.5">
                fix(netcode): reduce desync
              </li>
              <li className="landing-preview-line landing-preview-line-3 rounded-md bg-muted/50 px-2.5 py-1.5">
                balance: nerf shotgun spread
              </li>
            </ul>
          </div>
          <div className="space-y-3 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-primary/80">
              Patch note
            </p>
            <div className="landing-preview-output space-y-2 rounded-lg border border-border/60 bg-background/80 p-3">
              <p className="text-sm font-semibold text-foreground">
                Patch 1.4 · Combat feel
              </p>
              <ul className="space-y-1.5 text-xs leading-relaxed text-muted-foreground">
                <li>· Dodge roll with invulnerability frames</li>
                <li>· More stable netcode on high latency</li>
                <li>· Shotgun spread tuned at range</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
