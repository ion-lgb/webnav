import Link from "next/link"
import { Compass } from "lucide-react"
import { desc, eq, sql } from "drizzle-orm"
import { db } from "@/lib/db"
import { sites } from "@/lib/db/schema"
import { PublicLayout } from "@/components/layout/public-layout"
import { SiteCard } from "@/components/site-card"
import { SitePagination } from "@/components/site-pagination"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

const PAGE_SIZE = 24

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string; page?: string }>
}) {
  const params = await searchParams
  const sort = params.sort === "popular" ? "popular" : "newest"
  const currentPage = Math.max(1, parseInt(params.page || "1", 10) || 1)
  const offset = (currentPage - 1) * PAGE_SIZE

  const [siteList, countResult] = await Promise.all([
    db
      .select()
      .from(sites)
      .where(eq(sites.isPublic, 1))
      .orderBy(sort === "popular" ? desc(sites.clickCount) : desc(sites.createdAt))
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
    <PublicLayout showSidebars={false} wideContent>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10">
                <Compass className="h-4 w-4 text-primary" />
              </div>
              <CardTitle className="text-base">发现网站</CardTitle>
              <Badge variant="secondary" className="text-xs">{total}</Badge>
            </div>
            <div className="flex items-center gap-1 rounded-lg bg-muted p-1">
              <Button size="sm" variant={sort === "newest" ? "secondary" : "ghost"} asChild>
                <Link href="/explore?sort=newest">最新收录</Link>
              </Button>
              <Button size="sm" variant={sort === "popular" ? "secondary" : "ghost"} asChild>
                <Link href="/explore?sort=popular">热门网站</Link>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {siteList.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">暂无收录的网站</div>
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
                basePath="/explore"
                queryParams={{ sort }}
              />
            </>
          )}
        </CardContent>
      </Card>
    </PublicLayout>
  )
}
