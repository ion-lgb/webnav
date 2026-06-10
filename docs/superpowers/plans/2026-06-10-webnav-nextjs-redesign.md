# WebNav Next.js 重构实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 ThinkPHP 8 个人网址导航网站重构为 Next.js 16 全栈应用，使用 shadcn/ui 组件库，保留现有 MySQL 数据库。

**Architecture:** Next.js App Router + Server Components 负责 SEO 页面渲染，Client Components 处理交互，Route Handlers 提供 API，Middleware 处理路由守卫。Drizzle ORM 连接现有 MySQL 表，Auth.js v5 处理认证。

**Tech Stack:** Next.js 16, React 19, shadcn/ui, Tailwind CSS v4, Drizzle ORM, Auth.js v5, TipTap, dnd-kit, React Hook Form + Zod

---

## Phase 1: 项目脚手架

### Task 1: 初始化 Next.js 项目

**Files:**
- Create: `package.json`, `next.config.ts`, `tsconfig.json`, `.env.local`, `.gitignore`

- [ ] **Step 1: 备份 PHP 代码到临时分支**
```bash
git checkout -b backup-php && git checkout main
```

- [ ] **Step 2: 清理当前目录（保留 database/、.env*、.git、docs/、screenshot_*.png）**
```bash
rm -rf app/ config/ extend/ public/ route/ runtime/ vendor/ view/ src/
rm -f composer.json composer.lock think .travis.yml LICENSE.txt
rm -f app.css tailwind.config.js package.json package-lock.json
rm -rf node_modules/
```

- [ ] **Step 3: 初始化 Next.js 16**
```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*" --use-npm --yes
```

- [ ] **Step 4: 安装核心依赖**
```bash
npm install drizzle-orm mysql2 next-auth@beta @auth/drizzle-adapter bcryptjs zod react-hook-form @hookform/resolvers
npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-image @tiptap/extension-link @tiptap/extension-placeholder @tiptap/pm
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
npm install lucide-react sonner date-fns
npm install -D drizzle-kit @types/bcryptjs
```

- [ ] **Step 5: 初始化 shadcn/ui**
```bash
npx shadcn@latest init
# Style: New York, Base: Neutral, CSS variables: Yes
```

- [ ] **Step 6: 安装 shadcn 组件**
```bash
npx shadcn@latest add button input label card form select textarea table badge dialog alert-dialog dropdown-menu navigation-menu tabs separator avatar toast sonner pagination sheet command popover tooltip scroll-area skeleton switch
```

- [ ] **Step 7: 配置 .env.local**
```env
DATABASE_URL=mysql://root:@localhost:3306/webnav
AUTH_SECRET=webnav-dev-secret-key-change-in-production
NEXTAUTH_URL=http://localhost:3000
```

- [ ] **Step 8: 验证 `npm run dev` 启动成功**

- [ ] **Step 9: 提交**
```bash
git add -A && git commit -m "chore: initialize Next.js 16 project with shadcn/ui"
```

---

### Task 2: 配置 Tailwind 主题

**Files:**
- Modify: `app/globals.css`

- [ ] **Step 1: 替换 CSS 变量**

覆盖 shadcn 默认变量，设置橙色主题 (`--primary: 24 95% 53%`)，添加自定义变量：
- `--theme-color: #e8590c`, `--theme-color-rgb: 232, 89, 12`, `--hover-color: #d1470b`
- `--body-bg: #f8f9fc`, `--main-color: #1a1a2e`, `--muted-color: #8b8fa3`
- `--border-color: #ebeef5`, `--card-shadow`, `--main-radius: 12px`
- `--content-max-width: 1360px`, `--aside-width: 200px`, `--right-sidebar-width: 280px`
- body: `bg-[var(--body-bg)]`, Inter font family
- 添加 `.line1` (truncate) 和 `.line2` (2-line clamp) 工具类

- [ ] **Step 2: 提交**
```bash
git add app/globals.css && git commit -m "style: configure Tailwind theme with orange primary color"
```

---

## Phase 2: 数据库层

### Task 3: Drizzle ORM 配置与 Schema

**Files:**
- Create: `lib/db/index.ts`, `lib/db/schema.ts`, `drizzle.config.ts`

- [ ] **Step 1: 创建 `drizzle.config.ts`**
- dialect: mysql, schema: ./lib/db/schema.ts, out: ./drizzle

- [ ] **Step 2: 创建 `lib/db/index.ts`**
- mysql2/promise createPool + drizzle(pool, { schema, mode: 'default' })

- [ ] **Step 3: 创建 `lib/db/schema.ts`**
- 8 张表: users, categories, sites, favorites, feedbacks, pages, clickLogs, loginAttempts, settings
- 所有字段映射现有 wn_ 前缀表，使用 mysqlTable + 索引定义
- 参考 `database/install.sql` 中的表结构

- [ ] **Step 4: 验证数据库连接**
```bash
npx tsx -e "import {db} from './lib/db'; import {users} from './lib/db/schema'; db.select().from(users).limit(1).then(r => console.log('OK:', r.length))"
```

- [ ] **Step 5: 提交**
```bash
git add -A && git commit -m "feat: add Drizzle ORM schema for existing MySQL tables"
```

---

## Phase 3: 认证系统

### Task 4: Auth.js v5 配置

**Files:**
- Create: `lib/auth.ts`, `lib/auth-utils.ts`, `lib/login-guard.ts`
- Create: `app/api/auth/[...nextauth]/route.ts`
- Create: `middleware.ts`

- [ ] **Step 1: 创建 `lib/auth.ts`**
- NextAuth + Credentials Provider
- authorize(): 查 wn_users 表，bcrypt.compare 验证密码，检查 status=1
- session strategy: jwt
- callbacks: jwt 注入 id+role, session 注入 id+role
- pages.signIn: '/login'

- [ ] **Step 2: 创建 `lib/auth-utils.ts`**
- getSession(), getCurrentUser(), requireAuth() (redirect /login), requireAdmin() (redirect /)

- [ ] **Step 3: 创建 `app/api/auth/[...nextauth]/route.ts`**
- export { GET, POST } = handlers

- [ ] **Step 4: 创建 `middleware.ts`**
- /bookmarks/* → 需登录
- /admin/* → 需 admin role

- [ ] **Step 5: 创建 `lib/login-guard.ts`**
- checkLoginAttempt(ip): 检查 wn_login_attempts 表锁定状态
- recordFailedAttempt(ip): 增加尝试次数
- clearAttempts(ip): 登录成功后清除
- 逻辑与现有 Auth.php 一致：5次失败/5分钟 → 锁定15分钟

- [ ] **Step 6: 创建注册 API `app/api/auth/register/route.ts`**
- POST: Zod 校验 (username 2-50, email valid, password 6+)
- 检查用户名/邮箱唯一性
- bcrypt.hash(password, 10) 后插入 users 表

- [ ] **Step 7: 提交**
```bash
git add -A && git commit -m "feat: add Auth.js v5 with credentials provider and login guard"
```

---

## Phase 4: 布局组件

### Task 5: Header + Footer + Sidebar 组件

**Files:**
- Create: `components/layout/header.tsx`
- Create: `components/layout/user-menu.tsx`
- Create: `components/layout/footer.tsx`
- Create: `components/layout/left-sidebar.tsx`
- Create: `components/layout/right-sidebar.tsx`
- Create: `components/layout/public-layout.tsx`

- [ ] **Step 1: 创建 UserMenu (Client Component)**
- 未登录: 显示 "登录" + "注册" 按钮
- 已登录: Avatar + DropdownMenu (我的书签/管理后台(admin)/退出)
- 使用 shadcn DropdownMenu + Avatar

- [ ] **Step 2: 创建 Header (Server Component)**
- 顶部导航栏: Logo(WebNav SVG) + 导航链接(首页/最新/热门/关于/反馈) + UserMenu
- 背景: `bg-[#faf0ff]`, sticky top-0, h-[50px]
- 使用 Lucide 图标替代 Font Awesome

- [ ] **Step 3: 创建 Footer (Server Component)**
- 白色背景 + border-top, 版权 + 链接(关于/反馈/隐私)
- mt-auto 确保 footer 在底部

- [ ] **Step 4: 创建 LeftSidebar (Server Component)**
- 查询公共分类 (user_id IS NULL)
- 链接: 首页/最新/热门/我的书签(需登录) + 分类列表
- sticky top-[70px], hidden lg:block

- [ ] **Step 5: 创建 RightSidebar (Server Component)**
- 站点统计 widget (收录数 + 分类数)
- 热门网站 widget (top 8 by click_count, 排名色标)
- hidden xl:block

- [ ] **Step 6: 创建 PublicLayout**
- 组合 Header + banner(可选) + LeftSidebar + children + RightSidebar + Footer
- showSidebars prop 控制侧边栏显示

- [ ] **Step 7: 更新 `app/layout.tsx`**
- Inter font (next/font/google), Toaster (sonner), flex-col min-h-screen

- [ ] **Step 8: 提交**
```bash
git add -A && git commit -m "feat: add layout components (Header, Footer, Sidebars)"
```

---

## Phase 5: 公共页面

### Task 6: SiteCard + Banner + 首页

**Files:**
- Create: `components/site-card.tsx`, `components/banner.tsx`
- Modify: `app/page.tsx`

- [ ] **Step 1: 创建 SiteCard**
- 水平卡片: 40px favicon + title(14px bold) + description(12px)
- hover: border-primary + shadow + translateY(-2px)
- Link to /redirect?url=...

- [ ] **Step 2: 创建 Banner (Client Component)**
- 紫色渐变背景 (violet-600→violet-900)
- Tabs: 首页/最新/热门 (白色文字)
- 搜索框: 圆角 input + 搜索按钮
- 热门关键词 chips
- onSubmit → router.push('/search?keyword=...')

- [ ] **Step 3: 创建首页 `app/page.tsx` (Server Component)**
- 查询公共分类 + 每个分类的网站
- 查询热门关键词 (top 6 by click_count)
- 渲染: PublicLayout + Banner + 分类卡片(每个分类一个 content-card + site-grid)

- [ ] **Step 4: 验证首页显示正常**

- [ ] **Step 5: 提交**
```bash
git add -A && git commit -m "feat: add homepage with banner, site cards, and category sections"
```

---

### Task 7: 最新、热门、搜索、重定向页面

**Files:**
- Create: `app/newest/page.tsx`, `app/popular/page.tsx`, `app/search/page.tsx`
- Create: `components/site-pagination.tsx`
- Create: `app/redirect/route.ts`

- [ ] **Step 1: 创建 SitePagination (Server Component)**
- 上一页/下一页 + 页码按钮
- 支持 basePath + queryParams

- [ ] **Step 2: 创建 /newest 页面**
- Server Component, 分页24条, orderBy createdAt desc
- PublicLayout + content-card + site-grid + SitePagination

- [ ] **Step 3: 创建 /popular 页面**
- 同上, orderBy clickCount desc

- [ ] **Step 4: 创建 /search 页面**
- searchParams: keyword + page
- where: isPublic=1 AND (title LIKE OR description LIKE OR url LIKE)
- 显示搜索关键词 + 结果数

- [ ] **Step 5: 创建 /redirect Route Handler**
- GET: 查 sites 表, 更新 click_count, 记录 click_logs, redirect(url)
- 使用 auth() 获取用户ID

- [ ] **Step 6: 提交**
```bash
git add -A && git commit -m "feat: add newest, popular, search pages with pagination and redirect"
```

---

### Task 8: 关于、隐私、反馈页面 + API

**Files:**
- Create: `app/about/page.tsx`, `app/privacy/page.tsx`, `app/feedback/page.tsx`
- Create: `components/feedback-form.tsx`
- Create: `app/api/feedback/route.ts`

- [ ] **Step 1: 创建 /about 页面**
- Server Component, 查询 wn_pages where slug='about'
- dangerouslySetInnerHTML 渲染内容

- [ ] **Step 2: 创建 /privacy 页面**
- 同上, slug='privacy'

- [ ] **Step 3: 创建 FeedbackForm (Client Component)**
- React Hook Form + Zod (name可选, email可选, content必填)
- POST /api/feedback
- toast.success/error

- [ ] **Step 4: 创建 /feedback 页面**
- PublicLayout + FeedbackForm

- [ ] **Step 5: 创建 /api/feedback POST**
- 校验 content, 插入 feedbacks 表

- [ ] **Step 6: 创建 /api/search-suggest GET + /api/fetch-site-meta GET**
- search-suggest: keyword → top 8 sites by click_count
- fetch-site-meta: fetch URL, parse title/description/iconUrl from HTML

- [ ] **Step 7: 提交**
```bash
git add -A && git commit -m "feat: add about, privacy, feedback pages and utility APIs"
```

---

## Phase 6: 认证页面

### Task 9: 登录与注册页面

**Files:**
- Create: `app/login/page.tsx`, `app/register/page.tsx`
- Create: `components/login-form.tsx`, `components/register-form.tsx`

- [ ] **Step 1: 创建 LoginForm (Client Component)**
- Card + Form (username + password)
- signIn('credentials', { redirect: false })
- 成功后 router.push('/') + router.refresh()
- 底部链接: 注册

- [ ] **Step 2: 创建 /login 页面**
- PublicLayout showSidebars={false} + LoginForm

- [ ] **Step 3: 创建 RegisterForm (Client Component)**
- Card + Form (username + email + password + confirmPassword)
- Zod refine: password === confirmPassword
- POST /api/auth/register → signIn → redirect

- [ ] **Step 4: 创建 /register 页面**
- PublicLayout showSidebars={false} + RegisterForm

- [ ] **Step 5: 验证登录注册流程**

- [ ] **Step 6: 提交**
```bash
git add -A && git commit -m "feat: add login and register pages with Auth.js"
```

---

## Phase 7: 用户书签管理

### Task 10: 书签 CRUD API

**Files:**
- Create: `app/api/sites/route.ts`, `app/api/sites/[id]/route.ts`
- Create: `app/api/categories/route.ts`, `app/api/categories/[id]/route.ts`

- [ ] **Step 1: 创建 /api/sites GET+POST**
- GET: 当前用户的网站列表, 可选 categoryId 过滤
- POST: Zod 校验, 验证分类归属, 自动 favicon

- [ ] **Step 2: 创建 /api/sites/[id] PUT+DELETE**
- 验证 userId 归属后更新/删除

- [ ] **Step 3: 创建 /api/categories GET+POST**
- GET: 当前用户的分类列表
- POST: 创建分类

- [ ] **Step 4: 创建 /api/categories/[id] DELETE**
- 删除分类 + 其下所有网站

- [ ] **Step 5: 提交**
```bash
git add -A && git commit -m "feat: add bookmark CRUD APIs"
```

---

### Task 11: 书签管理页面

**Files:**
- Create: `app/bookmarks/page.tsx`
- Create: `components/bookmark-manager.tsx`
- Create: `components/add-site-dialog.tsx`
- Create: `components/add-category-dialog.tsx`

- [ ] **Step 1: 创建 /bookmarks 页面 (Server Component)**
- requireAuth() → 查询用户分类+网站
- Header + BookmarkManager + Footer

- [ ] **Step 2: 创建 BookmarkManager (Client Component)**
- 分类卡片列表, 每个分类下网站网格
- 删除网站/分类 (AlertDialog 确认)
- 添加分类/网站按钮

- [ ] **Step 3: 创建 AddSiteDialog (Client Component)**
- Dialog + Form (url + title + description + category + isPublic)
- "智能填充" 按钮: 调用 /api/fetch-site-meta
- POST /api/sites

- [ ] **Step 4: 创建 AddCategoryDialog (Client Component)**
- Dialog + Form (name + icon)
- POST /api/categories

- [ ] **Step 5: 提交**
```bash
git add -A && git commit -m "feat: add bookmarks management page with dialogs"
```

---

### Task 12: 书签导入导出

**Files:**
- Create: `app/bookmarks/import/page.tsx`, `app/bookmarks/export/page.tsx`
- Create: `components/import-form.tsx`
- Create: `app/api/bookmarks/import/route.ts`, `app/api/bookmarks/export/route.ts`

- [ ] **Step 1: 创建导入 API**
- POST: FormData (file + categoryId)
- 解析 Netscape Bookmark HTML
- 有 categoryId → 全部导入该分类
- 无 categoryId → 按 H3 文件夹创建分类

- [ ] **Step 2: 创建导出 API**
- GET: 生成 Netscape Bookmark HTML, Content-Disposition: attachment

- [ ] **Step 3: 创建导入页面 + ImportForm**
- 文件选择 + 分类选择(可选) + 导入按钮

- [ ] **Step 4: 创建导出页面**
- 下载按钮 → Link to /api/bookmarks/export

- [ ] **Step 5: 提交**
```bash
git add -A && git commit -m "feat: add bookmark import/export functionality"
```

---

## Phase 8: 管理后台

### Task 13: 后台布局与仪表盘

**Files:**
- Create: `app/admin/layout.tsx`, `app/admin/page.tsx`
- Create: `components/admin-sidebar.tsx`

- [ ] **Step 1: 创建 AdminSidebar (Client Component)**
- 导航: 仪表盘/分类/网站/用户/页面/设置/反馈/统计
- usePathname() 高亮当前项

- [ ] **Step 2: 创建 Admin Layout**
- requireAdmin() + Header + AdminSidebar + children + Footer

- [ ] **Step 3: 创建仪表盘页面**
- 4 个统计卡片: 用户数/网站数/分类数/待处理反馈
- Card + Lucide icons

- [ ] **Step 4: 提交**
```bash
git add -A && git commit -m "feat: add admin layout, sidebar, and dashboard"
```

---

### Task 14: 后台 CRUD 页面

**Files:**
- Create: `app/admin/categories/page.tsx`
- Create: `app/admin/sites/page.tsx`
- Create: `app/admin/users/page.tsx`
- Create: `components/admin/data-table.tsx`
- Create: `app/api/admin/categories/route.ts`, `app/api/admin/categories/[id]/route.ts`
- Create: `app/api/admin/sites/route.ts`, `app/api/admin/sites/[id]/route.ts`
- Create: `app/api/admin/users/route.ts`, `app/api/admin/users/[id]/route.ts`

- [ ] **Step 1: 创建通用 DataTable 组件**
- shadcn Table wrapper, columns 配置, 操作列(编辑/删除)
- AlertDialog 确认删除

- [ ] **Step 2: 创建管理后台 API (6 个 Route Handlers)**
- /api/admin/categories: GET(all) + POST(create)
- /api/admin/categories/[id]: PUT(update) + DELETE(cascade)
- /api/admin/sites: GET(all) + POST(create)
- /api/admin/sites/[id]: PUT + DELETE
- /api/admin/users: GET(all)
- /api/admin/users/[id]: PUT(edit role/status) + DELETE
- 所有 API 检查 admin role

- [ ] **Step 3: 创建分类管理页面**
- Server Component 查询数据 + DataTable
- Client Component 处理删除

- [ ] **Step 4: 创建网站管理页面**
- 同上, 显示 title/url/category/clickCount/isPublic

- [ ] **Step 5: 创建用户管理页面**
- 显示 username/email/role/status/createdAt
- 操作: 编辑角色/状态, 删除

- [ ] **Step 6: 提交**
```bash
git add -A && git commit -m "feat: add admin CRUD pages for categories, sites, users"
```

---

### Task 15: 后台页面管理、设置、反馈、统计

**Files:**
- Create: `app/admin/pages/page.tsx`, `app/admin/settings/page.tsx`
- Create: `app/admin/feedback/page.tsx`, `app/admin/stats/page.tsx`
- Create: `components/tiptap-editor.tsx`
- Create: `app/api/admin/pages/[id]/route.ts`
- Create: `app/api/admin/settings/route.ts`
- Create: `app/api/admin/feedback/[id]/route.ts`
- Create: `app/api/admin/stats/route.ts`

- [ ] **Step 1: 创建 TipTap 编辑器组件 (Client Component)**
- useEditor + StarterKit + Link + Image + Placeholder
- 自定义 toolbar: Bold/Italic/Heading/Link/Image (shadcn Button + Tooltip)
- 受控组件: value/onChange

- [ ] **Step 2: 创建页面管理 + API**
- 页面列表 + TipTap 编辑
- PUT /api/admin/pages/[id]: 更新 content + updatedBy

- [ ] **Step 3: 创建设置管理 + API**
- 表单: 站点名称/描述/主题色/banner 开关/侧边栏开关
- GET+PUT /api/admin/settings: 读写 wn_settings 表

- [ ] **Step 4: 创建反馈管理 + API**
- 反馈列表 (状态筛选: 未回复/已回复/已关闭)
- 回复: textarea + 提交
- PUT /api/admin/feedback/[id]: reply/close

- [ ] **Step 5: 创建统计页面 + API**
- GET /api/admin/stats: 用户增长/网站增长/点击趋势
- 简单图表 (可用 recharts 或 Chart.js)

- [ ] **Step 6: 提交**
```bash
git add -A && git commit -m "feat: add admin pages management, settings, feedback, stats"
```

---

## Phase 9: 清理与收尾

### Task 16: 清理 PHP 代码

**Files:**
- Delete: `database/` (已迁移到 Drizzle schema)
- Delete: `docs/` 中旧的 PHP 相关文档
- Delete: `screenshot_*.png` (旧截图)

- [ ] **Step 1: 删除旧文件**
```bash
rm -rf database/ screenshot_*.png
# 保留 docs/superpowers/
```

- [ ] **Step 2: 更新 README.md**
- 新项目说明, 技术栈, 安装步骤, 环境变量, 开发命令

- [ ] **Step 3: 最终验证**
```bash
npm run build
npm run dev
# 测试所有页面和 API
```

- [ ] **Step 4: 提交**
```bash
git add -A && git commit -m "chore: clean up PHP code and update README"
```

---

## 执行顺序总结

| Phase | Tasks | 依赖 |
|-------|-------|------|
| 1. 脚手架 | Task 1-2 | 无 |
| 2. 数据库 | Task 3 | Task 1 |
| 3. 认证 | Task 4 | Task 3 |
| 4. 布局 | Task 5 | Task 4 |
| 5. 公共页面 | Task 6-8 | Task 5 |
| 6. 认证页面 | Task 9 | Task 4, 5 |
| 7. 书签管理 | Task 10-12 | Task 4, 5 |
| 8. 管理后台 | Task 13-15 | Task 4, 5 |
| 9. 清理 | Task 16 | 全部 |

Phase 5-8 可以并行执行（都依赖 Phase 1-4）。
