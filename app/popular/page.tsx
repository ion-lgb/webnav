import { db } from "@/lib/db"
import { sites } from "@/lib/db/schema"
import { eq, desc, sql } from "drizzle-orm"
import { PublicLayout } from "@/components/layout/public-layout"
import { SiteCard } from "@/components/site-card"
import { SitePagination } from "@/components/site-pagination"
import { Flame } from "lucide-react"

const PAGE_SIZE = 24

export default async function PopularPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const params = await searchParams
  const currentPage = Math.max(1, parseInt(params.page || "1", 10) || 1)
  const offset = (currentPage - 1) * PAGE_SIZE

  const [siteList, countResult] = await Promise.all([
    db
      .select()
      .from(sites)
      .where(eq(sites.isPublic, 1))
      .orderBy(desc(sites.clickCount))
      .limit(PAGE_SIZE)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)` })
      .from(sites)
      .where(eq(sites.isPublic, 1)),
  ])

  const total = countResult[0]?.count ?? 0
  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <PublicLayout>
      <div className="bg-white rounded-[var(--main-radius)] shadow-[var(--card-shadow)] p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-orange-50">
            <Flame className="w-4 h-4 text-orange-500" />
          </div>
          <h2 className="text-[15px] font-semibold text-[var(--main-color)]">
            热门网站
          </h2>
          <span className="text-xs text-[var(--muted-color)] bg-[var(--body-bg)] px-2 py-0.5 rounded-full">
            {total}
          </span>
        </div>

        {siteList.length === 0 ? (
          <div className="text-center py-12 text-[var(--muted-color)] text-sm">
            暂无热门网站
          </div>
        ) : (
          <>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-4">
              {siteList.map((site) => (
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
            <SitePagination
              currentPage={currentPage}
              totalPages={totalPages}
              basePath="/popular"
            />
          </>
        )}
      </div>
    </PublicLayout>
  )
}
