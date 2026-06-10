import { requireAuth } from "@/lib/auth-utils"
import { db } from "@/lib/db"
import { categories, sites } from "@/lib/db/schema"
import { eq, asc } from "drizzle-orm"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { BookmarkManager } from "@/components/bookmark-manager"

export default async function BookmarksPage() {
  const user = await requireAuth()

  const userId = Number(user.id)

  const userCategories = await db
    .select()
    .from(categories)
    .where(eq(categories.userId, userId))
    .orderBy(asc(categories.sortOrder))

  const categoriesWithSites = await Promise.all(
    userCategories.map(async (cat) => {
      const catSites = await db
        .select()
        .from(sites)
        .where(eq(sites.categoryId, cat.id))
        .orderBy(asc(sites.sortOrder))
      return { ...cat, sites: catSites }
    })
  )

  return (
    <>
      <Header />
      <main className="max-w-[1360px] mx-auto px-5 pt-5 flex-1">
        <BookmarkManager initialData={categoriesWithSites} />
      </main>
      <Footer />
    </>
  )
}
