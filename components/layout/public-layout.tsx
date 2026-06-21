import { ReactNode } from "react"
import { Header } from "./header"
import { Footer } from "./footer"
import { LeftSidebar } from "./left-sidebar"
import { RightSidebar } from "./right-sidebar"
import { getSiteSettings } from "@/lib/settings"

interface PublicLayoutProps {
  children: ReactNode
  showSidebars?: boolean
  wideContent?: boolean
  banner?: ReactNode
}

export async function PublicLayout({
  children,
  showSidebars = true,
  wideContent = false,
  banner,
}: PublicLayoutProps) {
  const siteSettings = await getSiteSettings()
  const showLeftSidebar = showSidebars && siteSettings.left_sidebar_enabled
  const showRightSidebar = showSidebars

  return (
    <>
      <Header />
      {siteSettings.banner_enabled && banner}
      <div className="flex-1 max-w-[var(--content-max-width)] mx-auto w-full px-4 py-5 flex gap-5">
        {showLeftSidebar || showRightSidebar ? (
          <>
            {showLeftSidebar && <LeftSidebar />}
            <main className="flex-1 min-w-0">{children}</main>
            {showRightSidebar && <RightSidebar />}
          </>
        ) : (
          <main className={wideContent ? "flex-1 min-w-0 w-full" : "flex-1 max-w-4xl mx-auto w-full"}>{children}</main>
        )}
      </div>
      {siteSettings.footer_enabled && <Footer />}
    </>
  )
}
