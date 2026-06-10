"use client"

import { useState } from "react"
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
import { Plus } from "lucide-react"

const categorySchema = z.object({
  name: z.string().min(1, "请输入分类名称"),
  icon: z.string().optional(),
  sortOrder: z.string().optional(),
})

type CategoryFormValues = z.infer<typeof categorySchema>

interface AddCategoryDialogProps {
  onSuccess: () => void
}

export function AddCategoryDialog({ onSuccess }: AddCategoryDialogProps) {
  const [open, setOpen] = useState(false)

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: "", icon: "", sortOrder: "0" },
  })

  async function onSubmit(data: CategoryFormValues) {
    const res = await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: data.name,
        icon: data.icon || null,
        sortOrder: parseInt(data.sortOrder || "0"),
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
          添加分类
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>添加分类</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem>
                <FormLabel>分类名称</FormLabel>
                <FormControl><Input placeholder="分类名称" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="icon" render={({ field }) => (
              <FormItem>
                <FormLabel>图标 class</FormLabel>
                <FormControl><Input placeholder="fa-wrench（选填）" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="sortOrder" render={({ field }) => (
              <FormItem>
                <FormLabel>排序</FormLabel>
                <FormControl><Input type="number" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <Button type="submit" className="w-full">添加</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
