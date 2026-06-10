import { db } from "@/lib/db"
import { feedbacks } from "@/lib/db/schema"
import { desc } from "drizzle-orm"
import { FeedbackClient } from "./feedback-client"

export default async function FeedbackPage() {
  const data = await db
    .select()
    .from(feedbacks)
    .orderBy(desc(feedbacks.createdAt))

  return (
    <div>
      <h1 className="text-xl font-semibold text-[var(--main-color)] mb-5">反馈管理</h1>
      <FeedbackClient initialData={data} />
    </div>
  )
}
