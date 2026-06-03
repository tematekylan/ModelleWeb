import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  trustHost: true,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;
      const user = auth?.user;

      if (pathname.startsWith("/admin")) {
        return user?.role === "ADMIN";
      }
      if (pathname.startsWith("/seller")) {
        return user?.role === "SELLER" || user?.role === "ADMIN";
      }
      if (pathname.startsWith("/dashboard") || pathname.startsWith("/checkout")) {
        return !!user;
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id!;
        token.role = user.role;
        token.emailVerified = user.emailVerified;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role;
        session.user.emailVerified = token.emailVerified as Date | null;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
