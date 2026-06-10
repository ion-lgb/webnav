"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Search, Globe } from "lucide-react"
import { Google, Baidu, Bing } from "@lobehub/icons"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface BannerProps {
  hotKeywords?: { title: string }[]
}

const engines = [
  { key: "google", url: "https://www.google.com/search?q=", icon: Google.Color },
  { key: "baidu", url: "https://www.baidu.com/s?wd=", icon: Baidu.Color },
  { key: "bing", url: "https://www.bing.com/search?q=", icon: Bing.Color },
  { key: "local", url: null, icon: Globe },
]

const tabs = [
  { href: "/", label: "首页" },
  { href: "/newest", label: "最新" },
  { href: "/popular", label: "热门" },
]

export function Banner({ hotKeywords = [] }: BannerProps) {
  const [keyword, setKeyword] = useState("")
  const [engineKey, setEngineKey] = useState("google")
  const router = useRouter()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!keyword.trim()) return
    const engine = engines.find((e) => e.key === engineKey)!
    if (engine.url) {
      window.open(`${engine.url}${encodeURIComponent(keyword.trim())}`, "_blank")
    } else {
      router.push(`/search?keyword=${encodeURIComponent(keyword.trim())}`)
    }
  }

  const ActiveIcon = engines.find((e) => e.key === engineKey)!.icon

  return (
    <div className="bg-gradient-to-br from-violet-600 via-violet-700 to-violet-900 py-16 pb-20">
      <div className="max-w-[var(--content-max-width)] mx-auto px-4 text-center">
        <nav className="flex items-center justify-center gap-6 mb-8">
          {tabs.map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              className="text-white/80 text-sm pb-1 border-b-2 border-transparent hover:border-white/50 hover:text-white transition-colors"
            >
              {tab.label}
            </Link>
          ))}
        </nav>

        <form onSubmit={handleSubmit} className="max-w-[560px] mx-auto mb-6">
          <div className="flex items-stretch bg-white rounded-full shadow-lg overflow-hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button type="button" className="p-2.5 hover:bg-muted/50 transition-colors">
                  <ActiveIcon size={18} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-12">
                {engines.map((engine) => {
                  const Icon = engine.icon
                  return (
                    <DropdownMenuItem
                      key={engine.key}
                      onClick={() => setEngineKey(engine.key)}
                      className="flex items-center justify-center cursor-pointer"
                    >
                      <Icon size={18} />
                    </DropdownMenuItem>
                  )
                })}
              </DropdownMenuContent>
            </DropdownMenu>
            <div className="w-px bg-border my-2" />
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="搜索内容..."
              className="flex-1 px-4 py-3 text-sm bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
            />
            <Button type="submit" size="icon" className="rounded-full m-1 shrink-0">
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </form>

        {hotKeywords.length > 0 && (
          <div className="flex items-center justify-center flex-wrap gap-2">
            <span className="text-white/60 text-xs mr-1">热门搜索:</span>
            {hotKeywords.map((kw) => (
              <Link key={kw.title} href={`/search?keyword=${encodeURIComponent(kw.title)}`}>
                <Badge variant="secondary" className="bg-white/15 text-white hover:bg-white/25 backdrop-blur cursor-pointer">
                  {kw.title}
                </Badge>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
