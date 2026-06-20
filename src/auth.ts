import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";

import {
  getAuthSecret,
  getGitHubClientId,
  getGitHubClientSecret,
} from "@/lib/env";
import { ensureUserProfile } from "@/lib/supabase/users";

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
    async signIn({ user }) {
      if (user.id) {
        await ensureUserProfile({
          userId: user.id,
          email: user.email ?? null,
        });
      }
    },
  },
  callbacks: {
    jwt({ token, account }) {
      if (account?.access_token) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    session({ session, token }) {
      session.accessToken = token.accessToken;
      return session;
    },
  },
});
