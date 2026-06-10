"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod/v4"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { FolderPlus } from "lucide-react"
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
import { Button } from "@/components/ui/button"

const categorySchema = z.object({
  name: z.string().min(1, "请输入分类名称"),
  icon: z.string().optional(),
})

type CategoryFormValues = z.infer<typeof categorySchema>

export function AddCategoryDialog({ onSuccess }: { onSuccess: () => void }) {
  const [open, setOpen] = useState(false)

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      icon: "fas fa-folder",
    },
  })

  async function onSubmit(data: CategoryFormValues) {
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          icon: data.icon || "fas fa-folder",
        }),
      })
      const result = await res.json()
      if (!res.ok) {
        toast.error(result.error || "添加失败")
        return
      }
      toast.success("分类添加成功")
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
        <Button variant="outline">
          <FolderPlus />
          添加分类
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>添加分类</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>分类名称</FormLabel>
                  <FormControl>
                    <Input placeholder="请输入分类名称" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="icon"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>图标类名（选填）</FormLabel>
                  <FormControl>
                    <Input placeholder="fas fa-folder" {...field} />
                  </FormControl>
                  <FormMessage />
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
