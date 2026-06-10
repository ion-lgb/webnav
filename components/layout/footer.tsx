import Link from "next/link"
import { Compass } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-white border-t border-[var(--border-color)] py-6 mt-auto">
      <div className="max-w-[var(--content-max-width)] mx-auto px-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-[var(--muted-color)]">
          <Compass className="h-4 w-4" />
          <span>© 2026 WebNav</span>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/about"
            className="text-sm text-[var(--muted-color)] hover:text-[var(--theme-color)]"
          >
            关于
          </Link>
          <Link
            href="/feedback"
            className="text-sm text-[var(--muted-color)] hover:text-[var(--theme-color)]"
          >
            反馈
          </Link>
          <Link
            href="/privacy"
            className="text-sm text-[var(--muted-color)] hover:text-[var(--theme-color)]"
          >
            隐私政策
          </Link>
        </div>
      </div>
    </footer>
  )
}
