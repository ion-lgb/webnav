import { requireAuth } from "@/lib/auth-utils"
import { db } from "@/lib/db"
import { categories } from "@/lib/db/schema"
import { eq, asc } from "drizzle-orm"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { ImportForm } from "@/components/import-form"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"

export default async function ImportPage() {
  const user = await requireAuth()

  const userId = Number(user.id)

  const userCategories = await db
    .select({ id: categories.id, name: categories.name })
    .from(categories)
    .where(eq(categories.userId, userId))
    .orderBy(asc(categories.sortOrder))

  return (
    <>
      <Header />
      <main className="max-w-[600px] mx-auto px-5 pt-5 flex-1">
        <Card>
          <CardHeader>
            <CardTitle>导入书签</CardTitle>
            <CardDescription>
              从浏览器导出的书签 HTML 文件中批量导入书签
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ImportForm categories={userCategories} />
          </CardContent>
        </Card>
      </main>
      <Footer />
    </>
  )
}
