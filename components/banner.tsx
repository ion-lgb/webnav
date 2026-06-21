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
  { key: "google", label: "Google", url: "https://www.google.com/search?q=", icon: Google.Color },
  { key: "baidu", label: "百度", url: "https://www.baidu.com/s?wd=", icon: Baidu.Color },
  { key: "bing", label: "Bing", url: "https://www.bing.com/search?q=", icon: Bing.Color },
  { key: "local", label: "站内搜索", url: null, icon: Globe },
]

function getKeyword(title: string) {
  const parts = title
    .split(/\s+(?:[-–—|])\s+|[，,：:]/)
    .map((part) => part.trim())
    .filter(Boolean)

  const latinBrand = parts.find(
    (part) => /^[a-z0-9][a-z0-9 .+_-]*$/i.test(part) && part.length <= 20
  )
  const shortest = parts.reduce(
    (current, part) => (part.length < current.length ? part : current),
    parts[0] || title
  )
  const searchKeyword = latinBrand || shortest

  return {
    label: searchKeyword.length > 12 ? `${searchKeyword.slice(0, 12)}…` : searchKeyword,
    searchKeyword,
  }
}

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

  const activeEngine = engines.find((e) => e.key === engineKey)!
  const ActiveIcon = activeEngine.icon

  return (
    <div className="bg-[linear-gradient(135deg,#252936_0%,#3a3155_52%,#232631_100%)] py-12">
      <div className="max-w-[var(--content-max-width)] mx-auto px-4 text-center">
        <form onSubmit={handleSubmit} className="max-w-[560px] mx-auto mb-6">
          <div className="flex items-stretch bg-card text-card-foreground rounded-full border border-border shadow-lg overflow-hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="p-2.5 hover:bg-muted/50 transition-colors"
                  aria-label={`选择搜索引擎，当前为${activeEngine.label}`}
                >
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
                      aria-label={engine.label}
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
              aria-label="搜索内容"
              className="flex-1 px-4 py-3 text-sm bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
            />
            <Button type="submit" size="icon" className="rounded-full m-1 shrink-0" aria-label="搜索">
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </form>

        {hotKeywords.length > 0 && (
          <div className="flex items-center justify-center flex-wrap gap-2">
            <span className="text-white/60 text-xs mr-1">热门搜索:</span>
            {hotKeywords.map((kw) => {
              const { label, searchKeyword } = getKeyword(kw.title)
              return (
                <Link key={kw.title} href={`/search?keyword=${encodeURIComponent(searchKeyword)}`}>
                  <Badge variant="secondary" className="bg-white/15 text-white hover:bg-white/25 backdrop-blur cursor-pointer">
                    {label}
                  </Badge>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
