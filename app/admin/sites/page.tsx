import { db } from "@/lib/db"
import { sites } from "@/lib/db/schema"
import { desc } from "drizzle-orm"
import { SitesClient } from "./sites-client"

export default async function SitesPage() {
  const data = await db
    .select({
      id: sites.id,
      title: sites.title,
      url: sites.url,
      description: sites.description,
      iconUrl: sites.iconUrl,
      categoryId: sites.categoryId,
      userId: sites.userId,
      clickCount: sites.clickCount,
      isPublic: sites.isPublic,
      createdAt: sites.createdAt,
    })
    .from(sites)
    .orderBy(desc(sites.createdAt))
    .limit(200)

  return (
    <div>
      <h1 className="text-xl font-semibold text-[var(--main-color)] mb-5">网站管理</h1>
      <SitesClient initialData={data} />
    </div>
  )
}
