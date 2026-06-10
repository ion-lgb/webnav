import { NextResponse } from "next/server"
import { eq, and } from "drizzle-orm"
import { db } from "@/lib/db"
import { sites, categories } from "@/lib/db/schema"
import { auth } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = Number(session.user.id)
    const formData = await request.formData()
    const file = formData.get("file") as File | null
    const categoryIdStr = formData.get("categoryId") as string | null

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    const text = await file.text()
    const categoryId = categoryIdStr ? Number(categoryIdStr) : 0

    if (categoryId > 0) {
      const category = await db
        .select({ id: categories.id })
        .from(categories)
        .where(and(eq(categories.id, categoryId), eq(categories.userId, userId)))
        .limit(1)
        .then((rows) => rows[0])

      if (!category) {
        return NextResponse.json({ error: "Category not found" }, { status: 404 })
      }

      const linkRegex = /<DT><A\s+([^>]*)>(.*?)<\/A>/gi
      let match: RegExpExecArray | null
      const now = new Date()
      let count = 0

      while ((match = linkRegex.exec(text)) !== null) {
        const attrs = match[1]
        const title = match[2]
        const hrefMatch = /HREF="([^"]*)"/i.exec(attrs)
        if (!hrefMatch) continue

        const url = hrefMatch[1]
        let iconUrl: string | null = null
        try {
          const hostname = new URL(url).hostname
          iconUrl = `https://www.google.com/s2/favicons?domain=${hostname}&sz=32`
        } catch {
          iconUrl = null
        }

        await db.insert(sites).values({
          userId,
          categoryId,
          title: title || url,
          url,
          iconUrl,
          isPublic: 0,
          clickCount: 0,
          sortOrder: count,
          createdAt: now,
          updatedAt: now,
        })
        count++
      }

      return NextResponse.json({ success: true, count })
    }

    const folderRegex = /<DT><H3[^>]*>(.*?)<\/H3>/gi
    const folderMatches: { name: string; index: number }[] = []
    let folderMatch: RegExpExecArray | null

    while ((folderMatch = folderRegex.exec(text)) !== null) {
      folderMatches.push({ name: folderMatch[1], index: folderMatch.index })
    }

    const now = new Date()
    let totalCount = 0

    for (let i = 0; i < folderMatches.length; i++) {
      const folder = folderMatches[i]
      const startIdx = folder.index
      const endIdx = i + 1 < folderMatches.length ? folderMatches[i + 1].index : text.length
      const section = text.slice(startIdx, endIdx)

      const result = await db.insert(categories).values({
        name: folder.name,
        userId,
        icon: "fas fa-folder",
        sortOrder: i,
        createdAt: now,
        updatedAt: now,
      })

      const newCategoryId = result[0].insertId

      const linkRegex = /<DT><A\s+([^>]*)>(.*?)<\/A>/gi
      let linkMatch: RegExpExecArray | null
      let linkCount = 0

      while ((linkMatch = linkRegex.exec(section)) !== null) {
        const attrs = linkMatch[1]
        const title = linkMatch[2]
        const hrefMatch = /HREF="([^"]*)"/i.exec(attrs)
        if (!hrefMatch) continue

        const url = hrefMatch[1]
        let iconUrl: string | null = null
        try {
          const hostname = new URL(url).hostname
          iconUrl = `https://www.google.com/s2/favicons?domain=${hostname}&sz=32`
        } catch {
          iconUrl = null
        }

        await db.insert(sites).values({
          userId,
          categoryId: newCategoryId,
          title: title || url,
          url,
          iconUrl,
          isPublic: 0,
          clickCount: 0,
          sortOrder: linkCount,
          createdAt: now,
          updatedAt: now,
        })
        linkCount++
      }

      totalCount += linkCount
    }

    return NextResponse.json({ success: true, count: totalCount })
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
