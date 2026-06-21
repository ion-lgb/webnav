import { db } from "@/lib/db"
import { sites } from "@/lib/db/schema"
import { eq, desc, sql, and, or, like } from "drizzle-orm"
import { PublicLayout } from "@/components/layout/public-layout"
import { SiteCard } from "@/components/site-card"
import { SitePagination } from "@/components/site-pagination"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
      <PublicLayout showSidebars={false} wideContent>
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-7 h-7 rounded-md bg-primary/10">
                <Search className="w-4 h-4 text-primary" />
              </div>
              <CardTitle className="text-base">搜索</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-muted-foreground text-sm">
              请输入搜索关键词
            </div>
          </CardContent>
        </Card>
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
    <PublicLayout showSidebars={false} wideContent>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-7 h-7 rounded-md bg-primary/10">
              <Search className="w-4 h-4 text-primary" />
            </div>
            <CardTitle className="text-base">搜索: {keyword}</CardTitle>
            <Badge variant="secondary" className="text-xs">{total}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {siteList.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm">
              未找到相关网站
            </div>
          ) : (
            <>
              <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-3">
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
        </CardContent>
      </Card>
    </PublicLayout>
  )
}
