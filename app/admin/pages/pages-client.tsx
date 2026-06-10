"use client"

import { useState } from "react"
import { toast } from "sonner"
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardAction,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { TipTapEditor } from "@/components/tiptap-editor"
import { Pencil } from "lucide-react"

interface Page {
  id: number
  slug: string
  title: string
  content: string
  updatedBy: number | null
  createdAt: Date | null
  updatedAt: Date | null
}

export function PagesClient({ initialData }: { initialData: Page[] }) {
  const [data, setData] = useState(initialData)
  const [editPage, setEditPage] = useState<Page | null>(null)
  const [editContent, setEditContent] = useState("")
  const [saving, setSaving] = useState(false)

  function openEdit(page: Page) {
    setEditPage(page)
    setEditContent(page.content)
  }

  async function handleSave() {
    if (!editPage) return
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/pages/${editPage.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: editContent }),
      })
      if (res.ok) {
        setData((prev) =>
          prev.map((p) =>
            p.id === editPage.id
              ? { ...p, content: editContent, updatedAt: new Date() }
              : p
          )
        )
        setEditPage(null)
        toast.success("页面已保存")
      } else {
        toast.error("保存失败")
      }
    } catch {
      toast.error("保存失败")
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <div className="grid gap-3">
        {data.map((page) => (
          <Card key={page.id}>
            <CardHeader>
              <CardTitle>{page.title}</CardTitle>
              <CardAction>
                <Button variant="ghost" size="icon-sm" onClick={() => openEdit(page)}>
                  <Pencil />
                </Button>
              </CardAction>
            </CardHeader>
            <CardContent>
              <span className="text-xs text-muted-foreground">/{page.slug}</span>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={!!editPage} onOpenChange={(open) => !open && setEditPage(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>编辑页面: {editPage?.title}</DialogTitle>
          </DialogHeader>
          <TipTapEditor content={editContent} onChange={setEditContent} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditPage(null)}>
              取消
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "保存中..." : "保存"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
