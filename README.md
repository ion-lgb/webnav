# WebNav

基于 Next.js 16 + MySQL + shadcn/ui 的个人网址导航网站，UI 参考 [一为导航](https://nav.iowen.cn) 风格。

## 功能特性

- **分类导航** — 左侧栏分类 + 首页内容卡片式站点展示
- **搜索建议** — 实时自动补全，键盘导航
- **智能搜索** — 全文搜索，按标题、描述、URL 关键词匹配
- **智能填充** — 输入 URL 自动抓取站点标题、描述和 Favicon
- **用户系统** — 注册/登录，admin 和 user 两种角色，JWT 认证
- **安全机制** — 暴力破解防护（5 次失败/15 分钟锁定）
- **个人书签** — 登录用户可管理自己的书签和分类，支持导入导出
- **后台管理** — 分类/网站/用户/反馈/页面/设置 完整 CRUD，数据统计面板
- **富文本编辑** — TipTap 编辑器用于页面内容管理
- **响应式设计** — Tailwind CSS + shadcn/ui 卡片式布局，适配桌面/平板/手机

## 技术栈

| 组件 | 技术 |
|------|------|
| 框架 | Next.js 16 (App Router) |
| UI | React 19 + shadcn/ui |
| 数据库 | MySQL 9.6 |
| ORM | Drizzle ORM |
| 认证 | Auth.js v5 (NextAuth) |
| 样式 | Tailwind CSS v4 |
| 图标 | Lucide React |
| 字体 | Inter (next/font) |
| 富文本 | TipTap |
| 表单 | React Hook Form + Zod |

## 快速开始

### 环境要求

- Node.js >= 18
- MySQL >= 8.0

### 安装步骤

```bash
# 1. 克隆项目
git clone git@github.com:ion-lgb/webnav.git
cd webnav

# 2. 安装依赖
npm install

# 3. 配置环境变量
cp .env.local.example .env.local
# 编辑 .env.local 配置：
#   DATABASE_URL=mysql://root:@localhost:3306/webnav
#   AUTH_SECRET=your-secret-key
#   NEXTAUTH_URL=http://localhost:3000

# 4. 创建数据库
mysql -u root -e "CREATE DATABASE IF NOT EXISTS webnav DEFAULT CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 5. 启动开发服务器
npm run dev
```

访问 `http://localhost:3000`。

### 默认账号

| 角色 | 用户名 | 密码 |
|------|--------|------|
| 管理员 | admin | admin123 |

> 首次部署后请及时修改管理员密码。

## 项目结构

```
webnav/
├── app/
│   ├── (public)/          # 公开页面（首页/最新/热门/搜索/关于/隐私/反馈）
│   ├── (auth)/            # 认证页面（登录/注册）
│   ├── (dashboard)/       # 用户页面（书签管理/导入/导出）
│   ├── (admin)/           # 后台管理页面
│   ├── api/               # API Routes
│   ├── layout.tsx         # 根布局
│   └── globals.css        # 全局样式 + 主题变量
├── components/
│   ├── ui/                # shadcn/ui 组件
│   ├── layout/            # Header, Footer, Sidebar
│   └── ...                # 业务组件
├── lib/
│   ├── db/                # Drizzle schema + client
│   ├── auth.ts            # Auth.js 配置
│   └── auth-utils.ts      # 认证工具函数
└── middleware.ts          # 路由守卫
```

## 路由一览

| 页面 | URL | 权限 |
|------|-----|------|
| 首页 | `/` | 公开 |
| 最新收录 | `/newest` | 公开 |
| 热门网站 | `/popular` | 公开 |
| 搜索 | `/search?keyword=xxx` | 公开 |
| 关于 | `/about` | 公开 |
| 隐私政策 | `/privacy` | 公开 |
| 反馈 | `/feedback` | 公开 |
| 登录 | `/login` | 公开 |
| 注册 | `/register` | 公开 |
| 我的书签 | `/bookmarks` | 需登录 |
| 导入书签 | `/bookmarks/import` | 需登录 |
| 导出书签 | `/bookmarks/export` | 需登录 |
| 管理后台 | `/admin` | 管理员 |
| 分类管理 | `/admin/categories` | 管理员 |
| 网站管理 | `/admin/sites` | 管理员 |
| 用户管理 | `/admin/users` | 管理员 |
| 页面管理 | `/admin/pages` | 管理员 |
| 站点设置 | `/admin/settings` | 管理员 |
| 反馈管理 | `/admin/feedback` | 管理员 |
| 数据统计 | `/admin/stats` | 管理员 |

## API 接口

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/auth/*` | POST | Auth.js 认证端点 |
| `/api/auth/register` | POST | 用户注册 |
| `/api/search-suggest?keyword=...` | GET | 搜索建议 |
| `/api/fetch-site-meta?url=...` | GET | 抓取 URL 元信息 |
| `/api/feedback` | POST | 提交反馈 |
| `/api/sites` | GET/POST | 用户网站列表/创建 |
| `/api/sites/[id]` | PUT/DELETE | 用户网站更新/删除 |
| `/api/categories` | GET/POST | 用户分类列表/创建 |
| `/api/categories/[id]` | DELETE | 用户分类删除 |
| `/api/bookmarks/import` | POST | 导入书签 |
| `/api/bookmarks/export` | GET | 导出书签 |
| `/api/admin/*` | GET/PUT/DELETE | 管理员 API |

## 数据库表

| 表名 | 说明 |
|------|------|
| wn_users | 用户表（admin/user 角色） |
| wn_categories | 分类表（公共分类 user_id=NULL） |
| wn_sites | 网站表 |
| wn_favorites | 用户收藏表 |
| wn_feedbacks | 反馈表 |
| wn_pages | 页面内容表 |
| wn_click_logs | 点击日志表 |
| wn_login_attempts | 登录尝试表 |
| wn_settings | 系统设置表（KV 存储） |

## 开发命令

```bash
npm run dev      # 启动开发服务器
npm run build    # 构建生产版本
npm run start    # 启动生产服务器
npm run lint     # 运行 ESLint
```

## License

MIT
