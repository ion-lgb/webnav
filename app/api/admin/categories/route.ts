import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { categories } from "@/lib/db/schema"
import { auth } from "@/lib/auth"

export async function GET() {
  try {
    const session = await auth()
    if ((session?.user as { role?: string })?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const data = await db.select().from(categories).orderBy(categories.sortOrder)
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
    const { name, userId, icon, sortOrder } = body

    if (!name || name.trim().length === 0) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    const now = new Date()
    const result = await db.insert(categories).values({
      name: name.trim(),
      userId: userId ?? null,
      icon: icon ?? "fas fa-folder",
      sortOrder: sortOrder ?? 0,
      createdAt: now,
      updatedAt: now,
    })

    return NextResponse.json({ success: true, id: result[0].insertId })
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
