import { NextRequest, NextResponse } from "next/server"
import { eq, and, sql } from "drizzle-orm"
import { db } from "@/lib/db"
import { sites, clickLogs } from "@/lib/db/schema"
import { auth } from "@/lib/auth"

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url")

  if (!url) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  const session = await auth()
  const userId = session?.user?.id ? Number(session.user.id) : null
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || null
  const referer = request.headers.get("referer") || null

  const site = await db
    .select()
    .from(sites)
    .where(and(eq(sites.url, url), eq(sites.isPublic, 1)))
    .limit(1)
    .then((rows) => rows[0])

  if (site) {
    await Promise.all([
      db
        .update(sites)
        .set({ clickCount: sql`${sites.clickCount} + 1` })
        .where(eq(sites.id, site.id)),
      db.insert(clickLogs).values({
        siteId: site.id,
        userId,
        ip,
        referer,
        createdAt: new Date(),
      }),
    ])
  }

  return NextResponse.redirect(url)
}
