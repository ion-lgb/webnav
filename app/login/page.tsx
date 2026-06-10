import { PublicLayout } from "@/components/layout/public-layout"
import { LoginForm } from "@/components/login-form"

export default function LoginPage() {
  return (
    <PublicLayout showSidebars={false}>
      <LoginForm />
    </PublicLayout>
  )
}
