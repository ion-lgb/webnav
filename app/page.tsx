import { db } from "@/lib/db"
import { categories, sites } from "@/lib/db/schema"
import { isNull, eq, asc, desc, and } from "drizzle-orm"
import { PublicLayout } from "@/components/layout/public-layout"
import { Banner } from "@/components/banner"
import { SiteCard } from "@/components/site-card"

export default async function Home() {
  const publicCategories = await db
    .select()
    .from(categories)
    .where(isNull(categories.userId))
    .orderBy(asc(categories.sortOrder))

  const categoriesWithSites = await Promise.all(
    publicCategories.map(async (cat) => {
      const catSites = await db
        .select()
        .from(sites)
        .where(eq(sites.categoryId, cat.id))
        .orderBy(asc(sites.sortOrder))
      return { ...cat, sites: catSites }
    })
  )

  const hotKeywords = await db
    .select({ title: sites.title })
    .from(sites)
    .where(and(eq(sites.isPublic, 1)))
    .orderBy(desc(sites.clickCount))
    .limit(6)

  return (
    <PublicLayout
      banner={<Banner hotKeywords={hotKeywords} />}
    >
      <div className="space-y-6">
        {categoriesWithSites.map((cat) => (
          <div
            key={cat.id}
            id={`cat-${cat.id}`}
            className="bg-white rounded-[var(--main-radius)] shadow-[var(--card-shadow)] p-5"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
                {cat.icon ? (
                  <span className={`${cat.icon} text-primary text-base`} />
                ) : (
                  <span className="text-primary text-base">📁</span>
                )}
              </div>
              <h2 className="text-[15px] font-semibold text-[var(--main-color)]">
                {cat.name}
              </h2>
              <span className="text-xs text-[var(--muted-color)] bg-[var(--body-bg)] px-2 py-0.5 rounded-full">
                {cat.sites.length}
              </span>
            </div>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-4">
              {cat.sites.map((site) => (
                <SiteCard
                  key={site.id}
                  id={site.id}
                  title={site.title}
                  url={site.url}
                  description={site.description}
                  iconUrl={site.iconUrl}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </PublicLayout>
  )
}
