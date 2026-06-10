"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  FolderTree,
  Globe,
  Users,
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
  { href: "/admin/users", label: "用户管理", icon: Users },
  { href: "/admin/pages", label: "页面管理", icon: FileText },
  { href: "/admin/settings", label: "站点设置", icon: Settings },
  { href: "/admin/feedback", label: "反馈管理", icon: MessageSquare },
  { href: "/admin/stats", label: "数据统计", icon: BarChart3 },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-56 shrink-0">
      <nav className="sticky top-[70px] bg-white rounded-xl ring-1 ring-foreground/10 p-2 space-y-0.5">
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
                "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors",
                isActive
                  ? "text-primary bg-primary/5 font-medium border-l-3 border-primary"
                  : "text-muted-foreground hover:text-primary hover:bg-primary/5"
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
