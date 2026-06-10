import { NextResponse } from "next/server"
import { eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { sites } from "@/lib/db/schema"
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
    const siteId = Number(id)
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

    await db.update(sites).set(updateData).where(eq(sites.id, siteId))
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
    const siteId = Number(id)

    await db.delete(sites).where(eq(sites.id, siteId))
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
