# WebNav 全站操作逻辑优化 — 设计方案

> 日期：2026-06-04 | 版本：1.1

## 总览

对 WebNav 网址导航系统进行安全加固、Bug 修复、代码重构和 UX 优化，覆盖前台、后台、My 书签管理三大模块。

## 零、基础设施

### 0.1 前端资源本地化
- Tailwind CSS：从 CDN `<script src="https://cdn.tailwindcss.com">` 改为本地安装
  - `npm init -y && npm install tailwindcss @tailwindcss/cli`
  - 生成 `public/static/css/tailwind.css`（只含使用的类，purge 压缩）
  - 所有模板 `<script src="...cdn.tailwindcss...">` 替换为 `<link rel="stylesheet" href="/static/css/tailwind.css">`
- Font Awesome 6：从 CDN 改为本地
  - 下载 fa-free 包或 npm 安装 `@fortawesome/fontawesome-free`
  - CSS 和 webfont 文件放到 `public/static/fonts/` 和 `public/static/css/fa.css`
  - 所有模板 `<link rel="stylesheet" href="...cdnjs.../all.min.css">` 替换为本地路径

### 0.2 开发规范
- 每项功能开发前，必须先通过 Context7 MCP 查询 ThinkPHP 8 / think-orm 相关文档
- 每项功能测试通过后，立即 `git add` + `git commit` + `git push origin main`

---

## 一、安全加固

### 1.1 CSRF 保护
- 启用 ThinkPHP 内置 `think\middleware\SessionInit` 之后注册 `VerifyCsrfToken`
- 全局中间件 `app/middleware.php` 注册，排除 GET 请求和 `/feedback`（允许匿名提交）
- 所有 POST 表单加 `{:token()}` 隐藏域
- `/admin/feedback/close/:id`：GET 改为 POST 路由，加 CSRF 保护

### 1.2 开放重定向修复
- `Index::redirect()` 逻辑改为：
  1. `Site::where('url', $url)->find()` 查不到记录 → 显示中间确认页（"即将访问外部链接：https://xxx.com，确认前往？"），用户点击确认后由前端 `window.open()` 打开
  2. 查到 → 执行 `inc('click_count')->update()` + 写 click_logs 记录 → 302 跳转
  3. 中间确认页模板 `app/view/index/redirect_confirm.html`：展示目标 URL、原始域名解析、安全提示

### 1.3 XSS 防护
- 后台 `admin.Page::edit()` 保存页面内容时，用 HTMLPurifier 白名单过滤（允许 p, h1-h4, ul, ol, li, a, strong, em, blockquote, code, pre, br）
- 前台 `index/page.html` 模板 `${content|raw}` 保持不变（后台已过滤），`{$content}` 不用 raw

### 1.4 登录暴力破解防护
- 新增 `wn_login_attempts` 表：ip, attempts, first_attempt, locked_until
- `Auth::login()` 增加：同 IP 5 分钟 5 次失败 → 锁定 15 分钟
- 超过限制直接返回错误提示，不查询数据库

### 1.5 反馈关闭路由安全
- `Route::get('feedback/close/:id', ...)` → `Route::post('feedback/close/:id', ...)`
- 前端关闭按钮改为 `POST form`，加 CSRF token

---

## 二、Bug 修复

### 2.1 注册确认密码
- 模板 `app/view/auth/register.html`：`name="password_confirm"` → `name="confirm_password"`
- 与控制器 `$this->request->post('confirm_password', '')` 对齐

### 2.2 统计模块修复
- 新建 `wn_click_logs` 表：`id, site_id, user_id, ip, referer, created_at`
- `Index::redirect()` 跳转时写入 click_logs，不再仅 inc click_count
- `admin.Index::index()` 仪表盘：`todayClicks` 改为 `SELECT COUNT(*) FROM wn_click_logs WHERE DATE(created_at) = CURDATE()`
- `admin.Stats::index()` 统计：30 天趋势改为 `SELECT DATE(created_at) as date, COUNT(*) as click_count FROM wn_click_logs WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) GROUP BY DATE(created_at) ORDER BY date ASC`

### 2.3 favicon / icon_url 字段统一
- `admin/site/add.html` 和 `admin/site/edit.html`：`name="favicon"` → `name="icon_url"`
- `admin.Site::add()` 和 `edit()` 的 `$this->request->only([...])` 加入 `'icon_url'`
- `My::addCategory()` 增加保存 `icon` 字段：`'icon' => $this->request->post('icon', 'fas fa-folder')`

### 2.4 后台登出链接
- `admin_layout.html` 第 77 行：`href="/admin/logout"` → `href="/logout"`

### 2.5 后台用户编辑
- `admin.User::edit()` 的 `$this->request->only()` 加入 `'email'`
- 模板中 email 字段已存在，无需修改

### 2.6 书签导入支持 category 选择
- `My::import()` POST 处理改为：读取 `$this->request->post('category_id')`
- `parseBookmarkHtml()` 方法签名改为 `parseBookmarkHtml(string $content, int $userId, int $categoryId = 0)`
- 有 category_id 时导入到该分类下，否则按原逻辑按文件夹创建

### 2.7 添加站点必填验证
- `My::addSite()` 增加：`if (empty($data['title']) || empty($data['url']))` → 返回带错误提示的页面
- `admin.Site::add()` 已有此检查，保持一致

---

## 三、代码质量

### 3.1 模板去重
- 新建 `app/view/partials/site_card.html` — 站点头通用模板
  - 被引用位置：`index/index.html`, `index/search.html`, `index/newest.html`, `index/popular.html`, `my/index.html`
  - 引用方式：`{include file="partials/site_card" site="$site"}`
- 新建 `app/view/partials/flash.html` — 前台 flash 消息
- 新建 `app/view/partials/admin_flash.html` — 后台 flash 消息（复用 admin_ 前缀）

### 3.2 Favicon 逻辑提取到 Model
- Site Model 新增 accessor：
  ```php
  public function getFaviconAttr($value, $data)
  {
      if (!empty($data['icon_url'])) return $data['icon_url'];
      $parsed = parse_url($data['url'] ?? '');
      $host = $parsed['host'] ?? '';
      return $host ? 'https://www.google.com/s2/favicons?domain=' . $host . '&sz=32' : '';
  }
  ```
- 所有控制器删除重复的 `if (empty($site->icon_url)) ...` 代码块
- 模板中直接用 `{$site.icon_url ?: '...'}` 改为 `{$site.favicon}`

### 3.3 中间件声明去重
- `app/controller/My.php`：删除 `$middleware` 属性（路由分组已有）
- `app/controller/admin/*` 所有控制器：删除 `$middleware` 属性（路由分组已有）

### 3.4 删除死代码
- 删除 `app/model/Favorite.php`
- 删除所有视图中 `_method=DELETE` 和 `_method=PUT` 隐藏域
- 删除 `app/view/my/my.html`（无引用，实际用 `my/index.html`）

---

## 四、UX 优化

### 4.1 首页分类懒加载
- `Index::index()` 改为只查分类列表，不查站点
- 分类内容块改为空 div + `data-category-id` 属性
- 前端 JS：分类展开时 `fetch('/api/category/sites?id=' + id)` 异步加载站点卡片
- 首次展开后缓存到 JS Map，切换分类不重复请求（刷新页面清缓存）
- 新增 `Route::get('api/category/sites', 'Api/categorySites')` 接口
- 新增 `app/controller/Api.php` → `public function categorySites()`

### 4.2 后台批量操作
- 分类列表：加上 checkbox 列 + "批量删除"按钮 + "全选"复选框
- 站点列表：加上 checkbox 列 + "批量删除"按钮
- 用户列表：加上 checkbox 列 + "批量禁用/启用" + "批量删除"
- 反馈列表：加上 "批量关闭"（已有逐行关闭，改为可批量）
- JS：简单的全选 / 批量提交逻辑

### 4.3 书签排序（拖拽）
- `my/index.html` 中个人分类下的站点卡片加 `draggable="true"` + `data-id` + `data-sort`
- 拖拽结束后 JS 收集新排序 → `POST /my/reorder` → `My::reorder()` 更新 `sort_order`
- 新增路由 `Route::post('my/reorder', 'My/reorder')`

### 4.4 分页增强
- `Index::newest()` 和 `Index::popular()`：`.limit(60)` 改为 `.paginate(24)`
- 模板加上 `{$sites|raw}` 分页组件
- `Index::search()` 也加上 `.paginate(24)` + 分页组件

### 4.5 空状态优化
- 首页分类无站点时显示占位文字而非空白："此分类暂无网站"
- 后台列表为空时统一显示："暂无数据"
- 新增 favicon 加载失败时用默认占位图 `public/static/default-favicon.svg`

---

## 五、新增路由

| 路由 | 方法 | 目标 |
|------|------|------|
| `/api/category/sites` | GET | Api/categorySites |
| `/my/reorder` | POST | My/reorder |
| `/admin/categories/batch-delete` | POST | admin.Category/batchDelete |
| `/admin/sites/batch-delete` | POST | admin.Site/batchDelete |
| `/admin/users/batch-delete` | POST | admin.User/batchDelete |
| `/admin/users/batch-toggle` | POST | admin.User/batchToggle — 批量切换用户启用/禁用状态 |
| `/admin/feedbacks/batch-close` | POST | admin.Feedback/batchClose |

## 路由变更

| 旧 | 新 | 说明 |
|----|-----|------|
| `GET feedback/close/:id` | `POST feedback/close/:id` | CSRF 安全 |

---

## 六、新增 / 变更文件清单

### 新增文件
- `app/model/ClickLog.php`
- `app/controller/Api.php`
- `app/view/partials/site_card.html`
- `app/view/partials/flash.html`
- `app/view/partials/admin_flash.html`
- `app/view/index/redirect_confirm.html`
- `public/static/default-favicon.svg`
- `public/static/css/tailwind.css`（本地化）
- `public/static/css/fa.css`（本地化）
- `public/static/webfonts/`（Font Awesome 字体文件）
- `package.json`（Tailwind 依赖）
- 数据库迁移 SQL（click_logs, login_attempts）

### 修改文件
- `route/app.php`
- `app/middleware.php`
- `app/controller/Index.php`
- `app/controller/Auth.php`
- `app/controller/My.php`
- `app/controller/admin/Index.php`
- `app/controller/admin/Site.php`
- `app/controller/admin/User.php`
- `app/controller/admin/Category.php`
- `app/controller/admin/Stats.php`
- `app/controller/admin/Feedback.php`
- `app/controller/admin/Page.php`
- `app/model/Site.php`
- 所有视图模板（CSS 路径替换 + partial 引用 + CSRF token + 批量操作）

### 删除文件
- `app/model/Favorite.php`

---

## 七、测试清单

完成后逐一验证：
- [ ] 所有 GET 页面返回 200
- [ ] CSRF 保护生效：不带 token 的 POST 返回 403
- [ ] 注册确认密码验证正确
- [ ] 开放重定向：无效 URL 显示确认页
- [ ] 仪表盘 todayClicks 显示真实数据
- [ ] 统计页趋势图数据正确
- [ ] favicon 后端字段一致
- [ ] 登录暴力破解锁生效
- [ ] 首页分类展开加载正常
- [ ] 后台批量操作正常
- [ ] 书签拖拽排序正常
- [ ] 分页正常（最新/热门/搜索）
