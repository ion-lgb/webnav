import { NextResponse } from "next/server"
import { eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { categories, sites } from "@/lib/db/schema"
import { auth } from "@/lib/auth"

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if ((session?.user as { role?: string })?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { id } = await params
    const categoryId = Number(id)
    const body = await request.json()
    const { name, userId, icon, sortOrder } = body

    const updateData: Record<string, unknown> = { updatedAt: new Date() }
    if (name !== undefined) updateData.name = name
    if (userId !== undefined) updateData.userId = userId
    if (icon !== undefined) updateData.icon = icon
    if (sortOrder !== undefined) updateData.sortOrder = sortOrder

    await db.update(categories).set(updateData).where(eq(categories.id, categoryId))
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if ((session?.user as { role?: string })?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { id } = await params
    const categoryId = Number(id)

    await db.delete(sites).where(eq(sites.categoryId, categoryId))
    await db.delete(categories).where(eq(categories.id, categoryId))

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
