"use client"

import { useState } from "react"
import { format } from "date-fns"
import { toast } from "sonner"
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardAction,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

interface Feedback {
  id: number
  userId: number | null
  name: string | null
  email: string | null
  content: string
  reply: string | null
  repliedBy: number | null
  repliedAt: Date | null
  status: number
  createdAt: Date | null
  updatedAt: Date | null
}

const statusMap: Record<number, { label: string; variant: "default" | "secondary" | "destructive" }> = {
  0: { label: "未回复", variant: "secondary" },
  1: { label: "已回复", variant: "default" },
  2: { label: "已关闭", variant: "destructive" },
}

export function FeedbackClient({ initialData }: { initialData: Feedback[] }) {
  const [data, setData] = useState(initialData)
  const [replyTexts, setReplyTexts] = useState<Record<number, string>>({})

  function setReplyText(id: number, text: string) {
    setReplyTexts((prev) => ({ ...prev, [id]: text }))
  }

  async function handleReply(item: Feedback) {
    const text = replyTexts[item.id]
    if (!text?.trim()) return

    const res = await fetch(`/api/admin/feedback/${item.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reply: text }),
    })
    if (res.ok) {
      setData((prev) =>
        prev.map((f) =>
          f.id === item.id
            ? { ...f, reply: text, status: 1, repliedAt: new Date() }
            : f
        )
      )
      setReplyTexts((prev) => ({ ...prev, [item.id]: "" }))
      toast.success("回复成功")
    } else {
      toast.error("回复失败")
    }
  }

  async function handleClose(item: Feedback) {
    const res = await fetch(`/api/admin/feedback/${item.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ close: true }),
    })
    if (res.ok) {
      setData((prev) =>
        prev.map((f) =>
          f.id === item.id ? { ...f, status: 2 } : f
        )
      )
      toast.success("已关闭")
    } else {
      toast.error("操作失败")
    }
  }

  function filterByStatus(status: number | null) {
    return status === null ? data : data.filter((f) => f.status === status)
  }

  function renderList(items: Feedback[]) {
    if (items.length === 0) {
      return (
        <p className="text-center py-10 text-muted-foreground">暂无数据</p>
      )
    }
    return (
      <div className="grid gap-3">
        {items.map((item) => {
          const st = statusMap[item.status] ?? statusMap[0]
          return (
            <Card key={item.id}>
              <CardHeader>
                <CardTitle className="text-sm">
                  {item.name ?? "匿名"}{" "}
                  {item.email && (
                    <span className="text-muted-foreground font-normal">
                      ({item.email})
                    </span>
                  )}
                </CardTitle>
                <CardAction>
                  <Badge variant={st.variant}>{st.label}</Badge>
                </CardAction>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm whitespace-pre-wrap">{item.content}</p>
                {item.reply && (
                  <div className="bg-muted/50 rounded-lg p-3 text-sm">
                    <span className="text-muted-foreground">回复: </span>
                    {item.reply}
                  </div>
                )}
                {item.status !== 2 && (
                  <div className="space-y-2">
                    <Textarea
                      placeholder="输入回复内容..."
                      value={replyTexts[item.id] ?? ""}
                      onChange={(e) => setReplyText(item.id, e.target.value)}
                      rows={2}
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleReply(item)}
                        disabled={!replyTexts[item.id]?.trim()}
                      >
                        回复
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleClose(item)}
                      >
                        关闭
                      </Button>
                    </div>
                  </div>
                )}
                {item.createdAt && (
                  <p className="text-xs text-muted-foreground">
                    {format(item.createdAt, "yyyy-MM-dd HH:mm")}
                  </p>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    )
  }

  return (
    <Tabs defaultValue="all">
      <TabsList>
        <TabsTrigger value="all">全部</TabsTrigger>
        <TabsTrigger value="pending">未回复</TabsTrigger>
        <TabsTrigger value="replied">已回复</TabsTrigger>
        <TabsTrigger value="closed">已关闭</TabsTrigger>
      </TabsList>
      <TabsContent value="all">{renderList(filterByStatus(null))}</TabsContent>
      <TabsContent value="pending">{renderList(filterByStatus(0))}</TabsContent>
      <TabsContent value="replied">{renderList(filterByStatus(1))}</TabsContent>
      <TabsContent value="closed">{renderList(filterByStatus(2))}</TabsContent>
    </Tabs>
  )
}
