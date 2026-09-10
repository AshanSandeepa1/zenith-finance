import type { NextAuthConfig } from "next-auth";

// Edge-safe config used by middleware — no Prisma adapter or DB-touching
// providers here (Prisma's Node engine doesn't run on the Edge runtime).
export const authConfig = {
  pages: {
    signIn: "/login",
  },
  providers: [],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith("/dashboard");

      if (isOnDashboard) return isLoggedIn;
      return true;
    },
  },
} satisfies NextAuthConfig;
