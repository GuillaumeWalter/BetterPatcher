import Link from "next/link";
import { redirect } from "next/navigation";
import { LogIn } from "lucide-react";

import { auth, signIn } from "@/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { APP } from "@/lib/routes";

type LoginPageProps = {
  searchParams: Promise<{ callbackUrl?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const session = await auth();
  if (session?.user) {
    redirect(APP.home);
  }

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
          <CardTitle className="text-2xl font-semibold">
            Sign in with GitHub
          </CardTitle>
          <CardDescription className="text-base">
            Then paste any commit log, or import GitHub / GitLab repos.
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
              Continue with GitHub
            </Button>
          </form>
          <p className="text-center text-sm text-muted-foreground">
            <Link
              href="/"
              className="text-primary underline-offset-4 transition-colors hover:underline"
            >
              Back to home
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
