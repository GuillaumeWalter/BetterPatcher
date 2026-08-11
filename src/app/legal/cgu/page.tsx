import Link from "next/link";

import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Conditions générales d'utilisation",
};

export default function CguPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
      <h1 className="text-3xl font-semibold tracking-tight">
        Conditions générales d&apos;utilisation
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Dernière mise à jour : août 2026
      </p>

      <div className="prose prose-sm mt-8 max-w-none space-y-6 text-muted-foreground">
        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">1. Objet</h2>
          <p>
            Release Hub est un service en ligne qui génère des patch notes et
            contenus marketing à partir de messages de commit, via intelligence
            artificielle. L&apos;utilisation du service implique l&apos;acceptation
            des présentes CGU.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">2. Compte</h2>
          <p>
            L&apos;accès nécessite un compte GitHub. Vous êtes responsable de la
            confidentialité de votre session et des contenus que vous soumettez au
            service.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">
            3. Offres et paiement
          </h2>
          <p>
            Un essai limité peut être proposé après vérification de carte bancaire
            (sans prélèvement immédiat). L&apos;abonnement Pro est facturé
            mensuellement via Stripe. Les tarifs en vigueur sont affichés sur la
            page d&apos;accueil.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">
            4. Contenus générés par IA
          </h2>
          <p>
            Les sorties sont fournies à titre indicatif. Vous devez les relire avant
            publication. Release Hub ne garantit pas l&apos;exactitude technique ou
            juridique des contenus générés.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">
            5. Limitation de responsabilité
          </h2>
          <p>
            Le service est fourni « en l&apos;état ». Dans les limites autorisées par
            la loi, Release Hub ne pourra être tenu responsable des dommages
            indirects liés à l&apos;utilisation du service.
          </p>
        </section>

        <section className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm">
          <p className="font-medium text-foreground">À personnaliser avant prod</p>
          <p className="mt-1">
            Renseigner l&apos;éditeur (raison sociale, SIRET, adresse), le médiateur
            de la consommation le cas échéant, et le droit applicable. Consulter un
            conseil juridique pour une version définitive.
          </p>
        </section>
      </div>

      <Button variant="outline" className="mt-10" asChild>
        <Link href="/">Retour à l&apos;accueil</Link>
      </Button>
    </div>
  );
}
