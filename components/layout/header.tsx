import Link from "next/link"
import { Home, Clock, Flame, Info, MessageSquare } from "lucide-react"
import { getCurrentUser } from "@/lib/auth-utils"
import { UserMenu } from "./user-menu"

const navLinks = [
  { href: "/", label: "首页", icon: Home },
  { href: "/newest", label: "最新", icon: Clock },
  { href: "/popular", label: "热门", icon: Flame },
  { href: "/about", label: "关于", icon: Info },
  { href: "/feedback", label: "反馈", icon: MessageSquare },
]

export async function Header() {
  const user = await getCurrentUser()

  return (
    <header className="sticky top-0 z-50 h-[var(--nav-height)] bg-[#faf0ff] border-b border-[#f0e6f6]">
      <div className="max-w-[var(--content-max-width)] mx-auto h-full px-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <svg
              width="28"
              height="28"
              viewBox="0 0 28 28"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="14" cy="14" r="14" fill="var(--theme-color)" />
              <path
                d="M8 14L12 18L20 10"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="text-lg font-bold text-[var(--main-color)]">
              WebNav
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-[var(--main-color)] hover:text-[var(--theme-color)] hover:bg-white/50 rounded-md transition-colors"
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </Link>
              )
            })}
          </nav>
        </div>

        <UserMenu user={user} />
      </div>
    </header>
  )
}
