import { Suspense } from "react"
import { PublicLayout } from "@/components/layout/public-layout"
import { LoginForm } from "@/components/login-form"

export default function LoginPage() {
  return (
    <PublicLayout showSidebars={false}>
      <Suspense
        fallback={
          <div className="mx-auto max-w-md py-12 text-center text-sm text-muted-foreground">
            正在加载登录页面...
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </PublicLayout>
  )
}
