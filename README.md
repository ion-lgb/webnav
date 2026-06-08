# WebNav

基于 ThinkPHP 8 + MySQL + Tailwind CSS 的个人网址导航网站，UI 参考 [一为导航](https://nav.iowen.cn) 风格。

## 功能特性

- **分类导航** — 左侧栏分类 + 首页内容卡片式站点展示
- **搜索引擎选择器** — 搜索框支持 Google / Bing / 百度 / 站内切换，纯图标无文字
- **搜索建议** — 实时自动补全，键盘导航（↑↓ Enter Esc），防抖 200ms
- **智能搜索** — 全文搜索，按标题、描述、URL 关键词匹配
- **智能填充** — 输入 URL 自动抓取站点标题、描述和 Favicon
- **用户系统** — 注册/登录，admin 和 user 两种角色，session 认证
- **安全机制** — CSRF 保护、XSS 过滤、暴力破解防护（5 次失败/15 分钟锁定）、开放重定向确认
- **个人书签** — 登录用户可管理自己的书签和分类
- **后台管理** — 分类/网站/用户/反馈 完整 CRUD，点击统计面板
- **系统设置** — 主题色自定义、首页模块拖拽排序、模块显隐开关，前端实时联动
- **Quill 编辑器** — 反馈页面和后台回复使用富文本编辑器
- **响应式设计** — Tailwind CSS 卡片式布局，适配桌面/平板/手机

## 技术栈

| 组件 | 技术 |
|------|------|
| 后端框架 | ThinkPHP 8.1 |
| 数据库 | MySQL 9.6 |
| 前端样式 | Tailwind CSS 4（npm 本地构建） |
| 图标 | Font Awesome 6（npm 本地） |
| 字体 | Inter（Google Fonts） |
| 富文本 | Quill 2 |
| PHP | 8.0+ |

## 快速开始

### 环境要求

- PHP >= 8.0（需 pdo_mysql 扩展）
- MySQL >= 8.0
- Composer
- Node.js >= 18

### 安装步骤

```bash
# 1. 克隆项目
git clone git@github.com:ion-lgb/webnav.git
cd webnav

# 2. 安装 PHP 依赖
composer install

# 3. 安装前端依赖并构建 CSS
npm install
npm run build:css

# 4. 配置环境变量
cp .example.env .env
# 编辑 .env 配置数据库连接：
#   DB_HOST = 127.0.0.1
#   DB_NAME = webnav
#   DB_USER = root
#   DB_PASS =
#   DB_PREFIX = wn_

# 5. 创建数据库并导入初始数据
mysql -u root -e "CREATE DATABASE IF NOT EXISTS webnav DEFAULT CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -u root webnav < database/install.sql

# 6. 启动开发服务器
php think run
```

访问 `http://localhost:8000`。

### 默认账号

| 角色 | 用户名 | 密码 |
|------|--------|------|
| 管理员 | admin | admin123 |

> 首次部署后请及时修改管理员密码。

### 开发注意事项

- **模板缓存**：修改视图文件后需清除缓存：
  ```bash
  rm -rf runtime/temp/ && mkdir runtime/temp/
  ```
- **CSS 构建**：修改模板中的 Tailwind 类名后需重新构建：
  ```bash
  npm run build:css
  ```
  或使用 `npm run watch:css` 自动监听文件变化。
- **CSRF**：所有 POST 表单需包含 `{:token_field()}`，排除路径：`/feedback`、`/api/*`

## 项目结构

```
webnav/
├── app/
│   ├── BaseController.php      # 控制器基类（用户/路径变量注入）
│   ├── controller/
│   │   ├── Index.php           # 首页、搜索、最新、热门、跳转
│   │   ├── Auth.php            # 登录/注册/退出
│   │   ├── My.php              # 个人书签管理
│   │   └── admin/
│   │       ├── BaseAdmin.php   # 后台基类（admin 权限校验）
│   │       ├── Index.php       # 仪表盘
│   │       ├── Category.php    # 分类 CRUD
│   │       ├── Site.php        # 网站 CRUD
│   │       ├── User.php        # 用户管理
│   │       ├── Stats.php       # 点击统计
│   │       └── Setting.php     # 系统设置
│   ├── model/                  # User / Category / Site / Favorite / Setting
│   ├── middleware/              # AuthCheck / AdminCheck / Csrf
│   └── view/
│       ├── layout.html         # 前台布局（顶栏+Banner+侧边栏+页脚）
│       ├── admin_layout.html   # 后台布局
│       ├── index/              # 首页 / 最新 / 热门 / 搜索 / 反馈
│       ├── auth/               # 登录 / 注册
│       ├── my/                 # 个人书签页面
│       ├── admin/              # 后台管理页面
│       │   └── setting/        # 系统设置页面（颜色选择器+拖拽排序）
│       └── partials/           # 共享组件（site_card / flash 等）
├── app.css                     # Tailwind CSS 入口文件
├── tailwind.config.js          # Tailwind 配置
├── config/                     # ThinkPHP 框架配置
├── database/
│   └── install.sql             # 数据库初始化脚本
├── route/
│   └── app.php                 # 路由定义
├── public/
│   └── static/
│       └── css/                # 构建后的静态 CSS
└── .env                        # 环境变量（不纳入版本控制）
```

## 路由一览

| 页面 | URL | 权限 |
|------|-----|------|
| 首页 | `/` | 公开 |
| 最新收录 | `/newest` | 公开 |
| 热门网站 | `/popular` | 公开 |
| 搜索 | `/search?keyword=xxx` | 公开 |
| 反馈 | `/feedback` | 公开 |
| 登录 | `/login` | 公开 |
| 注册 | `/register` | 公开 |
| 我的书签 | `/bookmarks` | 需登录 |
| 导出书签 | `/my/export` | 需登录 |
| 管理后台 | `/admin` | 管理员 |
| 分类管理 | `/admin/categories` | 管理员 |
| 网站管理 | `/admin/sites` | 管理员 |
| 用户管理 | `/admin/users` | 管理员 |
| 点击统计 | `/admin/stats` | 管理员 |
| 反馈管理 | `/admin/feedbacks` | 管理员 |
| 系统设置 | `/admin/settings` | 管理员 |

## API 接口

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/category/sites?id=N` | GET | 获取分类下站点列表（懒加载） |
| `/api/search-suggest?keyword=...` | GET | 搜索建议（自动补全，返回标题+URL） |
| `/api/fetch-site-meta?url=...` | GET | 抓取 URL 元信息（标题、描述、Favicon） |

## 数据库表

| 表名 | 前缀 | 说明 |
|------|------|------|
| wn_users | wn_ | 用户表（admin/user 角色） |
| wn_categories | wn_ | 分类表（公共分类 user_id=0） |
| wn_sites | wn_ | 网站表（含点赞/点踩/点击数） |
| wn_bookmarks | wn_ | 用户书签表 |
| wn_settings | wn_ | 系统设置表（主题色/模块开关/排序等 KV 存储） |

## License

MIT
