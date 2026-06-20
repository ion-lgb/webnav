import { notFound } from "next/navigation"
import { db } from "@/lib/db"
import { sites, categories } from "@/lib/db/schema"
import { eq, and, asc } from "drizzle-orm"
import { PublicLayout } from "@/components/layout/public-layout"
import { SiteCard } from "@/components/site-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Globe, Folder, ExternalLink, MousePointerClick } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default async function SiteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const siteId = parseInt(id, 10)
  if (isNaN(siteId)) notFound()

  const site = await db
    .select()
    .from(sites)
    .where(and(eq(sites.id, siteId), eq(sites.isPublic, 1)))
    .limit(1)
    .then((rows) => rows[0])

  if (!site) notFound()

  const category = await db
    .select()
    .from(categories)
    .where(eq(categories.id, site.categoryId))
    .limit(1)
    .then((rows) => rows[0])

  const relatedSites = await db
    .select()
    .from(sites)
    .where(and(eq(sites.categoryId, site.categoryId), eq(sites.isPublic, 1)))
    .orderBy(asc(sites.sortOrder))
    .limit(12)

  const hostname = (() => {
    try {
      return new URL(site.url).hostname
    } catch {
      return ""
    }
  })()

  const faviconSrc = site.iconUrl || `https://www.google.com/s2/favicons?domain=${hostname}&sz=64`

  return (
    <PublicLayout>
      <div className="space-y-5">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <Image
                src={faviconSrc}
                alt={site.title}
                width={56}
                height={56}
                className="rounded-xl shrink-0 bg-muted"
                unoptimized
              />
              <div className="flex-1 min-w-0">
                <h1 className="text-lg font-semibold text-foreground">{site.title}</h1>
                {site.description && (
                  <p className="text-sm text-muted-foreground mt-1">{site.description}</p>
                )}
                <div className="flex items-center gap-4 mt-3">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Globe className="w-3.5 h-3.5" />
                    <span className="truncate max-w-[300px]">{hostname}</span>
                  </div>
                  {category && (
                    <Link
                      href={`/category/${category.id}`}
                      className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Folder className="w-3.5 h-3.5" />
                      {category.name}
                    </Link>
                  )}
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <MousePointerClick className="w-3.5 h-3.5" />
                    {site.clickCount} 次访问
                  </div>
                </div>
              </div>
              <Button asChild className="shrink-0">
                <Link href={`/redirect?url=${encodeURIComponent(site.url)}`}>
                  <ExternalLink className="w-4 h-4 mr-1.5" />
                  访问网站
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {relatedSites.length > 1 && (
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-7 h-7 rounded-md bg-primary/10">
                  <Folder className="h-3.5 w-3.5 text-primary" />
                </div>
                <CardTitle className="text-base">同分类网站</CardTitle>
                <Badge variant="secondary" className="text-xs">{relatedSites.length}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-3">
                {relatedSites
                  .filter((s) => s.id !== site.id)
                  .map((s) => (
                    <SiteCard
                      key={s.id}
                      id={s.id}
                      title={s.title}
                      url={s.url}
                      description={s.description}
                      iconUrl={s.iconUrl}
                    />
                  ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </PublicLayout>
  )
}
