"use client"

import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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

const categorySchema = z.object({
  name: z.string().min(1, "请输入分类名称"),
  icon: z.string().optional(),
  sortOrder: z.string(),
})

type CategoryFormValues = z.infer<typeof categorySchema>

interface Category {
  id: number
  name: string
  icon: string | null
  sortOrder: number
}

interface EditCategoryDialogProps {
  category: Category
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function EditCategoryDialog({ category, open, onOpenChange, onSuccess }: EditCategoryDialogProps) {
  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: category.name,
      icon: category.icon || "",
      sortOrder: String(category.sortOrder),
    },
  })

  async function onSubmit(data: CategoryFormValues) {
    const res = await fetch(`/api/admin/categories/${category.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: data.name,
        icon: data.icon || null,
        sortOrder: parseInt(data.sortOrder),
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
        <DialogHeader><DialogTitle>编辑分类</DialogTitle></DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem><FormLabel>分类名称</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="icon" render={({ field }) => (
              <FormItem><FormLabel>图标 class</FormLabel><FormControl><Input placeholder="fa-wrench（选填）" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="sortOrder" render={({ field }) => (
              <FormItem><FormLabel>排序</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <Button type="submit" className="w-full">保存</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
