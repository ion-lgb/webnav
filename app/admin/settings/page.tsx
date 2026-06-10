import { db } from "@/lib/db"
import { settings } from "@/lib/db/schema"
import { SettingsClient } from "./settings-client"

export default async function SettingsPage() {
  const rows = await db.select().from(settings)
  const data: Record<string, string> = {}
  for (const row of rows) {
    data[row.key] = row.value ?? ""
  }

  return (
    <div>
      <h1 className="text-xl font-semibold text-[var(--main-color)] mb-5">站点设置</h1>
      <SettingsClient initialData={data} />
    </div>
  )
}
