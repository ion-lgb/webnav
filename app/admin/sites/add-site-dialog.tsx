"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Plus, Loader2, Search } from "lucide-react"

const siteSchema = z.object({
  title: z.string().min(1, "请输入网站名称"),
  url: z.string().min(1, "请输入网址").url("请输入有效网址"),
  description: z.string().optional(),
  iconUrl: z.string().optional(),
  categoryId: z.string().min(1, "请输入分类ID"),
  userId: z.string().min(1, "请输入用户ID"),
  isPublic: z.boolean(),
})

type SiteFormValues = z.infer<typeof siteSchema>

interface AddSiteDialogProps {
  onSuccess: () => void
}

export function AddSiteDialog({ onSuccess }: AddSiteDialogProps) {
  const [open, setOpen] = useState(false)
  const [fetching, setFetching] = useState(false)

  const form = useForm<SiteFormValues>({
    resolver: zodResolver(siteSchema),
    defaultValues: { title: "", url: "", description: "", iconUrl: "", categoryId: "1", userId: "1", isPublic: true },
  })

  async function fetchMeta() {
    const url = form.getValues("url")
    if (!url) return
    setFetching(true)
    try {
      const res = await fetch(`/api/fetch-site-meta?url=${encodeURIComponent(url)}`)
      const json = await res.json()
      if (json.data) {
        if (json.data.title) form.setValue("title", json.data.title)
        if (json.data.description) form.setValue("description", json.data.description)
        if (json.data.iconUrl) form.setValue("iconUrl", json.data.iconUrl)
        toast.success("已获取网站信息")
      }
    } catch { toast.error("获取失败") }
    finally { setFetching(false) }
  }

  async function onSubmit(data: SiteFormValues) {
    const res = await fetch("/api/admin/sites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...data,
        categoryId: parseInt(data.categoryId),
        userId: parseInt(data.userId),
        isPublic: data.isPublic ? 1 : 0,
      }),
    })
    const result = await res.json()
    if (result.success) {
      toast.success("添加成功")
      form.reset()
      setOpen(false)
      onSuccess()
    } else {
      toast.error(result.error || "添加失败")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="mr-1 h-4 w-4" />
          添加网站
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>添加网站</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="url" render={({ field }) => (
              <FormItem>
                <FormLabel>网址</FormLabel>
                <div className="flex gap-2">
                  <FormControl><Input placeholder="https://example.com" {...field} className="flex-1" /></FormControl>
                  <Button type="button" variant="outline" size="sm" onClick={fetchMeta} disabled={fetching}>
                    {fetching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                    智能填充
                  </Button>
                </div>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="title" render={({ field }) => (
              <FormItem>
                <FormLabel>网站名称</FormLabel>
                <FormControl><Input placeholder="网站名称" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem>
                <FormLabel>描述</FormLabel>
                <FormControl><Textarea placeholder="网站描述（选填）" rows={2} {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="iconUrl" render={({ field }) => (
              <FormItem>
                <FormLabel>图标 URL</FormLabel>
                <FormControl><Input placeholder="自动获取或手动输入" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="categoryId" render={({ field }) => (
                <FormItem><FormLabel>分类 ID</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="userId" render={({ field }) => (
                <FormItem><FormLabel>用户 ID</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>
            <FormField control={form.control} name="isPublic" render={({ field }) => (
              <FormItem className="flex items-center gap-2">
                <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                <FormLabel className="!mt-0">公开</FormLabel>
              </FormItem>
            )} />
            <Button type="submit" className="w-full">添加</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
