"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod/v4"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Plus, Wand2 } from "lucide-react"
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
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const siteSchema = z.object({
  url: z.url("请输入有效的URL"),
  title: z.string().min(1, "请输入网站名称"),
  description: z.string().optional(),
  categoryId: z.string().min(1, "请选择分类"),
  isPublic: z.boolean(),
})

type SiteFormValues = z.infer<typeof siteSchema>

export function AddSiteDialog({
  categories,
  onSuccess,
}: {
  categories: { id: number; name: string }[]
  onSuccess: () => void
}) {
  const [open, setOpen] = useState(false)
  const [fetching, setFetching] = useState(false)

  const form = useForm<SiteFormValues>({
    resolver: zodResolver(siteSchema),
    defaultValues: {
      url: "",
      title: "",
      description: "",
      categoryId: "",
      isPublic: false,
    },
  })

  async function fetchSiteMeta() {
    const url = form.getValues("url")
    if (!url) {
      toast.error("请先输入网站地址")
      return
    }
    setFetching(true)
    try {
      const res = await fetch(`/api/fetch-site-meta?url=${encodeURIComponent(url)}`)
      const result = await res.json()
      if (!res.ok) {
        toast.error(result.error || "获取信息失败")
        return
      }
      const { title, description } = result.data
      if (title) form.setValue("title", title)
      if (description) form.setValue("description", description)
      toast.success("信息已填充")
    } catch {
      toast.error("获取信息失败")
    } finally {
      setFetching(false)
    }
  }

  async function onSubmit(data: SiteFormValues) {
    try {
      const res = await fetch("/api/sites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: data.url,
          title: data.title,
          description: data.description || "",
          categoryId: parseInt(data.categoryId),
          isPublic: data.isPublic ? 1 : 0,
        }),
      })
      const result = await res.json()
      if (!res.ok) {
        toast.error(result.error || "添加失败")
        return
      }
      toast.success("网站添加成功")
      form.reset()
      setOpen(false)
      onSuccess()
    } catch {
      toast.error("网络错误，请稍后重试")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus />
          添加网站
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>添加网站</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>网站地址</FormLabel>
                  <FormControl>
                    <div className="flex gap-2">
                      <Input placeholder="https://example.com" {...field} />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={fetchSiteMeta}
                        disabled={fetching}
                      >
                        <Wand2 />
                        {fetching ? "获取中..." : "智能填充"}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>网站名称</FormLabel>
                  <FormControl>
                    <Input placeholder="请输入网站名称" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>描述（选填）</FormLabel>
                  <FormControl>
                    <Textarea placeholder="网站描述" rows={2} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>所属分类</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="请选择分类" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={String(cat.id)}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="isPublic"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between">
                  <FormLabel>公开可见</FormLabel>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="w-full"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? "添加中..." : "添加"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
