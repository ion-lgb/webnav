import { NextResponse } from "next/server"
import { eq, and } from "drizzle-orm"
import { db } from "@/lib/db"
import { sites } from "@/lib/db/schema"
import { auth } from "@/lib/auth"

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = Number(session.user.id)
    const { id } = await params
    const siteId = Number(id)

    const existing = await db
      .select({ id: sites.id })
      .from(sites)
      .where(and(eq(sites.id, siteId), eq(sites.userId, userId)))
      .limit(1)
      .then((rows) => rows[0])

    if (!existing) {
      return NextResponse.json({ error: "Site not found" }, { status: 404 })
    }

    const body = await request.json()
    const { title, url, description, iconUrl, categoryId, isPublic, sortOrder } = body

    const updateData: Record<string, unknown> = { updatedAt: new Date() }
    if (title !== undefined) updateData.title = title
    if (url !== undefined) updateData.url = url
    if (description !== undefined) updateData.description = description
    if (iconUrl !== undefined) updateData.iconUrl = iconUrl
    if (categoryId !== undefined) updateData.categoryId = categoryId
    if (isPublic !== undefined) updateData.isPublic = isPublic
    if (sortOrder !== undefined) updateData.sortOrder = sortOrder

    await db
      .update(sites)
      .set(updateData)
      .where(and(eq(sites.id, siteId), eq(sites.userId, userId)))

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
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = Number(session.user.id)
    const { id } = await params
    const siteId = Number(id)

    const existing = await db
      .select({ id: sites.id })
      .from(sites)
      .where(and(eq(sites.id, siteId), eq(sites.userId, userId)))
      .limit(1)
      .then((rows) => rows[0])

    if (!existing) {
      return NextResponse.json({ error: "Site not found" }, { status: 404 })
    }

    await db
      .delete(sites)
      .where(and(eq(sites.id, siteId), eq(sites.userId, userId)))

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
