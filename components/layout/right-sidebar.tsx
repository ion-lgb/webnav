import Link from "next/link"
import { db } from "@/lib/db"
import { sites, categories } from "@/lib/db/schema"
import { count, desc, eq } from "drizzle-orm"

function getRankBadge(index: number) {
  if (index === 0) return "bg-red-500 text-white"
  if (index === 1) return "bg-orange-500 text-white"
  if (index === 2) return "bg-amber-500 text-white"
  return "bg-gray-300 text-gray-700"
}

export async function RightSidebar() {
  const [siteStats] = await db
    .select({ count: count() })
    .from(sites)
    .where(eq(sites.isPublic, 1))

  const [categoryStats] = await db
    .select({ count: count() })
    .from(categories)
    .where(eq(categories.userId, null as unknown as number))

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
        <div className="bg-white rounded-[var(--main-radius)] shadow-[var(--card-shadow)] p-4">
          <h3 className="text-sm font-semibold text-[var(--main-color)] mb-3">
            站点统计
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center p-2 bg-[var(--body-bg)] rounded-lg">
              <div className="text-xl font-bold text-[var(--theme-color)]">
                {siteStats?.count ?? 0}
              </div>
              <div className="text-xs text-[var(--muted-color)]">收录站点</div>
            </div>
            <div className="text-center p-2 bg-[var(--body-bg)] rounded-lg">
              <div className="text-xl font-bold text-[var(--theme-color)]">
                {categoryStats?.count ?? 0}
              </div>
              <div className="text-xs text-[var(--muted-color)]">分类数量</div>
            </div>
          </div>
        </div>

        {hotSites.length > 0 && (
          <div className="bg-white rounded-[var(--main-radius)] shadow-[var(--card-shadow)] p-4">
            <h3 className="text-sm font-semibold text-[var(--main-color)] mb-3">
              热门网站
            </h3>
            <div className="space-y-2">
              {hotSites.map((site, index) => (
                <Link
                  key={site.id}
                  href={`/site/${site.id}`}
                  className="flex items-center gap-2 py-1 hover:text-[var(--theme-color)] transition-colors"
                >
                  <span
                    className={`w-5 h-5 flex items-center justify-center text-xs font-bold rounded ${getRankBadge(index)}`}
                  >
                    {index + 1}
                  </span>
                  <span className="text-sm text-[var(--main-color)] line1 flex-1">
                    {site.title}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}
