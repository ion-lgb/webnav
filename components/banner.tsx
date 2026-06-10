"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Search, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

function GoogleIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  )
}

function BaiduIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="6" cy="8" r="2.5" fill="#2932E4"/>
      <circle cx="18" cy="8" r="2.5" fill="#2932E4"/>
      <circle cx="12" cy="16" r="3" fill="#DE2F2F"/>
      <circle cx="8.5" cy="13" r="2.5" fill="#2932E4"/>
      <circle cx="15.5" cy="13" r="2.5" fill="#2932E4"/>
    </svg>
  )
}

function BingIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M5 3L9.5 12L5 21H8.5L13 12L8.5 3H5Z" fill="#008373"/>
      <path d="M12 12L9 21H12.5L19 3C17 6 15 9 12 12Z" fill="#00A4EF"/>
    </svg>
  )
}

interface BannerProps {
  hotKeywords?: { title: string }[]
}

const engines = [
  { key: "google", url: "https://www.google.com/search?q=", icon: GoogleIcon },
  { key: "baidu", url: "https://www.baidu.com/s?wd=", icon: BaiduIcon },
  { key: "bing", url: "https://www.bing.com/search?q=", icon: BingIcon },
  { key: "local", url: null, icon: ({ size }: { size?: number }) => <Globe size={size} className="text-primary" /> },
]

const tabs = [
  { href: "/", label: "首页" },
  { href: "/newest", label: "最新" },
  { href: "/popular", label: "热门" },
]

export function Banner({ hotKeywords = [] }: BannerProps) {
  const [keyword, setKeyword] = useState("")
  const [engineIdx, setEngineIdx] = useState(0)
  const router = useRouter()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!keyword.trim()) return
    const engine = engines[engineIdx]
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
            <div className="flex items-center gap-0.5 pl-3 pr-1">
              {engines.map((engine, i) => {
                const Icon = engine.icon
                const isActive = i === engineIdx
                return (
                  <button
                    key={engine.key}
                    type="button"
                    title={engine.key === "local" ? "站内" : engine.key}
                    onClick={() => setEngineIdx(i)}
                    className={`p-1.5 rounded-md transition-colors ${isActive ? "bg-muted" : "hover:bg-muted/50 opacity-60 hover:opacity-100"}`}
                  >
                    <Icon size={16} />
                  </button>
                )
              })}
            </div>
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
