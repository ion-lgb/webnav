import { db } from "@/lib/db"
import { categories, sites } from "@/lib/db/schema"
import { isNull, eq, asc, desc, and } from "drizzle-orm"
import { PublicLayout } from "@/components/layout/public-layout"
import { Banner } from "@/components/banner"
import { SiteCard } from "@/components/site-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Folder } from "lucide-react"

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
          <Card key={cat.id} id={`cat-${cat.id}`}>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-7 h-7 rounded-md bg-primary/10">
                  <Folder className="h-3.5 w-3.5 text-primary" />
                </div>
                <CardTitle className="text-base">{cat.name}</CardTitle>
                <Badge variant="secondary" className="text-xs">{cat.sites.length}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-3">
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
            </CardContent>
          </Card>
        ))}
      </div>
    </PublicLayout>
  )
}
