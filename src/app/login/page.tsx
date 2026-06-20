import Link from "next/link";
import { LogIn } from "lucide-react";

import { signIn } from "@/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type LoginPageProps = {
  searchParams: Promise<{ callbackUrl?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { callbackUrl } = await searchParams;
  const redirectTo =
    callbackUrl?.startsWith("/") && !callbackUrl.startsWith("//")
      ? callbackUrl
      : "/onboarding";

  return (
    <div className="mx-auto flex max-w-md flex-1 items-center px-4 py-16">
      <Card className="surface-card gradient-border w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-[image:var(--gradient-warm)] text-primary-foreground shadow-sm shadow-primary/15">
            <LogIn className="size-7" />
          </div>
          <CardTitle className="text-2xl font-semibold">Connexion GitHub</CardTitle>
          <CardDescription className="text-base">
            Importez vos commits directement depuis vos dépôts.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form
            action={async () => {
              "use server";
              await signIn("github", { redirectTo });
            }}
          >
            <Button type="submit" size="lg" className="w-full">
              <LogIn />
              Continuer avec GitHub
            </Button>
          </form>
          <p className="text-center text-sm text-muted-foreground">
            <Link
              href="/"
              className="text-primary underline-offset-4 transition-colors hover:underline"
            >
              Retour à l&apos;outil gratuit
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
