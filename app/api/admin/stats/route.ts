import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { users, sites, feedbacks } from "@/lib/db/schema"
import { auth } from "@/lib/auth"
import { sql, count, sum } from "drizzle-orm"

export async function GET() {
  try {
    const session = await auth()
    if ((session?.user as { role?: string })?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const [totalUsers] = await db
      .select({ count: count() })
      .from(users)

    const [totalSites] = await db
      .select({ count: count() })
      .from(sites)

    const [totalClicks] = await db
      .select({ count: sum(sites.clickCount) })
      .from(sites)

    const [totalFeedbacks] = await db
      .select({ count: count() })
      .from(feedbacks)

    const monthlySites = await db
      .select({
        month: sql<string>`DATE_FORMAT(created_at, '%Y-%m')`.as("month"),
        count: count(),
      })
      .from(sites)
      .where(sql`created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)`)
      .groupBy(sql`DATE_FORMAT(created_at, '%Y-%m')`)
      .orderBy(sql`DATE_FORMAT(created_at, '%Y-%m')`)

    const monthlyUsers = await db
      .select({
        month: sql<string>`DATE_FORMAT(created_at, '%Y-%m')`.as("month"),
        count: count(),
      })
      .from(users)
      .where(sql`created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)`)
      .groupBy(sql`DATE_FORMAT(created_at, '%Y-%m')`)
      .orderBy(sql`DATE_FORMAT(created_at, '%Y-%m')`)

    return NextResponse.json({
      totalUsers: totalUsers.count,
      totalSites: totalSites.count,
      totalClicks: totalClicks.count ?? 0,
      totalFeedbacks: totalFeedbacks.count,
      monthlySites,
      monthlyUsers,
    })
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
