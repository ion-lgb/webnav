import { db } from "@/lib/db"
import { sites, categories } from "@/lib/db/schema"
import { desc, asc } from "drizzle-orm"
import { SitesClient } from "./sites-client"

export default async function SitesPage() {
  const [data, catData] = await Promise.all([
    db
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
      .limit(200),
    db
      .select({ id: categories.id, name: categories.name })
      .from(categories)
      .orderBy(asc(categories.sortOrder)),
  ])

  return (
    <div>
      <h1 className="text-xl font-semibold text-[var(--main-color)] mb-5">网站管理</h1>
      <SitesClient initialData={data} categories={catData} />
    </div>
  )
}
