import { NextResponse } from "next/server"
import { z } from "zod"
import { eq, and } from "drizzle-orm"
import { db } from "@/lib/db"
import { sites, categories } from "@/lib/db/schema"
import { auth } from "@/lib/auth"

const createSiteSchema = z.object({
  title: z.string().min(1).max(100),
  url: z.url().max(500),
  description: z.string().max(255).optional(),
  iconUrl: z.string().max(500).optional(),
  categoryId: z.int().positive(),
  isPublic: z.union([z.literal(0), z.literal(1)]).default(0),
  sortOrder: z.int().default(0),
})

export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = Number(session.user.id)
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get("categoryId")

    const conditions = categoryId
      ? and(eq(sites.userId, userId), eq(sites.categoryId, Number(categoryId)))
      : eq(sites.userId, userId)

    const data = await db
      .select()
      .from(sites)
      .where(conditions)
      .orderBy(sites.sortOrder)

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
    const parsed = createSiteSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.issues },
        { status: 400 }
      )
    }

    const { title, url, description, iconUrl, categoryId, isPublic, sortOrder } = parsed.data

    const category = await db
      .select({ id: categories.id })
      .from(categories)
      .where(and(eq(categories.id, categoryId), eq(categories.userId, userId)))
      .limit(1)
      .then((rows) => rows[0])

    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 })
    }

    let resolvedIconUrl = iconUrl || null
    if (!resolvedIconUrl) {
      try {
        const hostname = new URL(url).hostname
        resolvedIconUrl = `https://www.google.com/s2/favicons?domain=${hostname}&sz=32`
      } catch {
        resolvedIconUrl = null
      }
    }

    const now = new Date()
    const result = await db.insert(sites).values({
      userId,
      categoryId,
      title,
      url,
      description: description || null,
      iconUrl: resolvedIconUrl,
      isPublic,
      sortOrder,
      clickCount: 0,
      createdAt: now,
      updatedAt: now,
    })

    return NextResponse.json({ success: true, id: result[0].insertId })
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
