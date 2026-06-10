import Link from "next/link"
import { Home, Clock, Flame, Folder } from "lucide-react"
import { db } from "@/lib/db"
import { categories } from "@/lib/db/schema"
import { isNull, asc } from "drizzle-orm"
import { Card, CardContent } from "@/components/ui/card"

const mainLinks = [
  { href: "/", label: "首页", icon: Home },
  { href: "/newest", label: "最新收录", icon: Clock },
  { href: "/popular", label: "热门网站", icon: Flame },
]

export async function LeftSidebar() {
  const publicCategories = await db
    .select()
    .from(categories)
    .where(isNull(categories.userId))
    .orderBy(asc(categories.sortOrder))

  return (
    <aside className="hidden lg:block w-[var(--aside-width)] shrink-0">
      <div className="sticky top-[70px]">
        <Card>
          <CardContent className="p-3 space-y-0.5">
            {mainLinks.map((link) => {
              const Icon = link.icon
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-3 px-3 py-2 text-sm text-foreground rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  {link.label}
                </Link>
              )
            })}

            {publicCategories.length > 0 && (
              <>
                <div className="my-2 mx-3 border-t" />
                {publicCategories.map((category) => (
                  <Link
                    key={category.id}
                    href={`/category/${category.id}`}
                    className="flex items-center gap-3 px-3 py-2 text-sm text-muted-foreground rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
                  >
                    <Folder className="h-4 w-4" />
                    {category.name}
                  </Link>
                ))}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </aside>
  )
}
