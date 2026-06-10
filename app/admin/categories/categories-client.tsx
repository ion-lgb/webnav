"use client"

import { useState } from "react"
import { format } from "date-fns"
import { DataTable, type Column } from "@/components/admin/data-table"

interface Category {
  id: number
  name: string
  icon: string | null
  sortOrder: number
  userId: number | null
  createdAt: Date | null
}

function UserLabel({ userId }: { userId: number | null }) {
  if (!userId) return <span className="text-muted-foreground">public</span>
  return <span>user#{userId}</span>
}

export function CategoriesClient({ initialData }: { initialData: Category[] }) {
  const [data, setData] = useState(initialData)

  async function handleDelete(item: Category) {
    const res = await fetch(`/api/admin/categories/${item.id}`, { method: "DELETE" })
    if (res.ok) {
      setData((prev) => prev.filter((c) => c.id !== item.id))
    }
  }

  const columns: Column<Category>[] = [
    { key: "id", label: "ID" },
    { key: "name", label: "名称" },
    {
      key: "icon",
      label: "图标",
      render: (item) => item.icon ?? "-",
    },
    { key: "sortOrder", label: "排序" },
    {
      key: "userId",
      label: "用户",
      render: (item) => <UserLabel userId={item.userId} />,
    },
    {
      key: "createdAt",
      label: "创建时间",
      render: (item) =>
        item.createdAt ? format(item.createdAt, "yyyy-MM-dd HH:mm") : "-",
    },
  ]

  return <DataTable columns={columns} data={data} onDelete={handleDelete} />
}
