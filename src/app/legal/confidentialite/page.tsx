import Link from "next/link";

import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Politique de confidentialité",
};

export default function ConfidentialitePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
      <h1 className="text-3xl font-semibold tracking-tight">
        Politique de confidentialité
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Dernière mise à jour : août 2026
      </p>

      <div className="prose prose-sm mt-8 max-w-none space-y-6 text-muted-foreground">
        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">
            1. Données collectées
          </h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>Identité GitHub (nom, email, identifiant)</li>
            <li>Messages de commit et métadonnées de dépôt soumis volontairement</li>
            <li>Historique des patch notes générés</li>
            <li>Données de facturation gérées par Stripe (nous ne stockons pas les numéros de carte)</li>
            <li>Email si inscription à la liste d&apos;attente</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">2. Finalités</h2>
          <p>
            Fourniture du service, gestion des comptes et abonnements, amélioration
            du produit, support client et respect des obligations légales.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">
            3. Sous-traitants
          </h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>Vercel (hébergement)</li>
            <li>Supabase (base de données)</li>
            <li>Stripe (paiements)</li>
            <li>Google (API Gemini — génération IA)</li>
            <li>GitHub (authentification et import de commits)</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">4. Vos droits (RGPD)</h2>
          <p>
            Vous pouvez demander l&apos;accès, la rectification ou la suppression de
            vos données en contactant{" "}
            <a
              href="mailto:contact@releasehub.app"
              className="text-primary underline-offset-4 hover:underline"
            >
              contact@releasehub.app
            </a>
            .
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">5. Conservation</h2>
          <p>
            Les données sont conservées tant que le compte est actif, puis supprimées
            ou anonymisées selon les obligations légales et comptables.
          </p>
        </section>

        <section className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm">
          <p className="font-medium text-foreground">À personnaliser avant prod</p>
          <p className="mt-1">
            Compléter avec l&apos;identité du responsable de traitement, DPO si
            applicable, durées précises de conservation et politique cookies.
          </p>
        </section>
      </div>

      <Button variant="outline" className="mt-10" asChild>
        <Link href="/">Retour à l&apos;accueil</Link>
      </Button>
    </div>
  );
}
