"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface BannerProps {
  hotKeywords?: { title: string }[]
}

const searchEngines = [
  { label: "Google", url: "https://www.google.com/search?q=" },
  { label: "Baidu", url: "https://www.baidu.com/s?wd=" },
  { label: "Bing", url: "https://www.bing.com/search?q=" },
  { label: "本站", url: null },
]

const tabs = [
  { href: "/", label: "首页" },
  { href: "/newest", label: "最新" },
  { href: "/popular", label: "热门" },
]

export function Banner({ hotKeywords = [] }: BannerProps) {
  const [keyword, setKeyword] = useState("")
  const [engineIdx, setEngineIdx] = useState(0) // default Google
  const router = useRouter()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!keyword.trim()) return
    const engine = searchEngines[engineIdx]
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
            <div className="relative flex-shrink-0">
              <select
                value={engineIdx}
                onChange={(e) => setEngineIdx(Number(e.target.value))}
                className="appearance-none h-full pl-4 pr-7 text-xs text-muted-foreground bg-transparent border-r border-border cursor-pointer outline-none"
              >
                {searchEngines.map((e, i) => (
                  <option key={e.label} value={i}>{e.label}</option>
                ))}
              </select>
              <svg className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </div>
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
