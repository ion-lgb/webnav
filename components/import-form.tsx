"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type Category = { id: number; name: string }

export function ImportForm({ categories }: { categories: Category[] }) {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [categoryId, setCategoryId] = useState<string>("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!file) {
      toast.error("请选择文件")
      return
    }

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      if (categoryId) {
        formData.append("categoryId", categoryId)
      }

      const res = await fetch("/api/bookmarks/import", {
        method: "POST",
        body: formData,
      })
      const result = await res.json()
      if (!res.ok) {
        toast.error(result.error || "导入失败")
        return
      }
      toast.success(`成功导入 ${result.count} 个书签`)
      router.push("/bookmarks")
      router.refresh()
    } catch {
      toast.error("网络错误，请稍后重试")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <label className="text-sm font-medium">选择书签文件</label>
        <Input
          type="file"
          accept=".html,.htm"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
        <p className="text-xs text-muted-foreground">
          支持 Netscape Bookmark HTML 格式（Chrome/Firefox/Edge 导出的书签文件）
        </p>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">导入到分类</label>
        <Select value={categoryId} onValueChange={setCategoryId}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="按原分类导入" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={String(cat.id)}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          不选择则按文件中的文件夹结构自动创建分类
        </p>
      </div>

      <Button type="submit" size="lg" disabled={loading || !file}>
        {loading ? (
          "导入中..."
        ) : (
          <>
            <Upload />
            开始导入
          </>
        )}
      </Button>
    </form>
  )
}
