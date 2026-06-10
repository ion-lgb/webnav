import { NextResponse } from "next/server"
import { eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { settings } from "@/lib/db/schema"
import { auth } from "@/lib/auth"

export async function GET() {
  try {
    const session = await auth()
    if ((session?.user as { role?: string })?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const rows = await db.select().from(settings)
    const data: Record<string, string> = {}
    for (const row of rows) {
      data[row.key] = row.value ?? ""
    }

    return NextResponse.json({ data })
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const session = await auth()
    if ((session?.user as { role?: string })?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()

    for (const [key, value] of Object.entries(body)) {
      const existing = await db
        .select({ id: settings.id })
        .from(settings)
        .where(eq(settings.key, key))
        .limit(1)
        .then((rows) => rows[0])

      if (existing) {
        await db
          .update(settings)
          .set({ value: String(value) })
          .where(eq(settings.key, key))
      } else {
        await db.insert(settings).values({ key, value: String(value) })
      }
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
