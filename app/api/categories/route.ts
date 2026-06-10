import { NextResponse } from "next/server"
import { eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { categories } from "@/lib/db/schema"
import { auth } from "@/lib/auth"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = Number(session.user.id)

    const data = await db
      .select()
      .from(categories)
      .where(eq(categories.userId, userId))
      .orderBy(categories.sortOrder)

    return NextResponse.json({ data })
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = Number(session.user.id)
    const body = await request.json()
    const { name } = body

    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Category name is required" },
        { status: 400 }
      )
    }

    const now = new Date()
    const result = await db.insert(categories).values({
      name: name.trim(),
      userId,
      icon: "fas fa-folder",
      sortOrder: 0,
      createdAt: now,
      updatedAt: now,
    })

    return NextResponse.json({ success: true, id: result[0].insertId })
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
