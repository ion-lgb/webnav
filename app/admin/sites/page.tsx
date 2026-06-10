import { db } from "@/lib/db"
import { sites } from "@/lib/db/schema"
import { desc } from "drizzle-orm"
import { SitesClient } from "./sites-client"

export default async function SitesPage() {
  const data = await db
    .select()
    .from(sites)
    .orderBy(desc(sites.createdAt))
    .limit(200)

  return (
    <div>
      <h1 className="text-xl font-semibold text-[var(--main-color)] mb-5">网站管理</h1>
      <SitesClient initialData={data} />
    </div>
  )
}
