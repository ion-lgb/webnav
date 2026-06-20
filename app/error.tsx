"use client"

import { Button } from "@/components/ui/button"
import { RefreshCw, Home } from "lucide-react"
import Link from "next/link"

export default function Error({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <div className="text-7xl font-bold text-muted-foreground/30 mb-4">500</div>
      <h1 className="text-xl font-semibold text-foreground mb-2">服务器错误</h1>
      <p className="text-sm text-muted-foreground mb-8">
        服务器遇到了一个错误，请稍后再试
      </p>
      <div className="flex items-center gap-3">
        <Button onClick={reset}>
          <RefreshCw className="w-4 h-4 mr-1.5" />
          重试
        </Button>
        <Button variant="outline" asChild>
          <Link href="/">
            <Home className="w-4 h-4 mr-1.5" />
            返回首页
          </Link>
        </Button>
      </div>
    </div>
  )
}
