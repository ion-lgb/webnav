import { PublicLayout } from "@/components/layout/public-layout"
import { RegisterForm } from "@/components/register-form"

export default function RegisterPage() {
  return (
    <PublicLayout showSidebars={false}>
      <RegisterForm />
    </PublicLayout>
  )
}
