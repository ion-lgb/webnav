import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { sites } from "@/lib/db/schema"
import { desc } from "drizzle-orm"
import { auth } from "@/lib/auth"

export async function GET() {
  try {
    const session = await auth()
    if ((session?.user as { role?: string })?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const data = await db
      .select()
      .from(sites)
      .orderBy(desc(sites.createdAt))
      .limit(200)

    return NextResponse.json({ data })
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    if ((session?.user as { role?: string })?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const { userId, categoryId, title, url, description, iconUrl, isPublic, sortOrder } = body

    if (!title || !url || !userId || !categoryId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const now = new Date()
    const result = await db.insert(sites).values({
      userId,
      categoryId,
      title,
      url,
      description: description ?? null,
      iconUrl: iconUrl ?? null,
      isPublic: isPublic ?? 1,
      sortOrder: sortOrder ?? 0,
      clickCount: 0,
      createdAt: now,
      updatedAt: now,
    })

    return NextResponse.json({ success: true, id: result[0].insertId })
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
