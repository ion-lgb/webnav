import { db } from "@/lib/db"
import { sites } from "@/lib/db/schema"
import { eq, desc, sql, and, or, like } from "drizzle-orm"
import { PublicLayout } from "@/components/layout/public-layout"
import { SiteCard } from "@/components/site-card"
import { SitePagination } from "@/components/site-pagination"
import { Search } from "lucide-react"

const PAGE_SIZE = 24

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ keyword?: string; page?: string }>
}) {
  const params = await searchParams
  const keyword = params.keyword?.trim() || ""
  const currentPage = Math.max(1, parseInt(params.page || "1", 10) || 1)

  if (!keyword) {
    return (
      <PublicLayout>
        <div className="bg-white rounded-[var(--main-radius)] shadow-[var(--card-shadow)] p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
              <Search className="w-4 h-4 text-primary" />
            </div>
            <h2 className="text-[15px] font-semibold text-[var(--main-color)]">
              搜索
            </h2>
          </div>
          <div className="text-center py-12 text-[var(--muted-color)] text-sm">
            请输入搜索关键词
          </div>
        </div>
      </PublicLayout>
    )
  }

  const offset = (currentPage - 1) * PAGE_SIZE
  const likePattern = `%${keyword}%`

  const whereCondition = and(
    eq(sites.isPublic, 1),
    or(
      like(sites.title, likePattern),
      like(sites.description, likePattern),
      like(sites.url, likePattern)
    )
  )

  const [siteList, countResult] = await Promise.all([
    db
      .select()
      .from(sites)
      .where(whereCondition)
      .orderBy(desc(sites.clickCount))
      .limit(PAGE_SIZE)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)` })
      .from(sites)
      .where(whereCondition),
  ])

  const total = countResult[0]?.count ?? 0
  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <PublicLayout>
      <div className="bg-white rounded-[var(--main-radius)] shadow-[var(--card-shadow)] p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
            <Search className="w-4 h-4 text-primary" />
          </div>
          <h2 className="text-[15px] font-semibold text-[var(--main-color)]">
            搜索: {keyword}
          </h2>
          <span className="text-xs text-[var(--muted-color)] bg-[var(--body-bg)] px-2 py-0.5 rounded-full">
            {total}
          </span>
        </div>

        {siteList.length === 0 ? (
          <div className="text-center py-12 text-[var(--muted-color)] text-sm">
            未找到相关网站
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
              basePath="/search"
              queryParams={{ keyword }}
            />
          </>
        )}
      </div>
    </PublicLayout>
  )
}
