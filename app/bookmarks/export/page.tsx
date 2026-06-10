import Link from "next/link"
import { requireAuth } from "@/lib/auth-utils"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import { Download } from "lucide-react"

export default async function ExportPage() {
  await requireAuth()

  return (
    <>
      <Header />
      <main className="max-w-[600px] mx-auto px-5 pt-5 flex-1">
        <Card>
          <CardHeader>
            <CardTitle>导出书签</CardTitle>
            <CardDescription>
              将所有书签导出为 Netscape Bookmark HTML 格式，可导入到其他浏览器或书签管理工具
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button size="lg" asChild>
              <Link href="/api/bookmarks/export">
                <Download />
                下载书签文件
              </Link>
            </Button>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </>
  )
}
