import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { feedbacks } from "@/lib/db/schema"
import { auth } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, content } = body

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: "反馈内容不能为空" },
        { status: 400 }
      )
    }

    const session = await auth()
    const userId = session?.user?.id ? Number(session.user.id) : null
    const resolvedName =
      name?.trim() || (session?.user as { username?: string })?.username || "匿名"

    await db.insert(feedbacks).values({
      userId,
      name: resolvedName,
      email: email?.trim() || null,
      content: content.trim(),
      status: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json(
      { error: "服务器错误" },
      { status: 500 }
    )
  }
}
