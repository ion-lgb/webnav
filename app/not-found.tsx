import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Home, Search } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <div className="text-7xl font-bold text-muted-foreground/30 mb-4">404</div>
      <h1 className="text-xl font-semibold text-foreground mb-2">页面未找到</h1>
      <p className="text-sm text-muted-foreground mb-8">
        你访问的页面不存在或已被移除
      </p>
      <div className="flex items-center gap-3">
        <Button asChild>
          <Link href="/">
            <Home className="w-4 h-4 mr-1.5" />
            返回首页
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/search">
            <Search className="w-4 h-4 mr-1.5" />
            搜索
          </Link>
        </Button>
      </div>
    </div>
  )
}
