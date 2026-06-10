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
      className="flex items-center gap-3 p-3 rounded-lg bg-card border hover:border-primary hover:shadow-sm hover:-translate-y-0.5 transition-all"
    >
      <Image
        src={faviconSrc}
        alt={title}
        width={36}
        height={36}
        className="rounded-lg shrink-0 bg-muted"
        onError={() => setImgError(true)}
        unoptimized
      />
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium text-foreground line1">{title}</div>
        {description && (
          <div className="text-xs text-muted-foreground line1 mt-0.5">{description}</div>
        )}
      </div>
    </Link>
  )
}
