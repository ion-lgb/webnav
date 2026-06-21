import { PublicLayout } from "@/components/layout/public-layout"
import { FeedbackForm } from "@/components/feedback-form"

export default function FeedbackPage() {
  return (
    <PublicLayout showSidebars={false}>
      <div className="mx-auto max-w-2xl bg-card text-card-foreground rounded-[var(--main-radius)] border border-border shadow-[var(--card-shadow)] p-6 sm:p-8">
        <h1 className="text-2xl font-bold text-foreground mb-2">
          意见反馈
        </h1>
        <p className="text-muted-foreground mb-6">
          有任何问题、建议或想法，欢迎在下方留言。
        </p>
        <FeedbackForm />
      </div>
    </PublicLayout>
  )
}
