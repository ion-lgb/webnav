# WebNav 全站操作逻辑优化 — 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 安全加固 + Bug 修复 + 代码重构 + UX 优化 WebNav 全站，并本地化 CSS/FA 资源

**Architecture:** 分五个阶段渐进：基础设施（本地化+数据库表）→ 安全（CSRF/重定向/XSS/防暴力破解）→ Bug 修复 → 代码质量（模板去重/Model提取/死代码清理）→ UX（懒加载/批量操作/拖拽排序/分页）

**Tech Stack:** ThinkPHP 8.1 + think-orm + MySQL + Tailwind CSS (本地) + Font Awesome 6 (本地)

---

## Phase 0: 基础设施

### Task 0.1: 本地化 Tailwind CSS

**Files:**
- Create: `package.json`
- Create: `public/static/css/tailwind.css`
- Modify: `app/view/layout.html:7`
- Modify: `app/view/admin_layout.html:7`

- [ ] **Step 1: 创建 package.json 并安装 Tailwind**

```bash
cd /Users/ion/xm/webnav
npm init -y
npm install tailwindcss @tailwindcss/cli
```

- [ ] **Step 2: 配置 Tailwind content 扫描路径**

```bash
cd /Users/ion/xm/webnav
npx tailwindcss init
```

内容改为扫描所有模板文件：

`tailwind.config.js`:
```js
module.exports = {
  content: ['./app/view/**/*.html'],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

- [ ] **Step 3: 构建生产 CSS**

```bash
cd /Users/ion/xm/webnav
npx tailwindcss -i ./node_modules/tailwindcss/base.css -o ./public/static/css/tailwind.css --minify
```

- [ ] **Step 4: 替换布局模板中的 CDN**

修改 `app/view/layout.html` 第 7 行：
```html
<!-- 旧 -->
<script src="https://cdn.tailwindcss.com"></script>
<!-- 新 -->
<link rel="stylesheet" href="/static/css/tailwind.css">
```

修改 `app/view/admin_layout.html` 第 7 行：
```html
<!-- 旧 -->
<script src="https://cdn.tailwindcss.com"></script>
<!-- 新 -->
<link rel="stylesheet" href="/static/css/tailwind.css">
```

- [ ] **Step 5: 验证测试**

```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/
# Expected: 200
```

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json tailwind.config.js public/static/css/ app/view/layout.html app/view/admin_layout.html
git commit -m "infra: 本地化 Tailwind CSS，移除 CDN 依赖"
git push origin main
```

---

### Task 0.2: 本地化 Font Awesome 6

**Files:**
- Create: `public/static/css/fa.css`
- Create: `public/static/webfonts/fa-brands-400.woff2` 等字体文件
- Modify: `app/view/layout.html:8`
- Modify: `app/view/admin_layout.html:8`

- [ ] **Step 1: 下载 Font Awesome Free**

```bash
cd /Users/ion/xm/webnav
npm install @fortawesome/fontawesome-free
cp node_modules/@fortawesome/fontawesome-free/css/all.min.css public/static/css/fa.css
cp -r node_modules/@fortawesome/fontawesome-free/webfonts public/static/webfonts
```

- [ ] **Step 2: 修正 fa.css 中字体路径**

```bash
cd /Users/ion/xm/webnav
sed -i '' 's|../webfonts/|/static/webfonts/|g' public/static/css/fa.css
```

- [ ] **Step 3: 替换布局模板中的 CDN**

修改 `app/view/layout.html` 第 8 行：
```html
<!-- 旧 -->
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
<!-- 新 -->
<link rel="stylesheet" href="/static/css/fa.css">
```

修改 `app/view/admin_layout.html` 第 8 行：
```html
<!-- 旧 -->
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
<!-- 新 -->
<link rel="stylesheet" href="/static/css/fa.css">
```

- [ ] **Step 4: 验证图标显示**

```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/
curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/admin
# Expected: 200, 302
```

- [ ] **Step 5: Commit**

```bash
git add public/static/css/fa.css public/static/webfonts/ app/view/layout.html app/view/admin_layout.html
git commit -m "infra: 本地化 Font Awesome 6，移除 CDN 依赖"
git push origin main
```

---

### Task 0.3: 创建 click_logs 和 login_attempts 表

**Files:**
- Create: `app/model/ClickLog.php`
- Modify: `database/install.sql`

- [ ] **Step 1: 执行 SQL 建表**

```bash
mysql -u root webnav -e "
CREATE TABLE IF NOT EXISTS wn_click_logs (
    id int unsigned NOT NULL AUTO_INCREMENT,
    site_id int unsigned NOT NULL COMMENT '网站ID',
    user_id int unsigned DEFAULT NULL COMMENT '点击用户',
    ip varchar(45) DEFAULT NULL COMMENT 'IP地址',
    referer varchar(500) DEFAULT NULL COMMENT '来源页面',
    created_at datetime DEFAULT NULL,
    PRIMARY KEY (id),
    KEY idx_site_id (site_id),
    KEY idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='点击日志表';

CREATE TABLE IF NOT EXISTS wn_login_attempts (
    id int unsigned NOT NULL AUTO_INCREMENT,
    ip varchar(45) NOT NULL COMMENT 'IP地址',
    attempts int unsigned NOT NULL DEFAULT 1 COMMENT '尝试次数',
    first_attempt datetime NOT NULL COMMENT '首次尝试时间',
    locked_until datetime DEFAULT NULL COMMENT '锁定至',
    created_at datetime DEFAULT NULL,
    updated_at datetime DEFAULT NULL,
    PRIMARY KEY (id),
    KEY idx_ip (ip)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='登录尝试表';
" 2>&1
```

- [ ] **Step 2: 创建 ClickLog Model**

`app/model/ClickLog.php`:
```php
<?php
declare(strict_types=1);

namespace app\model;

use think\Model;

class ClickLog extends Model
{
    protected $name = 'click_logs';

    protected $autoWriteTimestamp = true;

    protected $createTime = 'created_at';

    protected $updateTime = false;
}
```

- [ ] **Step 3: 更新 install.sql**

在 `database/install.sql` 末尾追加两张新表的 CREATE TABLE 语句。

- [ ] **Step 4: 验证表创建成功**

```bash
mysql -u root webnav -e "SHOW TABLES LIKE 'wn_click_logs'; SHOW TABLES LIKE 'wn_login_attempts';"
# Expected: 2 rows
```

- [ ] **Step 5: Commit**

```bash
git add app/model/ClickLog.php database/install.sql
git commit -m "feat: 添加 click_logs 和 login_attempts 表及模型"
git push origin main
```

---

## Phase 1: 安全加固

### Task 1.1: 启用 CSRF 中间件

**Context7 查询:** 先查询 `/top-think/framework` 中关于 CSRF 中间件的文档

**Files:**
- Modify: `app/middleware.php`

- [ ] **Step 1: 查询 Context7 文档**

调用 context7 查询 ThinkPHP 8 CSRF 中间件配置方式。

- [ ] **Step 2: 注册全局 CSRF 中间件**

修改 `app/middleware.php`，在 SessionInit 之后添加：
```php
<?php
return [
    \think\middleware\SessionInit::class,
    \app\middleware\VerifyCsrf::class,
];
```

- [ ] **Step 3: 创建 VerifyCsrf 中间件**

`app/middleware/VerifyCsrf.php`:
```php
<?php
declare(strict_types=1);

namespace app\middleware;

class VerifyCsrf
{
    protected $except = [
        'feedback',  // 允许匿名提交反馈
        'api/*',     // API 接口排除
    ];

    public function handle($request, \Closure $next)
    {
        if ($request->isGet() || $this->shouldPassThrough($request)) {
            return $next($request);
        }

        $token = $request->post('__token__', '');
        $sessionToken = session('__csrf_token__');

        if (empty($sessionToken)) {
            $sessionToken = bin2hex(random_bytes(32));
            session('__csrf_token__', $sessionToken);
        }

        if (!hash_equals($sessionToken, $token)) {
            return response('CSRF token mismatch', 403);
        }

        return $next($request);
    }

    protected function shouldPassThrough($request): bool
    {
        foreach ($this->except as $path) {
            if (str_contains($path, '*')) {
                $pattern = '#^' . str_replace('\*', '.*', preg_quote($path, '#')) . '#';
                if (preg_match($pattern, trim($request->pathinfo(), '/'))) {
                    return true;
                }
            } elseif (trim($request->pathinfo(), '/') === trim($path, '/')) {
                return true;
            }
        }
        return false;
    }
}
```

- [ ] **Step 4: 全站 POST 表单添加 CSRF token**

搜索所有 `app/view/**/*.html` 中 `<form method="POST"` 或 `<form action="..." method="post"`，在每个 form 内第一行添加：
```html
<input type="hidden" name="__token__" value="{:session('__csrf_token__')}">
```

或简化为使用默认 TP token 函数：
```html
{:token()}
```

涉及模板：
- `app/view/auth/login.html`
- `app/view/auth/register.html`
- `app/view/index/feedback.html`
- `app/view/my/add_site.html`
- `app/view/my/edit_site.html`
- `app/view/my/import.html`
- `app/view/my/export.html`
- `app/view/admin/category/add.html`
- `app/view/admin/category/edit.html`
- `app/view/admin/site/add.html`
- `app/view/admin/site/edit.html`
- `app/view/admin/user/edit.html`
- `app/view/admin/page/edit.html`
- `app/view/admin/feedback/reply.html`
- 以及所有内联 delete 表单

- [ ] **Step 5: 验证 CSRF 保护**

```bash
# 不带 token 的 POST 应返回 403
curl -s -o /dev/null -w "%{http_code}" -X POST -d "username=test&password=test" http://localhost:8000/login
# Expected: 403
```

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "security: 启用 CSRF 保护中间件，全站表单添加 token"
git push origin main
```

---

### Task 1.2: 修复开放重定向 + 中间确认页

**Files:**
- Modify: `app/controller/Index.php:76-91`
- Create: `app/view/index/redirect_confirm.html`

- [ ] **Step 1: 重写 redirect 方法**

修改 `app/controller/Index.php` 的 `redirect()` 方法：
```php
public function redirect()
{
    $url = $this->request->get('url', '');

    if (empty($url)) {
        return redirect('/');
    }

    $site = Site::where('url', $url)->where('is_public', 1)->find();

    if (!$site) {
        View::assign('targetUrl', $url);
        return View::fetch('redirect_confirm');
    }

    $site->inc('click_count')->update();

    ClickLog::create([
        'site_id'  => $site->id,
        'user_id'  => session('user_id'),
        'ip'       => $this->request->ip(),
        'referer'  => $this->request->server('HTTP_REFERER', ''),
    ]);

    return redirect($url);
}
```

- [ ] **Step 2: 创建确认页模板**

`app/view/index/redirect_confirm.html`:
```html
{extend name="layout"}
{block name="title"}即将离开 WebNav{/block}
{block name="content"}
<div class="max-w-lg mx-auto px-4 py-16 text-center">
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <i class="fas fa-external-link-alt text-4xl text-yellow-500 mb-4"></i>
        <h1 class="text-xl font-bold text-gray-900 mb-2">即将离开 WebNav</h1>
        <p class="text-gray-500 mb-4">你正要访问以下外部链接：</p>
        <div class="bg-gray-50 rounded-lg p-3 mb-6 break-all text-sm text-gray-700 font-mono">
            {$targetUrl}
        </div>
        <p class="text-sm text-gray-400 mb-6">请确认该链接安全后再继续</p>
        <div class="flex justify-center gap-3">
            <a href="{$targetUrl}" target="_blank" rel="noopener noreferrer" class="px-6 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
                确认前往
            </a>
            <a href="/" class="px-6 py-2.5 border border-gray-200 text-gray-600 rounded-lg text-sm hover:bg-gray-50 transition-colors">
                返回首页
            </a>
        </div>
    </div>
</div>
{/block}
```

- [ ] **Step 3: 验证**

```bash
# 已知 URL 直接跳转
curl -s -o /dev/null -w "%{http_code}" -L "http://localhost:8000/redirect?url=https://github.com"
# Expected: 200 (github.com) 经过确认页

# 未知 URL 显示确认页
curl -s "http://localhost:8000/redirect?url=https://malicious.com" 2>&1 | grep -c "确认前往"
# Expected: 1
```

- [ ] **Step 4: Commit**

```bash
git add app/controller/Index.php app/view/index/redirect_confirm.html
git commit -m "security: 修复开放重定向，添加跳转确认页 + click_logs 记录"
git push origin main
```

---

### Task 1.3: XSS 防护 — 页面内容 HTMLPurifier 过滤

**Context7 查询:** 先查询 ThinkPHP 8 中如何使用 HTMLPurifier 或过滤用户输入的文档

**Files:**
- Modify: `app/controller/admin/Page.php:20-30`

- [ ] **Step 1: 安装 HTMLPurifier**

```bash
cd /Users/ion/xm/webnav
composer require ezyang/htmlpurifier
```

- [ ] **Step 2: 修改 admin.Page::edit() 保存逻辑**

修改 `app/controller/admin/Page.php` 的 `edit()` 方法，在 `$page->save($data)` 前增加过滤：
```php
if ($this->request->isPost()) {
    $data = $this->request->only(['title', 'content']);

    if (empty($data['title'])) {
        return redirect('/admin/page/edit/' . $id)->with('error', '标题不能为空');
    }

    // HTMLPurifier 过滤
    $config = \HTMLPurifier_Config::createDefault();
    $config->set('HTML.Allowed', 'p,h1,h2,h3,h4,ul,ol,li,a[href|target],strong,em,blockquote,code,pre,br,hr');
    $config->set('HTML.TargetBlank', true);
    $purifier = new \HTMLPurifier($config);
    $data['content'] = $purifier->purify($data['content']);

    $data['updated_by'] = session('user_id');
    $page->save($data);

    return redirect('/admin/pages')->with('success', '页面已更新');
}
```

- [ ] **Step 3: 验证**

```bash
# 正常编辑页面，保存含 <script>alert(1)</script> 的内容
# 确认保存后 script 标签被移除
curl -s -c /tmp/cookie.txt -X POST -d "username=admin&password=admin123" http://localhost:8000/login -o /dev/null
curl -s -b /tmp/cookie.txt -X POST -d "title=test&content=<p>Hello</p><script>alert(1)</script>&__token__=$(curl -s -b /tmp/cookie.txt http://localhost:8000/admin/page/edit/1 2>&1 | grep -o 'value="[a-f0-9]*"' | head -1 | cut -d'"' -f2)" http://localhost:8000/admin/page/edit/1 -o /dev/null -w "%{http_code}"
# Expected: 302 (redirect after save, content purified)
```

- [ ] **Step 4: Commit**

```bash
git add app/controller/admin/Page.php composer.json composer.lock
git commit -m "security: 后台页面编辑添加 HTMLPurifier XSS 过滤"
git push origin main
```

---

### Task 1.4: 登录暴力破解防护

**Files:**
- Modify: `app/controller/Auth.php:12-43`

- [ ] **Step 1: 在 Auth::login() 登录验证前添加防护逻辑**

修改 `app/controller/Auth.php` 的 `login()` 方法 POST 入口部分，在用户名密码验证之前插入：
```php
if ($this->request->isPost()) {
    $ip = $this->request->ip();
    $attempt = \think\facade\Db::name('login_attempts')
        ->where('ip', $ip)
        ->find();

    if ($attempt) {
        if ($attempt['locked_until'] && strtotime($attempt['locked_until']) > time()) {
            View::assign('error', '登录尝试过多，请在 ' . $attempt['locked_until'] . ' 后再试');
            return View::fetch();
        }

        if (time() - strtotime($attempt['first_attempt']) > 300) {
            \think\facade\Db::name('login_attempts')
                ->where('ip', $ip)
                ->update([
                    'attempts'      => 1,
                    'first_attempt' => date('Y-m-d H:i:s'),
                    'locked_until'  => null,
                    'updated_at'    => date('Y-m-d H:i:s'),
                ]);
        } elseif ($attempt['attempts'] >= 5) {
            \think\facade\Db::name('login_attempts')
                ->where('ip', $ip)
                ->update([
                    'locked_until' => date('Y-m-d H:i:s', time() + 900),
                    'updated_at'   => date('Y-m-d H:i:s'),
                ]);
            View::assign('error', '登录尝试过多，请 15 分钟后再试');
            return View::fetch();
        } else {
            \think\facade\Db::name('login_attempts')
                ->where('ip', $ip)
                ->inc('attempts')
                ->update(['updated_at' => date('Y-m-d H:i:s')]);
        }
    } else {
        \think\facade\Db::name('login_attempts')
            ->insert([
                'ip'            => $ip,
                'attempts'      => 1,
                'first_attempt' => date('Y-m-d H:i:s'),
                'created_at'    => date('Y-m-d H:i:s'),
                'updated_at'    => date('Y-m-d H:i:s'),
            ]);
    }

    // ... 然后继续原有的 username/password 验证逻辑
```

- [ ] **Step 2: 登录成功后清除该 IP 的尝试记录**

在 `session('user_id', $user->id)` 之前添加：
```php
\think\facade\Db::name('login_attempts')->where('ip', $ip)->delete();
```

- [ ] **Step 3: 验证**

```bash
# 连续 6 次错误登录
for i in $(seq 1 6); do
  curl -s -X POST -d "username=wrong&password=wrong" http://localhost:8000/login -o /dev/null -w "Attempt $i: %{http_code}\n"
done
# Expected: 第 6 次返回 200 且页面显示"登录尝试过多"
```

- [ ] **Step 4: Commit**

```bash
git add app/controller/Auth.php
git commit -m "security: 添加登录暴力破解防护（5次/5分钟锁定15分钟）"
git push origin main
```

---

### Task 1.5: 反馈关闭路由改为 POST

**Files:**
- Modify: `route/app.php`
- Modify: `app/view/admin/feedback/index.html`

- [ ] **Step 1: 修改路由**

`route/app.php`:
```php
// 旧
Route::get('feedback/close/:id', 'admin.Feedback/close');
// 新
Route::post('feedback/close/:id', 'admin.Feedback/close');
```

- [ ] **Step 2: 修改前端关闭按钮为表单**

修改 `app/view/admin/feedback/index.html` 中关闭操作：
```html
<!-- 旧 -->
<a href="/admin/feedback/close/{$item.id}" onclick="return confirm('确定关闭该反馈？')">
    <i class="fas fa-times"></i>
</a>

<!-- 新 -->
<form action="/admin/feedback/close/{$item.id}" method="post" class="inline" onsubmit="return confirm('确定关闭该反馈？')">
    <input type="hidden" name="__token__" value="{:session('__csrf_token__')}">
    <button type="submit" class="text-gray-400 hover:text-gray-600 transition-colors">
        <i class="fas fa-times"></i>
    </button>
</form>
```

- [ ] **Step 3: 验证**

```bash
curl -s -o /dev/null -w "%{http_code}" -b /tmp/cookie.txt http://localhost:8000/admin/feedback/close/1
# Expected: 403 或 405（GET 不再允许）
```

- [ ] **Step 4: Commit**

```bash
git add route/app.php app/view/admin/feedback/index.html
git commit -m "security: 反馈关闭路由 GET 改为 POST，添加 CSRF 保护"
git push origin main
```

---

## Phase 2: Bug 修复

### Task 2.1: 注册确认密码字段对齐

**Files:**
- Modify: `app/view/auth/register.html`

- [ ] **Step 1: 修改模板字段名**

```bash
cd /Users/ion/xm/webnav
sed -i '' 's/name="password_confirm"/name="confirm_password"/g' app/view/auth/register.html
```

- [ ] **Step 2: 验证注册流程**

```bash
# 确认注册成功（正确密码 + 匹配确认）
curl -s -L -X POST -d "username=testreg1&password=pass123&confirm_password=pass123&email=testreg1@test.com" http://localhost:8000/register -o /dev/null -w "HTTP %{http_code} -> %{url_effective}\n"
# Expected: 302 -> /

# 确认密码不匹配应返回错误
curl -s -X POST -d "username=testreg2&password=pass123&confirm_password=wrong&email=testreg2@test.com" http://localhost:8000/register 2>&1 | grep -c "不一致"
# Expected: 1
```

- [ ] **Step 3: Commit**

```bash
git add app/view/auth/register.html
git commit -m "fix: 注册确认密码字段名与控制器对齐（password_confirm → confirm_password）"
git push origin main
```

---

### Task 2.2: 统计模块修复 — todayClicks + 真实趋势

**Files:**
- Modify: `app/controller/admin/Index.php:21-24`
- Modify: `app/controller/admin/Stats.php:16-47`

- [ ] **Step 1: 修复仪表盘 todayClicks**

修改 `app/controller/admin/Index.php` 第 21-24 行：
```php
// 旧
$todayClicks = 0;

// 新
use app\model\ClickLog;
$todayClicks = ClickLog::where('created_at', '>=', date('Y-m-d 00:00:00'))
    ->where('created_at', '<=', date('Y-m-d 23:59:59'))
    ->count();
```

- [ ] **Step 2: 修复统计页趋势查询**

修改 `app/controller/admin/Stats.php` 的 `dailyTrends` 查询：
```php
// 旧（错误：按站点创建日期分组）
$dailyTrends = Db::name('sites')
    ->field('DATE(created_at) AS date, SUM(click_count) AS click_count')
    ->whereTime('created_at', 'between', [date('Y-m-d', strtotime('-30 days')), date('Y-m-d')])
    ->group('DATE(created_at)')
    ->order('date', 'asc')
    ->select();

// 新（正确：按点击日志日期分组）
$dailyTrends = Db::name('click_logs')
    ->field('DATE(created_at) AS date, COUNT(*) AS click_count')
    ->whereTime('created_at', 'between', [date('Y-m-d', strtotime('-30 days')), date('Y-m-d')])
    ->group('DATE(created_at)')
    ->order('date', 'asc')
    ->select();
```

- [ ] **Step 3: 验证**

```bash
# 点击一个站点产生 click_log
curl -s -b /tmp/cookie.txt "http://localhost:8000/redirect?url=https://github.com"
# 检查统计页数据
curl -s -b /tmp/cookie.txt http://localhost:8000/admin/stats 2>&1 | grep -o 'click_count' | wc -l
# Expected: > 0
```

- [ ] **Step 4: Commit**

```bash
git add app/controller/admin/Index.php app/controller/admin/Stats.php
git commit -m "fix: 统计模块修复 — todayClicks 真实数据 + 趋势用 click_logs"
git push origin main
```

---

### Task 2.3: favicon / icon_url 字段统一

**Files:**
- Modify: `app/view/admin/site/add.html`
- Modify: `app/view/admin/site/edit.html`
- Modify: `app/controller/admin/Site.php:54,92`
- Modify: `app/controller/My.php:139-155`

- [ ] **Step 1: 修改 admin site 表单字段名**

```bash
cd /Users/ion/xm/webnav
sed -i '' 's/name="favicon"/name="icon_url"/g' app/view/admin/site/add.html
sed -i '' 's/name="favicon"/name="icon_url"/g' app/view/admin/site/edit.html
sed -i '' 's/\$site.favicon/\$site.icon_url/g' app/view/admin/site/add.html
sed -i '' 's/\$site.favicon/\$site.icon_url/g' app/view/admin/site/edit.html
```

- [ ] **Step 2: 修改 admin.Site 控制器 only() 白名单**

在 `app/controller/admin/Site.php` 的 `add()` 和 `edit()` 方法中，`$this->request->only([...])` 数组加入 `'icon_url'`。

- [ ] **Step 3: 修改 My::addCategory() 保存 icon**

修改 `app/controller/My.php` 的 `addCategory()` 方法：
```php
Category::create([
    'name'       => $name,
    'user_id'    => $userId,
    'icon'       => $this->request->post('icon', 'fas fa-folder'),  // 新增
    'sort_order' => $this->request->post('sort_order', 0),
]);
```

- [ ] **Step 4: 验证**

```bash
# 验证 admin site add/edit 中 icon_url 字段保存
curl -s -b /tmp/cookie.txt http://localhost:8000/admin/site/add 2>&1 | grep -c "icon_url"
# Expected: > 0
```

- [ ] **Step 5: Commit**

```bash
git add app/view/admin/site/add.html app/view/admin/site/edit.html app/controller/admin/Site.php app/controller/My.php
git commit -m "fix: favicon 字段统一为 icon_url，My 添加分类支持 icon 字段"
git push origin main
```

---

### Task 2.4: 后台登出链接修复

**Files:**
- Modify: `app/view/admin_layout.html:77`

- [ ] **Step 1: 修改链接**

```bash
cd /Users/ion/xm/webnav
sed -i '' 's|href="/admin/logout"|href="/logout"|g' app/view/admin_layout.html
```

- [ ] **Step 2: 验证**

```bash
curl -s -b /tmp/cookie.txt http://localhost:8000/admin 2>&1 | grep "/logout" | head -1
# Expected: 包含 href="/logout"
```

- [ ] **Step 3: Commit**

```bash
git add app/view/admin_layout.html
git commit -m "fix: 后台登出链接从 /admin/logout 改为 /logout"
git push origin main
```

---

### Task 2.5: 后台用户编辑支持 email 字段

**Files:**
- Modify: `app/controller/admin/User.php`

- [ ] **Step 1: 修改 edit() 保存逻辑**

修改 `app/controller/admin/User.php` 的 `edit()` 方法，在 `$this->request->only()` 中加入 `'email'`：
```php
$data = $this->request->only(['role', 'status', 'email']);
```

- [ ] **Step 2: 验证**

```bash
# 编辑用户 email
curl -s -c /tmp/cookie.txt -X POST -d "username=admin&password=admin123" http://localhost:8000/login -o /dev/null
curl -s -b /tmp/cookie.txt -X POST -d "role=admin&status=1&email=newemail@test.com" http://localhost:8000/admin/user/edit/2 -o /dev/null -w "%{http_code}\n"
# Expected: 302
```

- [ ] **Step 3: Commit**

```bash
git add app/controller/admin/User.php
git commit -m "fix: 后台用户编辑支持 email 字段保存"
git push origin main
```

---

### Task 2.6: 书签导入支持 category 选择

**Files:**
- Modify: `app/controller/My.php:157-175, 177-230`

- [ ] **Step 1: 修改 import() POST 处理**

修改 `app/controller/My.php` 的 `import()` 方法：
```php
if (!$file) {
    View::assign('error', '请选择文件');
    return View::fetch('index/my/import');
}

$categoryId = (int) $this->request->post('category_id', 0);
$content = $file->getContent();
$this->parseBookmarkHtml($content, $userId, $categoryId);
```

- [ ] **Step 2: 修改 parseBookmarkHtml 签名**

```php
private function parseBookmarkHtml(string $content, int $userId, int $categoryId = 0): void
{
    // 指定了 category_id 时，所有网站导入到该分类
    if ($categoryId > 0) {
        $category = Category::find($categoryId);
        if (!$category || $category->user_id != $userId) {
            return;
        }
        preg_match_all('/<DT><A\s+([^>]*)>(.*?)<\/A>/i', $content, $links, PREG_SET_ORDER);
        foreach ($links as $link) {
            $attrs = $link[1];
            $title = $link[2];
            preg_match('/HREF\s*=\s*"([^"]+)"/i', $attrs, $urlMatch);
            $url = $urlMatch[1] ?? '';
            if (empty($url)) continue;
            Site::create([
                'title'       => $title,
                'url'         => $url,
                'category_id' => $categoryId,
                'user_id'     => $userId,
                'is_public'   => 0,
                'click_count' => 0,
            ]);
        }
        return;
    }

    // 否则按原逻辑：每个 H3 文件夹创建新分类
    // ... 保持原有代码不变
}
```

- [ ] **Step 3: 验证**

```bash
# 检查导入页面有 category 选择下拉框
curl -s -b /tmp/cookie.txt http://localhost:8000/my/import 2>&1 | grep -c "category_id"
# Expected: 1
```

- [ ] **Step 4: Commit**

```bash
git add app/controller/My.php
git commit -m "fix: 书签导入支持选择目标分类，不指定时按文件夹创建"
git push origin main
```

---

### Task 2.7: 添加站点必填验证

**Files:**
- Modify: `app/controller/My.php:47-82`

- [ ] **Step 1: 在 My::addSite() 加入必填验证**

在 `$userId = session('user_id');` 之后、`$data = $this->request->post();` 之后添加：
```php
if (empty($data['title']) || empty($data['url'])) {
    View::assign('error', '网站名称和地址不能为空');
    $categories = Category::where('user_id', $userId)->order('sort_order', 'asc')->select();
    View::assign('categories', $categories);
    return View::fetch('index/my/addSite');
}
```

- [ ] **Step 2: 验证**

```bash
# 提交空 title 应返回错误提示
curl -s -b /tmp/cookie.txt -X POST -d "title=&url=https://test.com&category_id=1" http://localhost:8000/my/addSite 2>&1 | grep -c "不能为空"
# Expected: 1
```

- [ ] **Step 3: Commit**

```bash
git add app/controller/My.php
git commit -m "fix: My::addSite 添加 title/url 必填验证"
git push origin main
```

---

## Phase 3: 代码质量

### Task 3.1: 创建模板 partials（站点卡片 + flash 消息）

**Files:**
- Create: `app/view/partials/site_card.html`
- Create: `app/view/partials/flash.html`
- Modify: `app/view/index/index.html`
- Modify: `app/view/index/search.html`
- Modify: `app/view/index/newest.html`
- Modify: `app/view/index/popular.html`
- Modify: `app/view/my/index.html`

- [ ] **Step 1: 创建站点卡片 partial**

`app/view/partials/site_card.html`:
```html
<a href="/redirect?url={$site.url}" target="_blank" class="block bg-white rounded-lg shadow-sm hover:shadow-md border border-gray-100 p-4 transition-all duration-200 hover:-translate-y-0.5 group">
    <div class="flex items-start gap-3">
        <img src="{$site.favicon|default='/static/default-favicon.svg'}" alt="" class="w-6 h-6 mt-0.5 rounded flex-shrink-0" onerror="this.src='/static/default-favicon.svg'">
        <div class="min-w-0 flex-1">
            <h3 class="text-sm font-medium text-gray-900 group-hover:text-indigo-600 transition-colors truncate">{$site.title}</h3>
            <p class="text-xs text-gray-500 mt-1 line-clamp-2">{$site.description|default=''}</p>
        </div>
    </div>
</a>
```

- [ ] **Step 2: 创建 flash 消息 partial**

`app/view/partials/flash.html`:
```html
{if isset($error)}
<div class="mb-5 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
    <i class="fas fa-exclamation-circle text-red-500"></i>
    <span class="text-sm text-red-700">{$error}</span>
</div>
{/if}
{if isset($success)}
<div class="mb-5 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
    <i class="fas fa-check-circle text-green-500"></i>
    <span class="text-sm text-green-700">{$success}</span>
</div>
{/if}
```

- [ ] **Step 3: 替换所有模板引用**

搜索 `app/view/index/` 和 `app/view/my/` 中站点卡片 HTML，替换为：
```html
{include file="partials/site_card" /}
```

搜索 flash 消息 HTML，替换为：
```html
{include file="partials/flash" /}
```

- [ ] **Step 4: 创建默认 favicon SVG**

`public/static/default-favicon.svg`:
```svg
<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
  <rect width="32" height="32" rx="4" fill="#E5E7EB"/>
  <path d="M16 8L20 16L16 24L12 16L16 8Z" fill="#9CA3AF"/>
</svg>
```

- [ ] **Step 5: 验证所有页面正常**

```bash
for u in / "/search?keyword=test" /newest /popular /my; do
  code=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000${u})
  echo "$code $u"
done
# Expected: all 200
```

- [ ] **Step 6: Commit**

```bash
git add app/view/partials/ app/view/index/ app/view/my/ public/static/default-favicon.svg
git commit -m "refactor: 提取站点卡片和 flash 消息为 view partials，添加默认 favicon"
git push origin main
```

---

### Task 3.2: Site Model 添加 favicon accessor

**Files:**
- Modify: `app/model/Site.php`

- [ ] **Step 1: 添加 accessor**

在 `app/model/Site.php` 中添加：
```php
public function getFaviconAttr($value, $data)
{
    if (!empty($data['icon_url'])) {
        return $data['icon_url'];
    }
    $parsed = parse_url($data['url'] ?? '');
    $host = $parsed['host'] ?? '';
    return $host ? 'https://www.google.com/s2/favicons?domain=' . $host . '&sz=32' : '';
}
```

- [ ] **Step 2: 删除控制器中的重复逻辑**

删除以下方法中的 `if (empty($site->icon_url))` 代码块：
- `Index::index()` 第 27-33 行
- `Index::newest()` 对应行
- `Index::popular()` 对应行
- `Index::search()` 对应行

- [ ] **Step 3: 验证**

```bash
curl -s http://localhost:8000/ 2>&1 | grep -c "google.com/s2/favicons"
# Expected: > 0 (favicon 仍正常生成)
```

- [ ] **Step 4: Commit**

```bash
git add app/model/Site.php app/controller/Index.php
git commit -m "refactor: 提取 favicon 生成逻辑到 Site::getFaviconAttr accessor"
git push origin main
```

---

### Task 3.3: 中间件声明去重

**Files:**
- Modify: `app/controller/My.php:15`
- Modify: `app/controller/admin/Index.php:17`
- Modify: `app/controller/admin/Category.php`
- Modify: `app/controller/admin/Site.php:16`
- Modify: `app/controller/admin/User.php`
- Modify: `app/controller/admin/Stats.php`
- Modify: `app/controller/admin/Page.php`
- Modify: `app/controller/admin/Feedback.php`

- [ ] **Step 1: 删除所有控制器中的 $middleware 属性**

因为路由分组已经声明了中间件，所有 admin 控制器和 My 控制器的 `protected $middleware = [AuthCheck::class, AdminCheck::class];` 行全部删除。

```bash
cd /Users/ion/xm/webnav
# My controller
sed -i '' "/protected \$middleware = \[AuthCheck::class\];/d" app/controller/My.php
# All admin controllers
find app/controller/admin -name "*.php" -exec sed -i '' "/protected \$middleware = \[AuthCheck::class, AdminCheck::class\];/d" {} \;
```

- [ ] **Step 2: 验证**

```bash
# 确认所有页面仍能正常访问
for u in /my /admin /admin/categories /admin/sites /admin/users /admin/stats; do
  code=$(curl -s -o /dev/null -w "%{http_code}" -b /tmp/cookie.txt http://localhost:8000${u})
  echo "$code $u"
done
# Expected: all 200
```

- [ ] **Step 3: Commit**

```bash
git add app/controller/My.php app/controller/admin/
git commit -m "refactor: 删除控制器中冗余的 $middleware 声明（路由分组已处理）"
git push origin main
```

---

### Task 3.4: 删除死代码

**Files:**
- Delete: `app/model/Favorite.php`
- Modify: 所有视图中的 `_method=DELETE/PUT` 隐藏域

- [ ] **Step 1: 删除 Favorite 模型**

```bash
rm /Users/ion/xm/webnav/app/model/Favorite.php
```

- [ ] **Step 2: 删除模板中的无效 method 隐藏域**

```bash
cd /Users/ion/xm/webnav
find app/view -name "*.html" -exec sed -i '' '/name="_method".*DELETE\|name="_method".*PUT/d' {} \;
```

- [ ] **Step 3: 验证所有路由正常**

```bash
php think route:list | wc -l
# Expected: 包含所有路由，无报错
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "refactor: 删除未使用的 Favorite 模型和无效 _method 隐藏域"
git push origin main
```

---

## Phase 4: UX 优化

### Task 4.1: 首页分类懒加载

**Files:**
- Create: `app/controller/Api.php`
- Modify: `app/controller/Index.php:16-40`
- Modify: `app/view/index/index.html`
- Modify: `route/app.php`

- [ ] **Step 1: 创建 API 控制器**

`app/controller/Api.php`:
```php
<?php
declare(strict_types=1);

namespace app\controller;

use app\BaseController;
use app\model\Category;
use app\model\Site;

class Api extends BaseController
{
    public function categorySites()
    {
        $categoryId = (int) request()->param('id', 0);
        if (empty($categoryId)) return json(['code' => 1, 'msg' => '缺少分类ID']);

        $category = Category::find($categoryId);
        if (!$category) return json(['code' => 1, 'msg' => '分类不存在']);

        $sites = Site::where('category_id', $categoryId)
            ->where('is_public', 1)
            ->order('sort_order', 'asc')
            ->select()
            ->toArray();

        return json(['code' => 0, 'data' => $sites]);
    }
}
```

- [ ] **Step 2: 添加路由**

`route/app.php`:
```php
Route::get('api/category/sites', 'Api/categorySites');
```

- [ ] **Step 3: 修改 Index::index() — 不再查询站点**

```php
$categories = Category::where('user_id', null)
    ->order('sort_order', 'asc')
    ->select();

View::assign('categories', $categories);
return View::fetch();
```

- [ ] **Step 4: 修改模板 — 懒加载**

`app/view/index/index.html` 中，站点卡片区改为：
```html
<div class="category-content" id="category-{$category.id}" data-category-id="{$category.id}">
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4" id="sites-{$category.id}">
        <div class="col-span-full text-center py-4 text-gray-400 text-sm">
            <i class="fas fa-spinner fa-pulse mr-1"></i>加载中...
        </div>
    </div>
</div>
```

- [ ] **Step 5: 添加 AJAX 加载 JS**

在 `index/index.html` 的 `js` block 中添加：
```javascript
const siteCache = new Map();
function toggleCategory(btn) {
    var content = btn.nextElementSibling;
    var arrow = btn.querySelector('.category-arrow');
    content.classList.toggle('collapsed');
    arrow.style.transform = content.classList.contains('collapsed') ? 'rotate(-90deg)' : 'rotate(0deg)';

    var categoryId = content.dataset.categoryId;
    if (!content.classList.contains('collapsed') && !siteCache.has(categoryId)) {
        fetch('/api/category/sites?id=' + categoryId)
            .then(r => r.json())
            .then(res => {
                if (res.code === 0) {
                    siteCache.set(categoryId, true);
                    var container = document.getElementById('sites-' + categoryId);
                    container.innerHTML = res.data.map(site => renderSiteCard(site)).join('');
                }
            });
    }
}

function renderSiteCard(site) {
    var icon = site.icon_url || 'https://www.google.com/s2/favicons?domain=' + (new URL(site.url)).hostname + '&sz=32';
    return '<a href="/redirect?url=' + encodeURIComponent(site.url) + '" target="_blank" class="block bg-white rounded-lg shadow-sm hover:shadow-md border border-gray-100 p-4 transition-all duration-200 hover:-translate-y-0.5 group">'
        + '<div class="flex items-start gap-3">'
        + '<img src="' + icon + '" alt="" class="w-6 h-6 mt-0.5 rounded flex-shrink-0" onerror="this.src=\\'/static/default-favicon.svg\\'">'
        + '<div class="min-w-0 flex-1">'
        + '<h3 class="text-sm font-medium text-gray-900 group-hover:text-indigo-600 transition-colors truncate">' + esc(site.title) + '</h3>'
        + '<p class="text-xs text-gray-500 mt-1 line-clamp-2">' + esc(site.description || '') + '</p>'
        + '</div></div></a>';
}
function esc(s) { var d = document.createElement('div'); d.innerText = s; return d.innerHTML; }
```

- [ ] **Step 6: 验证**

```bash
curl -s "http://localhost:8000/api/category/sites?id=1" | python3 -c "import sys,json; d=json.load(sys.stdin); print('OK' if d['code']==0 else 'FAIL', d.get('msg',''))"
# Expected: OK
```

- [ ] **Step 7: Commit**

```bash
git add app/controller/Api.php route/app.php app/controller/Index.php app/view/index/index.html
git commit -m "feat: 首页分类懒加载 + API 接口，首屏不查询站点列表"
git push origin main
```

---

### Task 4.2: 后台批量操作

**Files:**
- Modify: `app/view/admin/category/index.html`
- Modify: `app/view/admin/site/index.html`
- Modify: `app/view/admin/user/index.html`
- Modify: `app/view/admin/feedback/index.html`
- Create: 对应控制器 batch 方法

- [ ] **Step 1: 在各列表页添加 checkbox 列 + 批量操作栏**

以分类列表为例，`app/view/admin/category/index.html` 在表格头部添加：
```html
<th class="px-6 py-3 text-center font-medium"><input type="checkbox" onclick="toggleAll(this)"</th>
```

每行添加：
```html
<td class="px-6 py-3 text-center"><input type="checkbox" name="ids[]" value="{$item.id}" class="batch-check"></td>
```

表格上方添加批量操作栏：
```html
<div class="px-6 py-2 border-b border-gray-100 flex items-center gap-3 bg-red-50 hidden" id="batchBar">
    <span class="text-sm text-red-600">已选 <span id="batchCount">0</span> 项</span>
    <form action="/admin/categories/batch-delete" method="post" class="inline" onsubmit="return submitBatch(this, 'delete')">
        <input type="hidden" name="ids" id="batchIds" value="">
        <input type="hidden" name="__token__" value="{:session('__csrf_token__')}">
        <button type="submit" class="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700">
            <i class="fas fa-trash-alt"></i> 批量删除
        </button>
    </form>
</div>
```

JS:
```javascript
function toggleAll(el) { document.querySelectorAll('.batch-check').forEach(c => c.checked = el.checked); updateBatchBar(); }
document.querySelectorAll('.batch-check').forEach(c => c.onchange = updateBatchBar);
function updateBatchBar() {
    var ids = []; document.querySelectorAll('.batch-check:checked').forEach(c => ids.push(c.value));
    document.getElementById('batchIds').value = ids.join(',');
    document.getElementById('batchCount').innerText = ids.length;
    document.getElementById('batchBar').classList.toggle('hidden', ids.length === 0);
}
```

- [ ] **Step 2: 添加批量删除控制器方法**

`admin/Category.php` 添加：
```php
public function batchDelete()
{
    $ids = $this->request->post('ids', '');
    if (empty($ids)) return redirect('/admin/categories')->with('error', '请选择分类');
    $idArr = array_filter(explode(',', $ids), 'is_numeric');
    if (empty($idArr)) return redirect('/admin/categories')->with('error', '无效的选择');
    Category::destroy($idArr);
    return redirect('/admin/categories')->with('success', '已批量删除' . count($idArr) . '个分类');
}
```

类似方式添加到 admin/Site、admin/User、admin/Feedback 控制器。

- [ ] **Step 3: 添加批量路由**

`route/app.php` 中添加：
```php
Route::post('categories/batch-delete', 'admin.Category/batchDelete');
Route::post('sites/batch-delete', 'admin.Site/batchDelete');
Route::post('users/batch-delete', 'admin.User/batchDelete');
Route::post('users/batch-toggle', 'admin.User/batchToggle');
Route::post('feedbacks/batch-close', 'admin.Feedback/batchClose');
```

- [ ] **Step 4: 验证**

```bash
curl -s -b /tmp/cookie.txt http://localhost:8000/admin/categories 2>&1 | grep -c "batch-check"
# Expected: > 0
```

- [ ] **Step 5: Commit**

```bash
git add app/view/admin/ app/controller/admin/ route/app.php
git commit -m "feat: 后台列表页添加批量选择删除/操作功能"
git push origin main
```

---

### Task 4.3: 书签拖拽排序

**Files:**
- Modify: `app/view/my/index.html`
- Modify: `route/app.php`
- Modify: `app/controller/My.php`

- [ ] **Step 1: 添加拖拽标记和事件**

在 `my/index.html` 中个人分类的站点卡片外层加 `draggable="true"` 和 `data-sort="{$site.sort_order}"` `data-id="{$site.id}"`，以及 `dragstart` / `dragover` / `drop` 事件处理。

- [ ] **Step 2: 添加路由**

`route/app.php`:
```php
Route::post('my/reorder', 'My/reorder');
```

- [ ] **Step 3: 添加 reorder 方法**

`app/controller/My.php`:
```php
public function reorder()
{
    $userId = session('user_id');
    $ids = $this->request->post('ids', '');
    if (empty($ids)) return json(['code' => 1, 'msg' => '缺少数据']);

    $idArr = explode(',', $ids);
    foreach ($idArr as $sort => $id) {
        Site::where('id', $id)->where('user_id', $userId)->update(['sort_order' => $sort]);
    }

    return json(['code' => 0, 'msg' => '排序已更新']);
}
```

- [ ] **Step 4: 验证**

```bash
curl -s -b /tmp/cookie.txt http://localhost:8000/my 2>&1 | grep -c "draggable"
# Expected: > 0
```

- [ ] **Step 5: Commit**

```bash
git add app/view/my/index.html route/app.php app/controller/My.php
git commit -m "feat: 书签页支持拖拽排序 + /my/reorder 接口"
git push origin main
```

---

### Task 4.4: 分页增强

**Files:**
- Modify: `app/controller/Index.php:46-74, 88-105`
- Modify: `app/view/index/newest.html`
- Modify: `app/view/index/popular.html`
- Modify: `app/view/index/search.html`

- [ ] **Step 1: 修改控制器为新分页**

`Index::newest()`:
```php
// 旧
->limit(60)->select();
// 新
->paginate(24);
View::assign('sites', $sites);
```

`Index::popular()` 同理。
`Index::search()` 同理。

- [ ] **Step 2: 模板添加分页组件**

在三个模板的站点列表之后、空状态之前添加：
```html
<div class="mt-6 flex justify-center">
    {$sites|raw}
</div>
```

- [ ] **Step 3: 验证**

```bash
curl -s http://localhost:8000/newest 2>&1 | grep -c "page-link\|pagination"
# Expected: > 0
```

- [ ] **Step 4: Commit**

```bash
git add app/controller/Index.php app/view/index/newest.html app/view/index/popular.html app/view/index/search.html
git commit -m "feat: 最新/热门/搜索页面添加分页（每页24条）"
git push origin main
```

---

### Task 4.5: 空状态优化

**Files:**
- Modify: `app/view/index/index.html`
- Modify: `app/view/index/search.html`
- Modify: `app/view/admin/*/index.html`

- [ ] **Step 1: 首页分类无站点时显示占位文字**

在各空状态检查的地方统一使用：
```html
<p class="text-gray-400 text-lg">此分类暂无网站</p>
```

- [ ] **Step 2: Commit**

```bash
git add app/view/
git commit -m "ux: 统一空状态提示文案"
git push origin main
```

---

## 最终验证

全部任务完成后执行：

```bash
# 清除模板缓存
rm -rf runtime/temp/ && mkdir runtime/temp/

# 全路由测试
for u in / "/search?keyword=test" /newest /popular /login /register /about /privacy /feedback \
  /bookmarks /my /my/addSite /my/import /my/export \
  /admin /admin/categories /admin/category/add /admin/sites /admin/site/add \
  /admin/users /admin/stats /admin/pages /admin/feedbacks; do
  code=$(curl -s -o /dev/null -w "%{http_code}" -b /tmp/cookie.txt http://localhost:8000${u})
  printf "%s %s\n" "$code" "$u"
done

# 特殊验证
# CSRF: POST 不带 token 应 403
# 登录: 连续6次错误应锁定
# 注册: 密码不匹配应提示
# 重定向: 未知URL 应显示确认页
```

