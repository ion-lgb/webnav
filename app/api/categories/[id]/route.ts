import { NextResponse } from "next/server"
import { eq, and } from "drizzle-orm"
import { db } from "@/lib/db"
import { categories, sites } from "@/lib/db/schema"
import { auth } from "@/lib/auth"

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = Number(session.user.id)
    const { id } = await params
    const categoryId = Number(id)

    const existing = await db
      .select({ id: categories.id })
      .from(categories)
      .where(and(eq(categories.id, categoryId), eq(categories.userId, userId)))
      .limit(1)
      .then((rows) => rows[0])

    if (!existing) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 })
    }

    await db.delete(sites).where(eq(sites.categoryId, categoryId))
    await db.delete(categories).where(eq(categories.id, categoryId))

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
