import Link from "next/link"
import { db } from "@/lib/db"
import { sites, categories } from "@/lib/db/schema"
import { count, desc, eq } from "drizzle-orm"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

function getRankVariant(index: number) {
  if (index === 0) return "destructive" as const
  if (index === 1) return "default" as const
  if (index === 2) return "secondary" as const
  return "outline" as const
}

export async function RightSidebar() {
  const [siteStats] = await db
    .select({ count: count() })
    .from(sites)
    .where(eq(sites.isPublic, 1))

  const [categoryStats] = await db
    .select({ count: count() })
    .from(categories)

  const hotSites = await db
    .select({
      id: sites.id,
      title: sites.title,
      url: sites.url,
      clickCount: sites.clickCount,
    })
    .from(sites)
    .where(eq(sites.isPublic, 1))
    .orderBy(desc(sites.clickCount))
    .limit(8)

  return (
    <aside className="hidden xl:block w-[var(--right-sidebar-width)] shrink-0">
      <div className="sticky top-[70px] space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">站点统计</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-2 bg-muted rounded-lg">
                <div className="text-xl font-bold text-primary">
                  {siteStats?.count ?? 0}
                </div>
                <div className="text-xs text-muted-foreground">收录站点</div>
              </div>
              <div className="text-center p-2 bg-muted rounded-lg">
                <div className="text-xl font-bold text-primary">
                  {categoryStats?.count ?? 0}
                </div>
                <div className="text-xs text-muted-foreground">分类数量</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {hotSites.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">热门网站</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1.5">
              {hotSites.map((site, index) => (
                <Link
                  key={site.id}
                  href={`/site/${site.id}`}
                  className="flex items-center gap-2 py-1 text-sm text-foreground hover:text-primary transition-colors"
                >
                  <Badge variant={getRankVariant(index)} className="w-5 h-5 flex items-center justify-center p-0 text-xs font-bold rounded">
                    {index + 1}
                  </Badge>
                  <span className="line1 flex-1">{site.title}</span>
                  <span className="text-xs text-muted-foreground shrink-0">{site.clickCount}</span>
                </Link>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </aside>
  )
}
