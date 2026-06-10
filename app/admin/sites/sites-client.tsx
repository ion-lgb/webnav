"use client"

import { useState } from "react"
import { format } from "date-fns"
import { DataTable, type Column } from "@/components/admin/data-table"

interface Site {
  id: number
  title: string
  url: string
  clickCount: number
  isPublic: number
  createdAt: Date | null
}

function truncateUrl(url: string) {
  return url.length > 50 ? url.slice(0, 50) + "..." : url
}

export function SitesClient({ initialData }: { initialData: Site[] }) {
  const [data, setData] = useState(initialData)

  async function handleDelete(item: Site) {
    const res = await fetch(`/api/admin/sites/${item.id}`, { method: "DELETE" })
    if (res.ok) {
      setData((prev) => prev.filter((s) => s.id !== item.id))
    }
  }

  const columns: Column<Site>[] = [
    { key: "id", label: "ID" },
    { key: "title", label: "标题" },
    {
      key: "url",
      label: "URL",
      render: (item) => (
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          {truncateUrl(item.url)}
        </a>
      ),
    },
    { key: "clickCount", label: "点击数" },
    {
      key: "isPublic",
      label: "公开状态",
      render: (item) => (item.isPublic ? "公开" : "私有"),
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
