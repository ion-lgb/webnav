import { db } from "@/lib/db"
import { pages } from "@/lib/db/schema"
import { PagesClient } from "./pages-client"

export default async function PagesPage() {
  const data = await db.select().from(pages)

  return (
    <div>
      <h1 className="text-xl font-semibold mb-5">页面管理</h1>
      <PagesClient initialData={data} />
    </div>
  )
}
