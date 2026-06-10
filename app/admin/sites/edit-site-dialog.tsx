"use client"

import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

interface Category {
  id: number
  name: string
}

const siteSchema = z.object({
  title: z.string().min(1, "请输入网站名称"),
  url: z.string().min(1, "请输入网址").url("请输入有效网址"),
  description: z.string().optional(),
  iconUrl: z.string().optional(),
  categoryId: z.string().min(1, "请选择分类"),
  userId: z.string().min(1, "请输入用户ID"),
  isPublic: z.boolean(),
})

type SiteFormValues = z.infer<typeof siteSchema>

interface Site {
  id: number
  title: string
  url: string
  description?: string | null
  iconUrl?: string | null
  categoryId?: number
  userId?: number
  isPublic: number
}

interface EditSiteDialogProps {
  site: Site
  categories: Category[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function EditSiteDialog({ site, categories, open, onOpenChange, onSuccess }: EditSiteDialogProps) {
  const form = useForm<SiteFormValues>({
    resolver: zodResolver(siteSchema),
    defaultValues: {
      title: site.title,
      url: site.url,
      description: site.description || "",
      iconUrl: site.iconUrl || "",
      categoryId: String(site.categoryId || categories[0]?.id || ""),
      userId: String(site.userId || 1),
      isPublic: site.isPublic === 1,
    },
  })

  async function onSubmit(data: SiteFormValues) {
    const res = await fetch(`/api/admin/sites/${site.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: data.title,
        url: data.url,
        description: data.description || null,
        iconUrl: data.iconUrl || null,
        categoryId: parseInt(data.categoryId),
        userId: parseInt(data.userId),
        isPublic: data.isPublic ? 1 : 0,
      }),
    })
    const result = await res.json()
    if (result.success) {
      toast.success("更新成功")
      onOpenChange(false)
      onSuccess()
    } else {
      toast.error(result.error || "更新失败")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>编辑网站</DialogTitle></DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="url" render={({ field }) => (
              <FormItem><FormLabel>网址</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="title" render={({ field }) => (
              <FormItem><FormLabel>网站名称</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="categoryId" render={({ field }) => (
                <FormItem>
                  <FormLabel>分类</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="选择分类" /></SelectTrigger></FormControl>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={String(cat.id)}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="userId" render={({ field }) => (
                <FormItem><FormLabel>用户 ID</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>
            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem><FormLabel>描述</FormLabel><FormControl><Textarea rows={2} {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="iconUrl" render={({ field }) => (
              <FormItem><FormLabel>图标 URL</FormLabel><FormControl><Input placeholder="https://..." {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="isPublic" render={({ field }) => (
              <FormItem className="flex items-center gap-2">
                <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                <FormLabel className="!mt-0">公开</FormLabel>
              </FormItem>
            )} />
            <Button type="submit" className="w-full">保存</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
