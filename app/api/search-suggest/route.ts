import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { sites } from "@/lib/db/schema"
import { eq, and, or, like, desc } from "drizzle-orm"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const keyword = searchParams.get("keyword") || ""

  if (keyword.length < 1) {
    return NextResponse.json({ data: [] })
  }

  const pattern = `%${keyword}%`

  const results = await db
    .select({
      id: sites.id,
      title: sites.title,
      url: sites.url,
    })
    .from(sites)
    .where(
      and(
        eq(sites.isPublic, 1),
        or(like(sites.title, pattern), like(sites.description, pattern))
      )
    )
    .orderBy(desc(sites.clickCount))
    .limit(8)

  return NextResponse.json({ data: results })
}
