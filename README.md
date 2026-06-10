# WebNav

基于 Next.js 16 + shadcn/ui 的个人网址导航网站，UI 参考 [一为导航](https://nav.iowen.cn) 风格。

## 功能

- **分类导航** — 左侧栏分类 + 首页卡片式站点展示
- **搜索** — 全文搜索 + 自动补全建议
- **智能填充** — 输入 URL 自动抓取标题、描述、Favicon
- **后台管理** — 网站/分类/页面/设置/反馈/统计，完整 CRUD
- **富文本** — TipTap 编辑器管理页面内容
- **响应式** — shadcn/ui + Tailwind CSS v4，适配桌面/平板/手机

## 技术栈

| 组件 | 技术 |
|------|------|
| 框架 | Next.js 16 (App Router) |
| UI | React 19 + shadcn/ui |
| 样式 | Tailwind CSS v4 |
| 数据库 | MySQL |
| ORM | Drizzle ORM |
| 认证 | Auth.js v5 (Credentials + JWT) |
| 表单 | React Hook Form + Zod |
| 富文本 | TipTap |

## 快速开始

**环境要求**: Node.js >= 18, MySQL >= 8.0

```bash
git clone git@github.com:ion-lgb/webnav.git
cd webnav
npm install
```

配置 `.env.local`：

```env
DATABASE_URL=mysql://root:@localhost:3306/webnav
AUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000
```

创建数据库：

```bash
mysql -u root -e "CREATE DATABASE IF NOT EXISTS webnav DEFAULT CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

启动：

```bash
npm run dev
```

访问 `http://localhost:3000`。

**默认管理员**: `admin` / `admin123`

## 项目结构

```
webnav/
├── app/
│   ├── (public)/          # 公开页面
│   │   ├── page.tsx              # 首页
│   │   ├── newest/page.tsx       # 最新收录
│   │   ├── popular/page.tsx      # 热门网站
│   │   ├── search/page.tsx       # 搜索
│   │   ├── about/page.tsx        # 关于
│   │   ├── privacy/page.tsx      # 隐私政策
│   │   └── feedback/page.tsx     # 反馈
│   ├── login/page.tsx     # 管理员登录
│   ├── admin/             # 后台管理
│   │   ├── page.tsx              # 仪表盘
│   │   ├── categories/           # 分类管理
│   │   ├── sites/                # 网站管理
│   │   ├── pages/                # 页面管理
│   │   ├── settings/             # 站点设置
│   │   ├── feedback/             # 反馈管理
│   │   └── stats/                # 数据统计
│   ├── api/               # API Routes
│   ├── layout.tsx         # 根布局
│   └── globals.css        # 主题变量
├── components/
│   ├── ui/                # shadcn/ui 组件
│   ├── layout/            # Header, Footer, Sidebar
│   └── ...                # 业务组件
├── lib/
│   ├── db/                # Drizzle schema + client
│   └── auth*.ts           # Auth.js 配置
└── middleware.ts          # 路由守卫
```

## 路由

| 页面 | URL | 说明 |
|------|-----|------|
| 首页 | `/` | 分类导航 + 搜索 |
| 最新 | `/newest` | 最新收录 |
| 热门 | `/popular` | 热门网站 |
| 搜索 | `/search?keyword=...` | 搜索结果 |
| 关于 | `/about` | 关于页面 |
| 隐私 | `/privacy` | 隐私政策 |
| 反馈 | `/feedback` | 意见反馈 |
| 登录 | `/login` | 管理员登录 |
| 后台 | `/admin` | 管理仪表盘 |
| 分类 | `/admin/categories` | 分类 CRUD |
| 网站 | `/admin/sites` | 网站 CRUD |
| 页面 | `/admin/pages` | 页面编辑 |
| 设置 | `/admin/settings` | 站点设置 |
| 反馈 | `/admin/feedback` | 反馈回复 |
| 统计 | `/admin/stats` | 数据统计 |

## API

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/auth/[...nextauth]` | POST | 认证端点 |
| `/api/search-suggest?keyword=` | GET | 搜索建议 |
| `/api/fetch-site-meta?url=` | GET | 抓取元信息 |
| `/api/feedback` | POST | 提交反馈 |
| `/api/redirect?url=` | GET | 点击跳转记录 |
| `/api/admin/*` | * | 管理 API |

## 数据库

表前缀 `wn_`：

| 表 | 说明 |
|------|------|
| wn_users | 用户 |
| wn_categories | 分类 |
| wn_sites | 网站 |
| wn_feedbacks | 反馈 |
| wn_pages | 页面内容 |
| wn_click_logs | 点击日志 |
| wn_login_attempts | 登录尝试 |
| wn_settings | 设置 (KV) |

## 命令

```bash
npm run dev      # 开发服务器
npm run build    # 生产构建
npm run start    # 启动生产服务
npm run lint     # ESLint
```

## License

MIT
