"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Search, Globe } from "lucide-react"
import { Google, Baidu, Bing } from "@lobehub/icons"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface BannerProps {
  hotKeywords?: { title: string }[]
}

const engines = [
  { key: "google", label: "Google", url: "https://www.google.com/search?q=", icon: Google },
  { key: "baidu", label: "百度", url: "https://www.baidu.com/s?wd=", icon: Baidu },
  { key: "bing", label: "Bing", url: "https://www.bing.com/search?q=", icon: Bing },
  { key: "local", label: "站内", url: null, icon: ({ size }: { size?: number }) => <Globe size={size} /> },
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
            <Select value={engineKey} onValueChange={setEngineKey}>
              <SelectTrigger className="w-auto min-w-[85px] border-0 shadow-none bg-transparent rounded-none h-auto px-3 py-0 text-xs gap-1.5 focus:ring-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {engines.map((engine) => {
                  const Icon = engine.icon
                  return (
                    <SelectItem key={engine.key} value={engine.key}>
                      <span className="flex items-center gap-2">
                        <Icon size={14} />
                        {engine.label}
                      </span>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
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
