import { db } from "@/lib/db"
import { users, sites, categories, feedbacks } from "@/lib/db/schema"
import { eq, sql } from "drizzle-orm"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Users, Globe, FolderTree, MessageSquare } from "lucide-react"

export default async function AdminDashboard() {
  const [userCount] = await db.select({ count: sql<number>`count(*)` }).from(users)
  const [siteCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(sites)
    .where(eq(sites.isPublic, 1))
  const [categoryCount] = await db.select({ count: sql<number>`count(*)` }).from(categories)
  const [feedbackCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(feedbacks)
    .where(eq(feedbacks.status, 0))

  const stats = [
    { label: "用户总数", value: userCount.count, icon: Users, color: "text-blue-500", bg: "bg-blue-50" },
    { label: "收录网站", value: siteCount.count, icon: Globe, color: "text-primary", bg: "bg-primary/5" },
    { label: "分类数量", value: categoryCount.count, icon: FolderTree, color: "text-indigo-500", bg: "bg-indigo-50" },
    { label: "待处理反馈", value: feedbackCount.count, icon: MessageSquare, color: "text-orange-500", bg: "bg-orange-50" },
  ]

  return (
    <div>
      <h1 className="text-xl font-semibold mb-5">管理后台</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label}>
              <CardHeader className="flex flex-row items-center justify-between">
                <span className="text-sm text-muted-foreground">{stat.label}</span>
                <div className={`${stat.bg} p-2 rounded-lg`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <span className="text-2xl font-bold">{stat.value}</span>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
