import { db } from "@/lib/db"
import { pages } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { PublicLayout } from "@/components/layout/public-layout"

const defaultContent = `
  <p>更新日期：2026 年 6 月 21 日</p>
  <h2>我们收集的信息</h2>
  <ul>
    <li>访问外部网站时产生的站点、时间、来源页面和 IP 地址等点击记录。</li>
    <li>你主动提交反馈时填写的姓名、邮箱和反馈内容。</li>
    <li>管理员登录所需的账号信息、登录状态和安全验证记录。</li>
  </ul>
  <h2>信息用途</h2>
  <p>这些信息用于统计网站热度、处理反馈、维护服务安全和改进导航内容，不用于出售个人信息。</p>
  <h2>Cookie 与本地存储</h2>
  <p>登录功能会使用会话 Cookie；主题偏好可能保存在浏览器本地存储中。</p>
  <h2>数据安全</h2>
  <p>账号密码使用 bcrypt 单向哈希保存。我们会采取合理措施保护数据，但互联网传输无法保证绝对安全。</p>
  <h2>联系我们</h2>
  <p>如需查询、更正或删除你提交的信息，请通过反馈页面联系我们。</p>
`

export default async function PrivacyPage() {
  const page = await db
    .select()
    .from(pages)
    .where(eq(pages.slug, "privacy"))
    .limit(1)
    .then((rows) => rows[0])

  const title = page?.title || "隐私政策"
  const content = page?.content || defaultContent

  return (
    <PublicLayout showSidebars={false}>
      <div className="bg-card text-card-foreground rounded-[var(--main-radius)] border border-border shadow-[var(--card-shadow)] p-8">
        <h1 className="text-2xl font-bold text-foreground mb-6">
          {title}
        </h1>
        <div
          className="prose max-w-none text-foreground [&_a]:text-primary [&_h1]:text-foreground [&_h2]:text-foreground [&_h3]:text-foreground [&_h4]:text-foreground [&_li]:text-foreground [&_p]:text-foreground [&_strong]:text-foreground"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>
    </PublicLayout>
  )
}
