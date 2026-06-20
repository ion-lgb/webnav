# WebNav

WebNav 是一个基于 Next.js 的网址导航与书签管理系统，适合用来搭建个人导航页、团队资源入口或轻量级站点目录。项目包含公开导航页、搜索、点击统计、反馈收集、后台管理、页面编辑、站点设置和深色模式。

## 特性

- 分类导航：公开分类、左侧导航、卡片式站点展示
- 站点管理：网站 CRUD、排序、公开状态、图标和描述维护
- 搜索体验：关键词搜索、搜索建议、热门关键词
- 访问统计：跳转记录、点击次数、热门网站排行
- 内容管理：关于页、隐私页等自定义页面编辑
- 反馈管理：访客提交反馈，后台查看和回复
- 后台权限：Auth.js Credentials 登录、JWT 会话、管理员路由守卫
- 登录防护：失败次数记录和短时锁定
- 站点设置：站点名称、描述、Banner、侧栏、页脚开关
- UI 体验：shadcn/ui、Tailwind CSS v4、响应式布局、深色模式

## 技术栈

| 类型 | 技术 |
| --- | --- |
| 框架 | Next.js 16 App Router |
| 运行时 | React 19 |
| 样式 | Tailwind CSS v4 |
| 组件 | shadcn/ui, Radix UI, lucide-react |
| 数据库 | MySQL |
| ORM | Drizzle ORM |
| 认证 | Auth.js v5, Credentials, JWT |
| 表单 | React Hook Form, Zod |
| 富文本 | TipTap |
| 通知 | Sonner |

## 环境要求

- Node.js 20 或更高版本
- MySQL 8.0 或兼容版本
- npm

## 快速开始

克隆并安装依赖：

```bash
git clone git@github.com:ion-lgb/webnav.git
cd webnav
npm install
```

创建 `.env.local`：

```env
DATABASE_URL=mysql://root:password@localhost:3306/webnav
AUTH_SECRET=replace-with-a-long-random-secret
NEXTAUTH_URL=http://localhost:3000
```

创建数据库：

```bash
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS webnav DEFAULT CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

同步数据库表结构：

```bash
npx drizzle-kit push
```

创建本地管理员账号。下面示例账号为 `admin`，密码为 `admin123`，生产环境请改成强密码：

```sql
INSERT INTO wn_users (username, email, password, role, status, created_at, updated_at)
VALUES (
  'admin',
  'admin@example.com',
  '$2b$10$wreQPKUZ2bXQjtoa07N1LeICotYA7Y9rueE0hZyCwwhvJ.RUqXfz6',
  'admin',
  1,
  NOW(),
  NOW()
);
```

启动开发服务器：

```bash
npm run dev
```

访问：

- 前台：`http://localhost:3000`
- 后台：`http://localhost:3000/admin`
- 登录：`admin` / `admin123`

## 常用命令

```bash
npm run dev       # 启动开发服务器
npm run build     # 生产构建
npm run start     # 启动生产服务
npm run lint      # ESLint 检查
npx tsc --noEmit  # TypeScript 类型检查
```

## 项目结构

```text
webnav/
├── app/                    # Next.js App Router 页面和 API
│   ├── admin/              # 后台管理页面
│   ├── api/                # API routes
│   ├── category/[id]/      # 公开分类详情
│   ├── site/[id]/          # 公开站点详情
│   ├── login/              # 登录页
│   ├── page.tsx            # 首页
│   ├── newest/             # 最新收录
│   ├── popular/            # 热门网站
│   ├── search/             # 搜索结果
│   ├── about/              # 关于页面
│   ├── privacy/            # 隐私页面
│   └── feedback/           # 反馈页面
├── components/             # UI 和业务组件
│   ├── admin/              # 后台表格等组件
│   ├── layout/             # Header, Footer, Sidebar
│   └── ui/                 # shadcn/ui 组件
├── lib/
│   ├── db/                 # Drizzle client 和 schema
│   ├── auth.ts             # Auth.js 主配置
│   ├── auth.config.ts      # 路由鉴权配置
│   ├── login-guard.ts      # 登录限流
│   └── settings.ts         # 站点设置读取
├── docs/                   # 设计和开发计划文档
├── middleware.ts           # Auth.js middleware
└── drizzle.config.ts       # Drizzle Kit 配置
```

## 页面路由

| 路由 | 说明 |
| --- | --- |
| `/` | 首页分类导航 |
| `/newest` | 最新收录网站 |
| `/popular` | 热门网站 |
| `/search?keyword=...` | 搜索结果 |
| `/category/[id]` | 分类详情 |
| `/site/[id]` | 站点详情 |
| `/redirect?url=...` | 记录点击并跳转 |
| `/about` | 关于页面 |
| `/privacy` | 隐私页面 |
| `/feedback` | 反馈页面 |
| `/login` | 管理员登录 |
| `/admin` | 后台首页 |
| `/admin/categories` | 分类管理 |
| `/admin/sites` | 网站管理 |
| `/admin/pages` | 页面管理 |
| `/admin/settings` | 站点设置 |
| `/admin/feedback` | 反馈管理 |
| `/admin/stats` | 数据统计 |

## API

| API | 方法 | 说明 |
| --- | --- | --- |
| `/api/auth/[...nextauth]` | GET/POST | Auth.js 认证端点 |
| `/api/search-suggest` | GET | 搜索建议 |
| `/api/fetch-site-meta` | GET | 抓取站点标题、描述和图标 |
| `/api/feedback` | POST | 提交反馈 |
| `/api/redirect` | GET | 点击统计和外链跳转 |
| `/api/admin/categories` | GET/POST | 分类管理 |
| `/api/admin/categories/[id]` | PUT/DELETE | 分类更新和删除 |
| `/api/admin/sites` | GET/POST | 网站管理 |
| `/api/admin/sites/[id]` | PUT/DELETE | 网站更新和删除 |
| `/api/admin/pages/[id]` | PUT | 页面内容更新 |
| `/api/admin/settings` | GET/PUT | 站点设置 |
| `/api/admin/feedback/[id]` | PUT/DELETE | 反馈处理 |
| `/api/admin/stats` | GET | 后台统计数据 |

## 数据表

表名前缀为 `wn_`：

| 表 | 说明 |
| --- | --- |
| `wn_users` | 用户和管理员 |
| `wn_categories` | 网站分类 |
| `wn_sites` | 网站条目 |
| `wn_favorites` | 收藏关系 |
| `wn_feedbacks` | 用户反馈 |
| `wn_pages` | 自定义页面内容 |
| `wn_click_logs` | 点击日志 |
| `wn_login_attempts` | 登录失败记录 |
| `wn_settings` | 站点设置 |

## 部署提示

- `AUTH_SECRET` 必须使用足够长的随机字符串。
- 生产环境不要使用 README 示例管理员密码。
- 确保 MySQL 字符集使用 `utf8mb4`。
- 如部署在反向代理后，建议正确转发 `x-forwarded-for` 或 `x-real-ip`，登录限流和点击日志会使用这些头部记录 IP。
- 首次部署后执行 `npx drizzle-kit push` 同步表结构，再创建管理员账号。

## License

MIT License. See [LICENSE](./LICENSE) for details.
