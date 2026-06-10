"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"

const navLinks = [
  { href: "/", label: "首页" },
  { href: "/newest", label: "最新" },
  { href: "/popular", label: "热门" },
  { href: "/about", label: "关于" },
  { href: "/feedback", label: "反馈" },
]

export function HeaderNav() {
  const pathname = usePathname()

  return (
    <nav className="hidden md:flex items-center gap-1">
      {navLinks.map((link) => {
        const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href))
        return (
          <Button
            key={link.href}
            variant={isActive ? "secondary" : "ghost"}
            size="sm"
            asChild
          >
            <Link href={link.href}>{link.label}</Link>
          </Button>
        )
      })}
    </nav>
  )
}
