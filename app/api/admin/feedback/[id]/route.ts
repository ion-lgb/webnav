import { NextResponse } from "next/server"
import { eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { feedbacks } from "@/lib/db/schema"
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
    const feedbackId = Number(id)
    const body = await request.json()

    if (body.close) {
      await db
        .update(feedbacks)
        .set({ status: 2, updatedAt: new Date() })
        .where(eq(feedbacks.id, feedbackId))
    } else if (body.reply !== undefined) {
      await db
        .update(feedbacks)
        .set({
          reply: body.reply,
          repliedBy: session?.user?.id ? Number(session.user.id) : undefined,
          repliedAt: new Date(),
          status: 1,
          updatedAt: new Date(),
        })
        .where(eq(feedbacks.id, feedbackId))
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
