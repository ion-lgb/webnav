"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"

const navLinks = [
  { href: "/", label: "首页" },
  { href: "/explore", label: "发现" },
  { href: "/about", label: "关于" },
  { href: "/feedback", label: "反馈" },
]

export function HeaderNav() {
  const pathname = usePathname()
  const isExploreActive = pathname.startsWith("/explore")

  return (
    <>
      <nav className="flex items-center md:hidden">
        <Button variant={isExploreActive ? "secondary" : "ghost"} size="sm" asChild>
          <Link href="/explore">发现</Link>
        </Button>
      </nav>
      <nav className="hidden items-center gap-1 md:flex">
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
    </>
  )
}
