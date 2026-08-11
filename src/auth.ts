import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";

import {
  getAuthSecret,
  getGitHubClientId,
  getGitHubClientSecret,
} from "@/lib/env";
import { ensureUserProfile } from "@/lib/supabase/users";
import { sendWelcomeEmail } from "@/lib/email";

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  secret: getAuthSecret(),
  providers: [
    GitHub({
      clientId: getGitHubClientId(),
      clientSecret: getGitHubClientSecret(),
      authorization: {
        params: {
          scope: "read:user user:email repo",
        },
      },
    }),
  ],
  events: {
    async signIn({ user, isNewUser }) {
      if (user.id) {
        await ensureUserProfile({
          userId: user.id,
          email: user.email ?? null,
        });
        if (isNewUser && user.email) {
          await sendWelcomeEmail({ to: user.email, name: user.name });
        }
      }
    },
  },
  callbacks: {
    jwt({ token, account, profile }) {
      if (account?.access_token) {
        token.accessToken = account.access_token;
      }
      // GitHub numeric id as stable subject when present
      if (profile && "id" in profile && profile.id != null) {
        token.sub = String(profile.id);
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? session.user.id;
      }
      session.accessToken = token.accessToken;
      return session;
    },
  },
});
