# WebNav - 网址导航

基于 ThinkPHP 8 + MySQL + Tailwind CSS 的个人网址导航网站。

## 功能特性

- **分类导航** - 公共分类 + 用户自定义分类，支持层级嵌套
- **智能搜索** - 按标题、描述、URL 关键词搜索
- **用户系统** - 注册 / 登录，admin 和 user 两种角色
- **个人书签** - 登录用户可管理自己的书签分类和网站
- **导入导出** - 支持 Netscape HTML 书签格式导入导出
- **点击统计** - 通过跳转链接追踪点击次数，后台可视化
- **Favicon 自动获取** - 自动通过 Google Favicon API 获取网站图标
- **后台管理** - 分类 / 网站 / 用户的完整 CRUD
- **响应式设计** - Tailwind CSS 卡片式布局，适配移动端

## 技术栈

| 组件 | 技术 |
|------|------|
| 后端框架 | ThinkPHP 8.1 |
| 数据库 | MySQL 8+ |
| 前端样式 | Tailwind CSS (CDN) |
| 图标 | Font Awesome 6 (CDN) |
| PHP | 8.0+ |

## 快速开始

### 环境要求

- PHP >= 8.0
- MySQL >= 8.0
- Composer

### 安装步骤

```bash
# 1. 克隆项目
git clone git@github.com:ion-lgb/webnav.git
cd webnav

# 2. 安装依赖
composer install

# 3. 配置环境变量
cp .example.env .env
# 编辑 .env，配置数据库连接信息
# DB_HOST = 127.0.0.1
# DB_NAME = webnav
# DB_USER = root
# DB_PASS = 你的密码
# DB_PREFIX = wn_

# 4. 创建数据库并导入初始数据
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS webnav DEFAULT CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -u root -p webnav < database/install.sql

# 5. 启动开发服务器
php think run
```

访问 `http://localhost:8000` 即可看到网站。

### 默认账号

| 角色 | 用户名 | 密码 |
|------|--------|------|
| 管理员 | admin | admin123 |

> 首次部署后请及时修改管理员密码。

## 项目结构

```
webnav/
├── app/
│   ├── controller/
│   │   ├── Index.php          # 首页、搜索、跳转
│   │   ├── Auth.php           # 登录 / 注册 / 退出
│   │   ├── My.php             # 个人书签管理
│   │   └── admin/
│   │       ├── BaseAdmin.php  # 管理后台基类
│   │       ├── Index.php      # 仪表盘
│   │       ├── Category.php   # 分类 CRUD
│   │       ├── Site.php      # 网站 CRUD
│   │       ├── User.php      # 用户管理
│   │       └── Stats.php     # 点击统计
│   ├── model/                 # User / Category / Site / Favorite
│   ├── middleware/             # AuthCheck / AdminCheck
│   └── view/                  # 模板文件 (Tailwind CSS)
│       ├── layout.html        # 前台布局
│       ├── admin_layout.html  # 后台布局
│       ├── index/             # 首页 / 搜索
│       ├── auth/              # 登录 / 注册
│       ├── my/                # 个人书签
│       └── admin/             # 后台页面
├── config/                    # 框架配置
├── database/
│   └── install.sql            # 数据库初始化脚本
├── route/
│   └── app.php                # 路由定义
├── public/                    # Web 入口
└── .env                       # 环境变量（不纳入版本控制）
```

## 页面路由

| 页面 | URL | 说明 |
|------|-----|------|
| 首页 | `/` | 分类导航首页 |
| 搜索 | `/search?keyword=xxx` | 搜索网站 |
| 登录 | `/login` | 用户登录 |
| 注册 | `/register` | 用户注册 |
| 我的书签 | `/my` | 个人书签管理 (需登录) |
| 添加书签 | `/my/addSite` | 添加网站 |
| 导入书签 | `/my/import` | 导入 Netscape HTML |
| 导出书签 | `/my/export` | 导出书签 |
| 管理后台 | `/admin` | 后台仪表盘 (需管理员) |
| 分类管理 | `/admin/categories` | 分类 CRUD |
| 网站管理 | `/admin/sites` | 网站 CRUD |
| 用户管理 | `/admin/users` | 用户管理 |
| 点击统计 | `/admin/stats` | 点击排行和趋势 |

## 数据库表

| 表名 | 说明 |
|------|------|
| wn_users | 用户表 (admin/user 角色) |
| wn_categories | 分类表 (公共分类 user_id=NULL) |
| wn_sites | 网站表 |
| wn_favorites | 收藏表 |

## License

MIT License