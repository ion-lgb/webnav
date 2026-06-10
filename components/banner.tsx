"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Search } from "lucide-react"

interface BannerProps {
  hotKeywords?: { title: string }[]
}

const tabs = [
  { href: "/", label: "首页" },
  { href: "/newest", label: "最新" },
  { href: "/popular", label: "热门" },
]

export function Banner({ hotKeywords = [] }: BannerProps) {
  const [keyword, setKeyword] = useState("")
  const router = useRouter()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (keyword.trim()) {
      router.push(`/search?keyword=${encodeURIComponent(keyword.trim())}`)
    }
  }

  return (
    <div className="bg-gradient-to-br from-violet-600 via-violet-700 to-violet-900 py-16 pb-20">
      <div className="max-w-[var(--content-max-width)] mx-auto px-4 text-center">
        <nav className="flex items-center justify-center gap-6 mb-8">
          {tabs.map((tab, i) => (
            <Link
              key={tab.href}
              href={tab.href}
              className={`text-white/90 text-sm pb-1 border-b-2 transition-colors ${
                i === 0
                  ? "border-white font-semibold text-white"
                  : "border-transparent hover:border-white/60"
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </nav>

        <form onSubmit={handleSubmit} className="max-w-[520px] mx-auto mb-6">
          <div className="flex items-center bg-white rounded-full shadow-lg overflow-hidden">
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="搜索网站..."
              className="flex-1 px-5 py-3 text-sm bg-transparent outline-none text-[var(--main-color)] placeholder:text-gray-400"
            />
            <button
              type="submit"
              className="flex items-center justify-center w-11 h-11 m-1 rounded-full bg-primary text-white hover:opacity-90 transition-opacity shrink-0"
            >
              <Search className="h-4 w-4" />
            </button>
          </div>
        </form>

        {hotKeywords.length > 0 && (
          <div className="flex items-center justify-center flex-wrap gap-2">
            <span className="text-white/60 text-xs mr-1">热门搜索:</span>
            {hotKeywords.map((kw) => (
              <Link
                key={kw.title}
                href={`/search?keyword=${encodeURIComponent(kw.title)}`}
                className="px-3 py-1 text-xs text-white/90 bg-white/15 rounded-full backdrop-blur hover:bg-white/25 transition-colors"
              >
                {kw.title}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
