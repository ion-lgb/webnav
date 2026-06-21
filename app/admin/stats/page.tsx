import { db } from "@/lib/db"
import { users, sites, feedbacks } from "@/lib/db/schema"
import { sql, count, sum } from "drizzle-orm"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableHead,
} from "@/components/ui/table"
import { Users, Globe, MousePointerClick, MessageSquare } from "lucide-react"

export default async function StatsPage() {
  const [totalUsers] = await db.select({ count: count() }).from(users)
  const [totalSites] = await db.select({ count: count() }).from(sites)
  const [totalClicks] = await db
    .select({ count: sum(sites.clickCount) })
    .from(sites)
  const [totalFeedbacks] = await db
    .select({ count: count() })
    .from(feedbacks)

  const monthlySites = await db
    .select({
      month: sql<string>`DATE_FORMAT(created_at, '%Y-%m')`.as("month"),
      count: count(),
    })
    .from(sites)
    .where(sql`created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)`)
    .groupBy(sql`DATE_FORMAT(created_at, '%Y-%m')`)
    .orderBy(sql`DATE_FORMAT(created_at, '%Y-%m')`)

  const monthlyUsers = await db
    .select({
      month: sql<string>`DATE_FORMAT(created_at, '%Y-%m')`.as("month"),
      count: count(),
    })
    .from(users)
    .where(sql`created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)`)
    .groupBy(sql`DATE_FORMAT(created_at, '%Y-%m')`)
    .orderBy(sql`DATE_FORMAT(created_at, '%Y-%m')`)

  const stats = [
    { label: "用户总数", value: totalUsers.count, icon: Users, color: "text-blue-500", bg: "bg-blue-50" },
    { label: "网站总数", value: totalSites.count, icon: Globe, color: "text-primary", bg: "bg-primary/5" },
    { label: "点击总数", value: totalClicks.count ?? 0, icon: MousePointerClick, color: "text-indigo-500", bg: "bg-indigo-50" },
    { label: "反馈总数", value: totalFeedbacks.count, icon: MessageSquare, color: "text-orange-500", bg: "bg-orange-50" },
  ]

  return (
    <div>
      <h1 className="text-xl font-semibold text-foreground mb-5">数据统计</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
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

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <span className="font-medium">近6月新增网站</span>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>月份</TableHead>
                  <TableHead>数量</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {monthlySites.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center text-muted-foreground">
                      暂无数据
                    </TableCell>
                  </TableRow>
                ) : (
                  monthlySites.map((row) => (
                    <TableRow key={row.month}>
                      <TableCell>{row.month}</TableCell>
                      <TableCell>{row.count}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <span className="font-medium">近6月新增用户</span>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>月份</TableHead>
                  <TableHead>数量</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {monthlyUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center text-muted-foreground">
                      暂无数据
                    </TableCell>
                  </TableRow>
                ) : (
                  monthlyUsers.map((row) => (
                    <TableRow key={row.month}>
                      <TableCell>{row.month}</TableCell>
                      <TableCell>{row.count}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
