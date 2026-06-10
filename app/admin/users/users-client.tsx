"use client"

import { useState } from "react"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { DataTable, type Column } from "@/components/admin/data-table"

interface User {
  id: number
  username: string
  email: string
  role: string
  status: number
  createdAt: Date | null
}

export function UsersClient({ initialData }: { initialData: User[] }) {
  const [data, setData] = useState(initialData)

  async function handleDelete(item: User) {
    const res = await fetch(`/api/admin/users/${item.id}`, { method: "DELETE" })
    if (res.ok) {
      setData((prev) => prev.filter((u) => u.id !== item.id))
    }
  }

  async function toggleStatus(item: User) {
    const newStatus = item.status === 1 ? 0 : 1
    const res = await fetch(`/api/admin/users/${item.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    })
    if (res.ok) {
      setData((prev) =>
        prev.map((u) => (u.id === item.id ? { ...u, status: newStatus } : u))
      )
    }
  }

  const columns: Column<User>[] = [
    { key: "id", label: "ID" },
    { key: "username", label: "用户名" },
    { key: "email", label: "邮箱" },
    {
      key: "role",
      label: "角色",
      render: (item) =>
        item.role === "admin" ? (
          <Badge>admin</Badge>
        ) : (
          <Badge variant="secondary">user</Badge>
        ),
    },
    {
      key: "status",
      label: "状态",
      render: (item) =>
        item.status === 1 ? (
          <Badge variant="default">正常</Badge>
        ) : (
          <Badge variant="destructive">禁用</Badge>
        ),
    },
    {
      key: "createdAt",
      label: "创建时间",
      render: (item) =>
        item.createdAt ? format(item.createdAt, "yyyy-MM-dd HH:mm") : "-",
    },
  ]

  return (
    <DataTable columns={columns} data={data} onDelete={handleDelete} onEdit={toggleStatus} />
  )
}
