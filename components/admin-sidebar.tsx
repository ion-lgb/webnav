"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  FolderTree,
  Globe,
  FileText,
  Settings,
  MessageSquare,
  BarChart3,
} from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/admin", label: "仪表盘", icon: LayoutDashboard },
  { href: "/admin/categories", label: "分类管理", icon: FolderTree },
  { href: "/admin/sites", label: "网站管理", icon: Globe },
  { href: "/admin/pages", label: "页面管理", icon: FileText },
  { href: "/admin/settings", label: "站点设置", icon: Settings },
  { href: "/admin/feedback", label: "反馈管理", icon: MessageSquare },
  { href: "/admin/stats", label: "数据统计", icon: BarChart3 },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-full shrink-0 md:w-[var(--aside-width)]">
      <nav className="grid grid-cols-2 bg-white rounded-[var(--main-radius)] shadow-[var(--card-shadow)] border border-[var(--border-color)] py-3 sm:grid-cols-3 md:sticky md:top-[70px] md:block">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-[11px] text-sm transition-colors border-l-[3px]",
                isActive
                  ? "text-primary bg-primary/5 font-medium border-primary"
                  : "text-[var(--muted-color2)] border-transparent hover:text-primary hover:bg-primary/5"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
