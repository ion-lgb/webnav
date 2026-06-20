import type { NextAuthConfig } from "next-auth"

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const { pathname } = nextUrl
      const isLoggedIn = !!auth?.user
      const isAdmin = (auth?.user as { role?: string } | undefined)?.role === "admin"

      if (pathname.startsWith("/admin")) {
        if (!isLoggedIn) return false
        return isAdmin
      }

      return true
    },
  },
  providers: [],
} satisfies NextAuthConfig
