import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { users } from "@/lib/db/schema"
import { authConfig } from "./auth.config"
import { checkLoginAttempt, recordFailedAttempt, clearAttempts } from "./login-guard"

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, request) {
        if (!credentials?.username || !credentials?.password) {
          return null
        }

        const ip =
          request?.headers?.get("x-forwarded-for")?.split(",")[0]?.trim() ||
          request?.headers?.get("x-real-ip") ||
          "unknown"

        const lockStatus = await checkLoginAttempt(ip)
        if (lockStatus.locked) {
          throw new Error("TOO_MANY_ATTEMPTS")
        }

        const username = credentials.username as string
        const password = credentials.password as string

        const user = await db
          .select()
          .from(users)
          .where(eq(users.username, username))
          .limit(1)
          .then((rows) => rows[0])

        if (!user) {
          await recordFailedAttempt(ip)
          return null
        }

        if (user.status !== 1) {
          await recordFailedAttempt(ip)
          return null
        }

        const passwordValid = await bcrypt.compare(password, user.password)
        if (!passwordValid) {
          await recordFailedAttempt(ip)
          return null
        }

        await clearAttempts(ip)

        return {
          id: String(user.id),
          name: user.username,
          email: user.email,
          role: user.role,
        }
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as { id: string; role: string }).role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        ;(session.user as { role?: string }).role = token.role as string
      }
      return session
    },
  },
})
