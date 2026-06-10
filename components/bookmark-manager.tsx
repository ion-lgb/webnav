"use client"

import { useState } from "react"
import Image from "next/image"
import { toast } from "sonner"
import { Trash2, ExternalLink } from "lucide-react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { AddCategoryDialog } from "@/components/add-category-dialog"
import { AddSiteDialog } from "@/components/add-site-dialog"

type Site = {
  id: number
  title: string
  url: string
  description: string | null
  iconUrl: string | null
  categoryId: number
}

type Category = {
  id: number
  name: string
  icon: string | null
  sites: Site[]
}

export function BookmarkManager({ initialData }: { initialData: Category[] }) {
  const [data, setData] = useState<Category[]>(initialData)

  async function refreshData() {
    try {
      const catRes = await fetch("/api/categories")
      const catResult = await catRes.json()
      if (!catRes.ok) return

      const categoriesWithSites = await Promise.all(
        catResult.data.map(async (cat: { id: number; name: string; icon: string | null }) => {
          const siteRes = await fetch(`/api/sites?categoryId=${cat.id}`)
          const siteResult = await siteRes.json()
          return { ...cat, sites: siteResult.data || [] }
        })
      )

      setData(categoriesWithSites)
    } catch {
      toast.error("刷新数据失败")
    }
  }

  async function deleteSite(siteId: number, categoryId: number) {
    try {
      const res = await fetch(`/api/sites/${siteId}`, { method: "DELETE" })
      if (!res.ok) {
        toast.error("删除失败")
        return
      }
      setData((prev) =>
        prev.map((cat) =>
          cat.id === categoryId
            ? { ...cat, sites: cat.sites.filter((s) => s.id !== siteId) }
            : cat
        )
      )
      toast.success("网站已删除")
    } catch {
      toast.error("删除失败")
    }
  }

  async function deleteCategory(categoryId: number) {
    try {
      const res = await fetch(`/api/categories/${categoryId}`, { method: "DELETE" })
      if (!res.ok) {
        toast.error("删除失败")
        return
      }
      setData((prev) => prev.filter((cat) => cat.id !== categoryId))
      toast.success("分类已删除")
    } catch {
      toast.error("删除失败")
    }
  }

  const categoryOptions = data.map((cat) => ({ id: cat.id, name: cat.name }))

  return (
    <div className="space-y-6 pb-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-[var(--main-color)]">我的书签</h1>
        <div className="flex items-center gap-2">
          <AddCategoryDialog onSuccess={refreshData} />
          <AddSiteDialog categories={categoryOptions} onSuccess={refreshData} />
        </div>
      </div>

      {data.length === 0 ? (
        <div className="text-center py-20 text-[var(--muted-color)]">
          暂无分类，请先添加分类
        </div>
      ) : (
        data.map((cat) => (
          <Card key={cat.id}>
            <CardHeader className="flex-row items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
                {cat.icon ? (
                  <span className={`${cat.icon} text-primary text-base`} />
                ) : (
                  <span className="text-primary text-base">📁</span>
                )}
              </div>
              <CardTitle className="flex-1">{cat.name}</CardTitle>
              <Badge variant="secondary">{cat.sites.length}</Badge>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="icon-sm">
                    <Trash2 />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>删除分类</AlertDialogTitle>
                    <AlertDialogDescription>
                      确定要删除分类「{cat.name}」吗？该分类下的所有网站也将被删除，此操作不可撤销。
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>取消</AlertDialogCancel>
                    <AlertDialogAction
                      variant="destructive"
                      onClick={() => deleteCategory(cat.id)}
                    >
                      删除
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardHeader>
            <CardContent>
              {cat.sites.length === 0 ? (
                <div className="text-center py-8 text-sm text-[var(--muted-color)]">
                  该分类下暂无网站
                </div>
              ) : (
                <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-3">
                  {cat.sites.map((site) => (
                    <div
                      key={site.id}
                      className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-primary/30 transition-colors"
                    >
                      {site.iconUrl ? (
                        <Image
                          src={site.iconUrl}
                          alt=""
                          width={20}
                          height={20}
                          className="w-5 h-5 rounded shrink-0"
                          unoptimized
                        />
                      ) : (
                        <div className="w-5 h-5 rounded bg-muted shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">
                          {site.title}
                        </div>
                        <div className="text-xs text-[var(--muted-color)] truncate">
                          {site.url}
                        </div>
                      </div>
                      <a
                        href={site.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 text-[var(--muted-color)] hover:text-primary transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        className="shrink-0 text-[var(--muted-color)] hover:text-destructive"
                        onClick={() => deleteSite(site.id, cat.id)}
                      >
                        <Trash2 />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )
}
