import { ReactNode } from "react"
import { Header } from "./header"
import { Footer } from "./footer"
import { LeftSidebar } from "./left-sidebar"
import { RightSidebar } from "./right-sidebar"

interface PublicLayoutProps {
  children: ReactNode
  showSidebars?: boolean
  banner?: ReactNode
}

export function PublicLayout({
  children,
  showSidebars = true,
  banner,
}: PublicLayoutProps) {
  return (
    <>
      <Header />
      {banner}
      <div className="flex-1 max-w-[var(--content-max-width)] mx-auto w-full px-4 py-5 flex gap-5">
        {showSidebars ? (
          <>
            <LeftSidebar />
            <main className="flex-1 min-w-0">{children}</main>
            <RightSidebar />
          </>
        ) : (
          <main className="flex-1 max-w-4xl mx-auto w-full">{children}</main>
        )}
      </div>
      <Footer />
    </>
  )
}
