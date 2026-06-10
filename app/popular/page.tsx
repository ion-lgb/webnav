import { db } from "@/lib/db"
import { sites } from "@/lib/db/schema"
import { eq, desc, sql } from "drizzle-orm"
import { PublicLayout } from "@/components/layout/public-layout"
import { SiteCard } from "@/components/site-card"
import { SitePagination } from "@/components/site-pagination"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-7 h-7 rounded-md bg-orange-100">
              <Flame className="w-4 h-4 text-orange-500" />
            </div>
            <CardTitle className="text-base">热门网站</CardTitle>
            <Badge variant="secondary" className="text-xs">{total}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {siteList.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm">
              暂无热门网站
            </div>
          ) : (
            <>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-3">
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
        </CardContent>
      </Card>
    </PublicLayout>
  )
}
