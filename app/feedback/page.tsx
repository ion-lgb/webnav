import { PublicLayout } from "@/components/layout/public-layout"
import { FeedbackForm } from "@/components/feedback-form"

export default function FeedbackPage() {
  return (
    <PublicLayout showSidebars={false}>
      <div className="bg-white rounded-[var(--main-radius)] shadow-[var(--card-shadow)] p-8">
        <h1 className="text-2xl font-bold text-[var(--main-color)] mb-2">
          意见反馈
        </h1>
        <p className="text-[var(--muted-color)] mb-6">
          有任何问题、建议或想法，欢迎在下方留言。
        </p>
        <FeedbackForm />
      </div>
    </PublicLayout>
  )
}
