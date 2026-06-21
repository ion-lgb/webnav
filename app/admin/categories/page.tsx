import { db } from "@/lib/db"
import { categories } from "@/lib/db/schema"
import { CategoriesClient } from "./categories-client"

export default async function CategoriesPage() {
  const data = await db.select().from(categories).orderBy(categories.sortOrder)

  return (
    <div>
      <h1 className="text-xl font-semibold text-foreground mb-5">分类管理</h1>
      <CategoriesClient initialData={data} />
    </div>
  )
}
