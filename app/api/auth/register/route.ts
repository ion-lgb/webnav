import { NextResponse } from "next/server"
import { z } from "zod/v4"
import bcrypt from "bcryptjs"
import { eq, or } from "drizzle-orm"
import { db } from "@/lib/db"
import { users } from "@/lib/db/schema"

const registerSchema = z.object({
  username: z.string().min(2).max(50),
  email: z.email(),
  password: z.string().min(6),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = registerSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.issues },
        { status: 400 }
      )
    }

    const { username, email, password } = parsed.data

    const existing = await db
      .select({ id: users.id })
      .from(users)
      .where(or(eq(users.username, username), eq(users.email, email)))
      .limit(1)
      .then((rows) => rows[0])

    if (existing) {
      return NextResponse.json(
        { error: "Username or email already exists" },
        { status: 409 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const now = new Date()

    const result = await db.insert(users).values({
      username,
      email,
      password: hashedPassword,
      role: "user",
      status: 1,
      createdAt: now,
      updatedAt: now,
    })

    return NextResponse.json(
      { message: "Registration successful", userId: result[0].insertId },
      { status: 201 }
    )
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
