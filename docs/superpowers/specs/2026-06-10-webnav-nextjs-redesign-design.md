# WebNav Next.js 重构设计文档

## 概述

将现有 ThinkPHP 8 + MySQL 个人网址导航网站重构为 Next.js 全栈应用，使用 shadcn/ui 组件库，保留现有 MySQL 数据库。

## 技术栈

| 层 | 技术 | 版本 |
|---|---|---|
| 框架 | Next.js (App Router) | 16.x |
| UI 库 | React | 19.x |
| 组件 | shadcn/ui | latest |
| CSS | Tailwind CSS | v4 |
| 认证 | Auth.js (NextAuth v5) | 5.x |
| ORM | Drizzle ORM | latest |
| 数据库 | MySQL | 9.6 |
| 富文本 | TipTap | latest |
| 图标 | Lucide React + Font Awesome | latest |
| 表单 | React Hook Form + Zod | latest |
| 拖拽 | dnd-kit | latest |

## 架构模式

- **Server Components**: 数据获取和页面渲染（SEO 友好）
- **Client Components**: 交互功能（表单、搜索建议、拖拽排序）
- **Route Handlers**: API 端点处理 AJAX 请求
- **Middleware**: 路由守卫（登录/管理员权限）

## 项目结构

```
webnav/
├── app/
│   ├── (public)/              # 公开页面（Server Components）
│   │   ├── page.tsx                  # 首页
│   │   ├── newest/page.tsx           # 最新收录
│   │   ├── popular/page.tsx          # 热门网站
│   │   ├── search/page.tsx           # 搜索结果
│   │   ├── about/page.tsx            # 关于我们
│   │   ├── privacy/page.tsx          # 隐私政策
│   │   └── feedback/page.tsx         # 意见反馈
│   ├── (auth)/                # 认证页面
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (dashboard)/           # 登录用户页面
│   │   ├── bookmarks/page.tsx        # 我的书签
│   │   ├── bookmarks/add/page.tsx
│   │   ├── bookmarks/edit/[id]/page.tsx
│   │   ├── bookmarks/import/page.tsx
│   │   └── bookmarks/export/page.tsx
│   ├── (admin)/               # 后台管理
│   │   ├── admin/page.tsx
│   │   ├── admin/categories/page.tsx
│   │   ├── admin/sites/page.tsx
│   │   ├── admin/users/page.tsx
│   │   ├── admin/pages/page.tsx
│   │   ├── admin/settings/page.tsx
│   │   ├── admin/feedback/page.tsx
│   │   └── admin/stats/page.tsx
│   ├── api/                   # API Routes
│   │   ├── auth/[...nextauth]/route.ts
│   │   ├── sites/route.ts
│   │   ├── categories/route.ts
│   │   ├── search-suggest/route.ts
│   │   ├── fetch-site-meta/route.ts
│   │   └── redirect/route.ts
│   ├── layout.tsx             # 根布局
│   └── globals.css
├── components/
│   ├── ui/                    # shadcn 组件
│   ├── layout/                # Header, Footer, Sidebar
│   ├── site-card.tsx
│   └── ...
├── lib/
│   ├── db/                    # Drizzle schema + client
│   │   ├── index.ts
│   │   ├── schema.ts
│   │   └── migrate.ts
│   ├── auth.ts                # Auth.js config
│   └── utils.ts
├── drizzle/                   # 迁移文件
├── drizzle.config.ts
├── next.config.ts
├── tailwind.config.ts
└── package.json
```

## 路由组设计

| 路由组 | 用途 | 权限 | 布局 |
|---|---|---|---|
| `(public)` | 公开页面 | 无需登录 | 完整侧边栏布局 |
| `(auth)` | 登录/注册 | 无需登录 | 居中卡片布局 |
| `(dashboard)` | 用户操作 | 需登录 | 用户界面布局 |
| `(admin)` | 后台管理 | 需管理员 | 独立后台布局 |

## 数据库设计

### 现有表结构（8 张表）

| 表名 | Drizzle Model | 说明 |
|---|---|---|
| wn_users | users | 用户表（Auth.js credentials） |
| wn_categories | categories | 分类表（公共 + 个人） |
| wn_sites | sites | 网站条目表 |
| wn_favorites | favorites | 用户收藏表 |
| wn_feedbacks | feedbacks | 反馈表 |
| wn_pages | pages | 页面内容表 |
| wn_click_logs | clickLogs | 点击日志表 |
| wn_login_attempts | loginAttempts | 登录尝试表（防暴力破解） |

### Drizzle Schema 定义

```typescript
// lib/db/schema.ts
import { mysqlTable, int, varchar, text, datetime, tinyint, enum } from 'drizzle-orm/mysql-core';

export const users = mysqlTable('wn_users', {
  id: int('id').primaryKey().autoincrement(),
  username: varchar('username', { length: 50 }).notNull().unique(),
  email: varchar('email', { length: 100 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  role: enum('role', ['admin', 'user']).notNull().default('user'),
  avatar: varchar('avatar', { length: 255 }),
  status: tinyint('status').notNull().default(1),
  createdAt: datetime('created_at'),
  updatedAt: datetime('updated_at'),
});

// ... 其他表定义
```

### 数据迁移策略

- **不重建表**: 直接使用现有 MySQL 数据
- **Schema 映射**: Drizzle schema 仅做类型定义，不执行 `drizzle push`
- **后续变更**: 使用 Drizzle migrations 管理字段变更

## 认证方案

### Auth.js v5 配置

```typescript
// lib/auth.ts
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        // 查询用户
        const user = await db.select().from(users)
          .where(eq(users.username, credentials.username as string))
          .limit(1);
        
        if (!user.length) return null;
        
        // 验证密码
        const isValid = await bcrypt.compare(
          credentials.password as string,
          user[0].password
        );
        
        if (!isValid) return null;
        
        return { id: user[0].id, username: user[0].username, role: user[0].role };
      },
    }),
  ],
  session: { strategy: 'jwt' },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id as string;
      session.user.role = token.role as string;
      return session;
    },
  },
});
```

### 暴力破解防护

- 保留 `wn_login_attempts` 表
- 在 `authorize()` 中检查 IP 锁定状态
- 5 次失败后锁定 15 分钟

### Middleware 路由守卫

```typescript
// middleware.ts
import { auth } from '@/lib/auth';

export default auth((req) => {
  const { pathname } = req.nextUrl;
  
  // Dashboard 路由需要登录
  if (pathname.startsWith('/bookmarks') && !req.auth) {
    return Response.redirect(new URL('/login', req.url));
  }
  
  // Admin 路由需要管理员权限
  if (pathname.startsWith('/admin') && req.auth?.user?.role !== 'admin') {
    return Response.redirect(new URL('/', req.url));
  }
});

export const config = {
  matcher: ['/bookmarks/:path*', '/admin/:path*'],
};
```

## UI 组件映射

| 场景 | shadcn/ui 组件 |
|---|---|
| 导航栏 | Navigation Menu |
| 搜索框 | Input + Command (搜索建议下拉) |
| 网站卡片 | Card |
| 表单 | Form + Input + Label + Select + Button |
| 后台表格 | Table + DataTable |
| 弹窗确认 | Dialog + AlertDialog |
| 提示消息 | Toast (Sonner) |
| 分页 | Pagination |
| 侧边栏导航 | Sidebar (admin) |
| 标签页 | Tabs (首页分类切换) |
| 富文本编辑 | TipTap (自定义 toolbar) |
| 下拉菜单 | Dropdown Menu |
| 拖拽排序 | dnd-kit |

## 页面布局设计

### 公共页面布局（首页/最新/热门/搜索）

```
┌─────────────────────────────────────┐
│  Header (Logo + 导航 + 搜索 + 用户)  │
├─────────────────────────────────────┤
│  左侧边栏 │  主内容区  │ 右侧边栏   │
│  (分类)   │  (卡片网格) │ (热门/推荐)│
├─────────────────────────────────────┤
│  Footer                             │
└─────────────────────────────────────┘
```

### 首页特殊布局

```
┌─────────────────────────────────────┐
│  Header                             │
├─────────────────────────────────────┤
│  紫色渐变 Banner + 搜索框            │
├─────────────────────────────────────┤
│  分类 Tabs                          │
├─────────────────────────────────────┤
│  网站卡片网格                        │
├─────────────────────────────────────┤
│  Footer                             │
└─────────────────────────────────────┘
```

### 认证页面布局

```
┌─────────────────────────────────────┐
│  Header (简化版)                     │
├─────────────────────────────────────┤
│                                     │
│         居中登录/注册卡片            │
│                                     │
├─────────────────────────────────────┤
│  Footer                             │
└─────────────────────────────────────┘
```

### 后台管理布局

```
┌─────────────────────────────────────┐
│  Admin Header (Logo + 用户菜单)      │
├──────────────┬──────────────────────┤
│  Sidebar     │  主内容区             │
│  (导航菜单)  │  (DataTable/表单)     │
└──────────────┴──────────────────────┘
```

## 主题设计

### shadcn CSS 变量覆盖

```css
:root {
  --primary: 24 95% 53%;        /* #e8590c 橙色 */
  --primary-foreground: 0 0% 100%;
  --secondary: 270 60% 95%;     /* 柔和薰衣草 */
  --secondary-foreground: 270 60% 30%;
  --accent: 270 60% 95%;
  --accent-foreground: 270 60% 30%;
  --destructive: 0 84% 60%;
  --destructive-foreground: 0 0% 100%;
  --muted: 240 5% 96%;
  --muted-foreground: 240 4% 46%;
  --card: 0 0% 100%;
  --card-foreground: 240 10% 4%;
  --popover: 0 0% 100%;
  --popover-foreground: 240 10% 4%;
  --border: 240 6% 90%;
  --input: 240 6% 90%;
  --ring: 24 95% 53%;
  --radius: 0.5rem;
}

.dark {
  --primary: 24 95% 53%;
  --primary-foreground: 0 0% 100%;
  --secondary: 270 30% 20%;
  --secondary-foreground: 270 60% 95%;
  /* ... dark mode 变量 */
}
```

### 保留的设计元素

- 橙色主题色 (#e8590c / #d1470b)
- 深紫色 Banner 渐变 (#7c3aed → #5b21b6)
- 柔和薰衣草导航栏背景 (#faf0ff)
- 白色卡片 + 细边框 + 柔和阴影

## API 设计

### 公开 API

| 端点 | 方法 | 说明 |
|---|---|---|
| `/api/auth/[...nextauth]` | POST | Auth.js 认证 |
| `/api/search-suggest` | GET | 搜索建议（关键词补全） |
| `/api/fetch-site-meta` | GET | 抓取网站元信息 |
| `/api/redirect` | GET | 点击跳转（记录日志） |

### 用户 API（需登录）

| 端点 | 方法 | 说明 |
|---|---|---|
| `/api/sites` | GET/POST | 获取/添加网站 |
| `/api/sites/[id]` | PUT/DELETE | 编辑/删除网站 |
| `/api/categories` | GET/POST | 获取/添加分类 |
| `/api/categories/[id]` | PUT/DELETE | 编辑/删除分类 |
| `/api/bookmarks/reorder` | POST | 拖拽排序 |
| `/api/bookmarks/import` | POST | 导入书签 |
| `/api/bookmarks/export` | GET | 导出书签 |

### 管理员 API（需管理员权限）

| 端点 | 方法 | 说明 |
|---|---|---|
| `/api/admin/users` | GET | 用户列表 |
| `/api/admin/users/[id]` | PUT/DELETE | 编辑/删除用户 |
| `/api/admin/pages/[id]` | PUT | 编辑页面内容 |
| `/api/admin/settings` | PUT | 更新站点设置 |
| `/api/admin/feedback/[id]` | PUT | 回复/关闭反馈 |
| `/api/admin/stats` | GET | 统计数据 |

## 功能清单

### 公开功能

- [x] 首页展示（分类 + 网站卡片）
- [x] 最新收录列表（分页）
- [x] 热门网站列表（分页）
- [x] 搜索功能（关键词 + 搜索建议）
- [x] 点击跳转（记录日志 + 计数）
- [x] 关于我们页面
- [x] 隐私政策页面
- [x] 意见反馈提交

### 用户功能

- [x] 注册/登录
- [x] 我的书签管理
- [x] 添加/编辑/删除网站
- [x] 添加/编辑/删除分类
- [x] 书签导入（HTML 格式）
- [x] 书签导出（HTML 格式）
- [x] 拖拽排序

### 管理员功能

- [x] 用户管理（列表/编辑/删除/禁用）
- [x] 分类管理（CRUD + 批量删除）
- [x] 网站管理（CRUD + 批量删除）
- [x] 页面内容编辑（TipTap 富文本）
- [x] 站点设置管理
- [x] 反馈管理（回复/关闭/批量关闭）
- [x] 统计数据查看

## 开发环境

### 本地服务

- **Next.js 开发服务器**: `npm run dev` (http://localhost:3000)
- **MySQL**: localhost:3306 (root, 无密码)
- **数据库**: webnav

### 环境变量

```env
# .env.local
DATABASE_URL=mysql://root:@localhost:3306/webnav
AUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000
```

### 常用命令

```bash
npm run dev          # 启动开发服务器
npm run build        # 构建生产版本
npm run start        # 启动生产服务器
npm run db:generate  # 生成 Drizzle 迁移
npm run db:migrate   # 执行迁移
npm run db:studio    # 打开 Drizzle Studio
```

## 部署方案

### Vercel 部署（推荐）

- 自动构建和部署
- 环境变量在 Vercel Dashboard 配置
- MySQL 使用外部服务（如 PlanetScale、Aiven）

### 自托管部署

```bash
npm run build
npm run start
# 使用 PM2 或 systemd 管理进程
```

## 迁移步骤

1. **备份现有代码**: Git 提交所有更改
2. **创建 Next.js 项目**: 在当前目录初始化
3. **配置 Drizzle**: 连接现有 MySQL，定义 schema
4. **配置 Auth.js**: Credentials Provider + JWT
5. **搭建布局**: Header/Footer/Sidebar 组件
6. **迁移公开页面**: 首页/最新/热门/搜索
7. **迁移认证页面**: 登录/注册
8. **迁移用户功能**: 书签管理
9. **迁移后台功能**: 管理面板
10. **测试**: 功能测试 + 性能测试
11. **清理**: 删除 PHP 代码和旧依赖

## 风险与注意事项

1. **数据迁移**: 不重建表，直接使用现有数据，避免数据丢失
2. **认证兼容**: 保留 bcrypt 密码哈希，Auth.js 直接验证
3. **SEO 影响**: Server Components 保证 SEO，URL 结构保持一致
4. **性能**: Next.js 16 + React 19 性能优于 ThinkPHP 服务端渲染
5. **学习曲线**: 需要熟悉 Next.js App Router 和 Server Components

## 参考资源

- [Next.js 16 文档](https://nextjs.org/docs)
- [shadcn/ui 文档](https://ui.shadcn.com)
- [Auth.js 文档](https://authjs.dev)
- [Drizzle ORM 文档](https://orm.drizzle.team)
- [TipTap 文档](https://tiptap.dev)
