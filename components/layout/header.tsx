import Link from "next/link"
import { getCurrentUser } from "@/lib/auth-utils"
import { getSiteSettings } from "@/lib/settings"
import { UserMenu } from "./user-menu"
import { HeaderNav } from "./header-nav"
import { ThemeToggle } from "@/components/theme-toggle"

export async function Header() {
  const [user, siteSettings] = await Promise.all([
    getCurrentUser(),
    getSiteSettings(),
  ])

  return (
    <header className="sticky top-0 z-50 h-[var(--nav-height)] bg-secondary/50 border-b backdrop-blur-sm">
      <div className="max-w-[var(--content-max-width)] mx-auto h-full px-4 flex items-center justify-between">
        <div className="flex items-center gap-3 md:gap-6">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg text-foreground shrink-0">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="14" cy="14" r="14" className="fill-primary" />
              <path d="M8 14L12 18L20 10" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {siteSettings.site_name}
          </Link>
          <HeaderNav />
        </div>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <UserMenu user={user} />
        </div>
      </div>
    </header>
  )
}
