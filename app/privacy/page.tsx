import { db } from "@/lib/db"
import { pages } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { PublicLayout } from "@/components/layout/public-layout"

export default async function PrivacyPage() {
  const page = await db
    .select()
    .from(pages)
    .where(eq(pages.slug, "privacy"))
    .limit(1)
    .then((rows) => rows[0])

  const title = page?.title || "隐私政策"
  const content = page?.content || ""

  return (
    <PublicLayout showSidebars={false}>
      <div className="bg-white rounded-[var(--main-radius)] shadow-[var(--card-shadow)] p-8">
        <h1 className="text-2xl font-bold text-[var(--main-color)] mb-6">
          {title}
        </h1>
        <div
          className="prose max-w-none text-[var(--text-color)]"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>
    </PublicLayout>
  )
}
