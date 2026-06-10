"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"

interface SiteCardProps {
  id: number
  title: string
  url: string
  description?: string | null
  iconUrl?: string | null
}

function getHostname(url: string) {
  try {
    return new URL(url).hostname
  } catch {
    return ""
  }
}

export function SiteCard({ title, url, description, iconUrl }: SiteCardProps) {
  const hostname = getHostname(url)
  const [imgError, setImgError] = useState(false)
  const faviconSrc = iconUrl && !imgError
    ? iconUrl
    : `https://www.google.com/s2/favicons?domain=${hostname}&sz=32`

  return (
    <Link
      href={`/redirect?url=${encodeURIComponent(url)}`}
      className="flex items-center gap-3 p-3.5 rounded-xl bg-white border border-[var(--border-color)] hover:border-primary hover:shadow-[0_4px_12px_rgba(var(--theme-color-rgb),0.08)] hover:-translate-y-0.5 transition-all"
    >
      <Image
        src={faviconSrc}
        alt={title}
        width={40}
        height={40}
        className="rounded-[10px] shrink-0"
        onError={() => setImgError(true)}
        unoptimized
      />
      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold text-[var(--main-color)] line1">
          {title}
        </div>
        {description && (
          <div className="text-xs text-[var(--muted-color)] line1 mt-0.5">
            {description}
          </div>
        )}
      </div>
    </Link>
  )
}
