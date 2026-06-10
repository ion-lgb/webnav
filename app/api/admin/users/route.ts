import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { users } from "@/lib/db/schema"
import { desc } from "drizzle-orm"
import { auth } from "@/lib/auth"

export async function GET() {
  try {
    const session = await auth()
    if ((session?.user as { role?: string })?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const data = await db
      .select({
        id: users.id,
        username: users.username,
        email: users.email,
        role: users.role,
        avatar: users.avatar,
        status: users.status,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .orderBy(desc(users.createdAt))

    return NextResponse.json({ data })
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
