import { notFound } from "next/navigation"
import { db } from "@/lib/db"
import { categories, sites } from "@/lib/db/schema"
import { eq, asc, and, isNull } from "drizzle-orm"
import { PublicLayout } from "@/components/layout/public-layout"
import { SiteCard } from "@/components/site-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Folder } from "lucide-react"

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const categoryId = parseInt(id, 10)
  if (isNaN(categoryId)) notFound()

  const category = await db
    .select()
    .from(categories)
    .where(and(eq(categories.id, categoryId), isNull(categories.userId)))
    .limit(1)
    .then((rows) => rows[0])

  if (!category) notFound()

  const siteList = await db
    .select()
    .from(sites)
    .where(and(eq(sites.categoryId, categoryId), eq(sites.isPublic, 1)))
    .orderBy(asc(sites.sortOrder))

  return (
    <PublicLayout>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-7 h-7 rounded-md bg-primary/10">
              <Folder className="h-3.5 w-3.5 text-primary" />
            </div>
            <CardTitle className="text-base">{category.name}</CardTitle>
            <Badge variant="secondary" className="text-xs">{siteList.length}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {siteList.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm">
              该分类暂无网站
            </div>
          ) : (
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
          )}
        </CardContent>
      </Card>
    </PublicLayout>
  )
}
