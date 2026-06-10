import { NextResponse } from "next/server"
import { eq, asc } from "drizzle-orm"
import { db } from "@/lib/db"
import { sites, categories } from "@/lib/db/schema"
import { auth } from "@/lib/auth"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = Number(session.user.id)

    const userCategories = await db
      .select()
      .from(categories)
      .where(eq(categories.userId, userId))
      .orderBy(asc(categories.sortOrder))

    let html = `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
<TITLE>Bookmarks</TITLE>
<H1>Bookmarks</H1>
<DL><p>
`

    for (const cat of userCategories) {
      const catSites = await db
        .select()
        .from(sites)
        .where(eq(sites.categoryId, cat.id))
        .orderBy(asc(sites.sortOrder))

      html += `  <DT><H3>${escapeHtml(cat.name)}</H3>\n`
      html += `  <DL><p>\n`

      for (const site of catSites) {
        const timestamp = site.createdAt
          ? Math.floor(new Date(site.createdAt).getTime() / 1000)
          : 0
        html += `    <DT><A HREF="${escapeHtml(site.url)}" ADD_DATE="${timestamp}">${escapeHtml(site.title)}</A>\n`
      }

      html += `  </DL><p>\n`
    }

    html += `</DL><p>`

    return new Response(html, {
      headers: {
        "Content-Type": "text/html; charset=UTF-8",
        "Content-Disposition": 'attachment; filename="bookmarks.html"',
      },
    })
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}
