import { db } from "@/lib/db"
import { pages } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { PublicLayout } from "@/components/layout/public-layout"

const defaultContent = `
  <h2>关于 WebNav</h2>
  <p>WebNav 是一个简洁的网址导航站，帮助你快速查找并访问常用网站和在线工具。</p>
  <h2>主要功能</h2>
  <ul>
    <li>按分类浏览公开网站</li>
    <li>使用站内搜索或常用搜索引擎</li>
    <li>按最新收录和热门程度发现网站</li>
    <li>通过反馈页面提交问题和建议</li>
  </ul>
  <h2>联系我们</h2>
  <p>如果你发现失效链接、内容错误或有收录建议，请通过反馈页面联系我们。</p>
`

export default async function AboutPage() {
  const page = await db
    .select()
    .from(pages)
    .where(eq(pages.slug, "about"))
    .limit(1)
    .then((rows) => rows[0])

  const title = page?.title || "关于我们"
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
