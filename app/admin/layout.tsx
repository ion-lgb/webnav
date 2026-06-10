import { requireAdmin } from "@/lib/auth-utils"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { AdminSidebar } from "@/components/admin-sidebar"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireAdmin()

  return (
    <>
      <Header />
      <div className="max-w-[1360px] mx-auto px-5 pt-5 flex gap-5 flex-1">
        <AdminSidebar />
        <main className="flex-1 min-w-0 bg-white rounded-[var(--main-radius)] shadow-[var(--card-shadow)] border border-[var(--border-color)] p-6">{children}</main>
      </div>
      <Footer />
    </>
  )
}
