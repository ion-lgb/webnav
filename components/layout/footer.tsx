import Link from "next/link"
import { getSiteSettings } from "@/lib/settings"

export async function Footer() {
  const siteSettings = await getSiteSettings()

  return (
    <footer className="border-t bg-card mt-auto">
      <div className="max-w-[var(--content-max-width)] mx-auto px-4 py-6 flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} {siteSettings.site_name}
        </div>
        <nav className="flex items-center gap-6">
          <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            关于
          </Link>
          <Link href="/feedback" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            反馈
          </Link>
          <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            隐私政策
          </Link>
        </nav>
      </div>
    </footer>
  )
}
