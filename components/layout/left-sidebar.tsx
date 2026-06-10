import Link from "next/link"
import { Home, Clock, Flame, Bookmark } from "lucide-react"
import { db } from "@/lib/db"
import { categories } from "@/lib/db/schema"
import { isNull, asc } from "drizzle-orm"
import { getCurrentUser } from "@/lib/auth-utils"

const mainLinks = [
  { href: "/", label: "首页", icon: Home },
  { href: "/newest", label: "最新收录", icon: Clock },
  { href: "/popular", label: "热门网站", icon: Flame },
]

export async function LeftSidebar() {
  const user = await getCurrentUser()

  const publicCategories = await db
    .select()
    .from(categories)
    .where(isNull(categories.userId))
    .orderBy(asc(categories.sortOrder))

  return (
    <aside className="hidden lg:block w-[var(--aside-width)] shrink-0">
      <div className="sticky top-[70px]">
        <div className="bg-white rounded-[var(--main-radius)] shadow-[var(--card-shadow)] p-4">
          <nav className="space-y-1">
            {mainLinks.map((link) => {
              const Icon = link.icon
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-[var(--main-color)] hover:text-[var(--theme-color)] hover:bg-[var(--body-bg)] rounded-md transition-colors"
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </Link>
              )
            })}
            {user && (
              <Link
                href="/bookmarks"
                className="flex items-center gap-2 px-3 py-2 text-sm text-[var(--main-color)] hover:text-[var(--theme-color)] hover:bg-[var(--body-bg)] rounded-md transition-colors"
              >
                <Bookmark className="h-4 w-4" />
                我的书签
              </Link>
            )}
          </nav>

          {publicCategories.length > 0 && (
            <>
              <div className="my-3 border-t border-[var(--border-color)]" />
              <nav className="space-y-1">
                {publicCategories.map((category) => (
                  <Link
                    key={category.id}
                    href={`/category/${category.id}`}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-[var(--main-color)] hover:text-[var(--theme-color)] hover:bg-[var(--body-bg)] rounded-md transition-colors"
                  >
                    {category.icon && (
                      <span className={category.icon} />
                    )}
                    {category.name}
                  </Link>
                ))}
              </nav>
            </>
          )}
        </div>
      </div>
    </aside>
  )
}
