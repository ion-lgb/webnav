import { NextResponse } from "next/server"
import { eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { pages } from "@/lib/db/schema"
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
    const pageId = Number(id)
    const body = await request.json()
    const { content, updatedBy } = body

    await db
      .update(pages)
      .set({
        content,
        updatedBy: updatedBy ? Number(updatedBy) : undefined,
        updatedAt: new Date(),
      })
      .where(eq(pages.id, pageId))

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
