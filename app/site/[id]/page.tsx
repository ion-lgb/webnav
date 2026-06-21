import { notFound, redirect } from "next/navigation"
import { db } from "@/lib/db"
import { sites } from "@/lib/db/schema"
import { eq, and } from "drizzle-orm"

export default async function SiteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const siteId = parseInt(id, 10)
  if (isNaN(siteId)) notFound()

  const site = await db
    .select()
    .from(sites)
    .where(and(eq(sites.id, siteId), eq(sites.isPublic, 1)))
    .limit(1)
    .then((rows) => rows[0])

  if (!site) notFound()

  redirect(`/redirect?url=${encodeURIComponent(site.url)}`)
}
