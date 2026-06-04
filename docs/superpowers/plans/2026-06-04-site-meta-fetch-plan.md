# 网站智能填充 — 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 输入 URL 后点击"智能填充"按钮，自动获取目标网站的标题、图标、描述并填入表单

**Architecture:** 后端 cURL 抓取目标页面正则提取 meta 信息，前端 fetch 调 API 后填入空字段

**Tech Stack:** ThinkPHP 8 + cURL + Vanilla JS

---

### Task 1: 后端 API — fetchSiteMeta

**Files:**
- Modify: `app/controller/Api.php`
- Modify: `route/app.php`

- [ ] **Step 1: 添加路由**

在 `route/app.php` 的 `api/category/sites` 附近添加：
```php
Route::get('api/fetch-site-meta', 'Api/fetchSiteMeta');
```

- [ ] **Step 2: 添加 fetchSiteMeta 方法**

在 `app/controller/Api.php` 的 `Api` 类中追加：
```php
public function fetchSiteMeta()
{
    $url = request()->param('url', '');

    if (empty($url) || !filter_var($url, FILTER_VALIDATE_URL) || !preg_match('#^https?://#i', $url)) {
        return json(['code' => 1, 'msg' => '无效的网址格式']);
    }

    $html = $this->httpGet($url);
    if ($html === false) {
        return json(['code' => 1, 'msg' => '无法访问该网站']);
    }

    $title = '';
    $description = '';
    $iconUrl = '';

    preg_match('#<title[^>]*>(.*?)</title>#is', $html, $titleMatch);
    if (!empty($titleMatch[1])) {
        $title = html_entity_decode(trim($titleMatch[1]), ENT_QUOTES, 'UTF-8');
    }

    preg_match('#<meta\s+name=["\']description["\']\s+content=["\']([^"\']+)["\']#is', $html, $descMatch);
    if (empty($descMatch)) {
        preg_match('#<meta\s+content=["\']([^"\']+)["\']\s+name=["\']description["\']#is', $html, $descMatch);
    }
    if (!empty($descMatch[1])) {
        $description = html_entity_decode(trim($descMatch[1]), ENT_QUOTES, 'UTF-8');
    }

    preg_match('#<link\s+[^>]*rel=["\'](?:shortcut\s+)?icon["\'][^>]*href=["\']([^"\']+)["\']#is', $html, $iconMatch);
    if (empty($iconMatch)) {
        preg_match('#<link\s+[^>]*href=["\']([^"\']+)["\'][^>]*rel=["\'](?:shortcut\s+)?icon["\']#is', $html, $iconMatch);
    }
    if (!empty($iconMatch[1])) {
        $iconUrl = $iconMatch[1];
        if (!preg_match('#^https?://#i', $iconUrl)) {
            $parsed = parse_url($url);
            $base = $parsed['scheme'] . '://' . $parsed['host'];
            $iconUrl = $base . '/' . ltrim($iconUrl, '/');
        }
    }

    if (empty($iconUrl)) {
        $parsed = parse_url($url);
        $iconUrl = 'https://www.google.com/s2/favicons?domain=' . ($parsed['host'] ?? '') . '&sz=32';
    }

    return json([
        'code' => 0,
        'data' => [
            'title'       => $title,
            'description' => $description,
            'icon_url'    => $iconUrl,
        ],
    ]);
}

private function httpGet(string $url)
{
    $ch = curl_init();
    curl_setopt_array($ch, [
        CURLOPT_URL            => $url,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_MAXREDIRS      => 3,
        CURLOPT_TIMEOUT        => 5,
        CURLOPT_SSL_VERIFYPEER => false,
        CURLOPT_USERAGENT      => 'Mozilla/5.0 (compatible; WebNav/1.0)',
        CURLOPT_HTTPHEADER     => ['Accept: text/html'],
    ]);
    $result = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    return ($httpCode >= 200 && $httpCode < 400) ? $result : false;
}
```

- [ ] **Step 3: 测试 API**

```bash
curl -s "http://localhost:8000/api/fetch-site-meta?url=https://github.com" | python3 -m json.tool
# Expected: {"code": 0, "data": {"title": "...", "description": "...", "icon_url": "..."}}

# 无效 URL
curl -s "http://localhost:8000/api/fetch-site-meta?url=not-a-url"
# Expected: {"code": 1, "msg": "无效的网址格式"}
```

- [ ] **Step 4: Commit**

```bash
git add app/controller/Api.php route/app.php
git commit -m "feat: 添加 /api/fetch-site-meta 网站元信息抓取接口"
git push origin main
```

---

### Task 2: 前端 — 四个表单模板改造

**Files:**
- Modify: `app/view/my/add_site.html`
- Modify: `app/view/my/edit_site.html`
- Modify: `app/view/admin/site/add.html`
- Modify: `app/view/admin/site/edit.html`

- [ ] **Step 1: 改造 my/add_site.html**

按钮区（第 31-36 行）：
```html
<!-- 旧 -->
<button type="button" onclick="autoFillIcon()" class="..."><i class="fas fa-magic mr-1"></i>自动图标</button>

<!-- 新 -->
<button type="button" id="autoFillBtn" onclick="autoFill()" class="px-3 py-2.5 bg-gray-100 text-gray-600 text-sm rounded-lg hover:bg-gray-200 transition-colors whitespace-nowrap">
    <i class="fas fa-wand-magic-sparkles mr-1"></i>智能填充
</button>
```

URL 输入框移除 `onblur="autoFillIcon()"` 属性。

JS 块（第 76-89 行）替换为：
```javascript
function autoFill() {
    var url = document.getElementById('siteUrl').value.trim();
    if (!url || !(url.startsWith('http://') || url.startsWith('https://'))) {
        alert('请先输入完整的网址（http/https 开头）');
        return;
    }
    var btn = document.getElementById('autoFillBtn');
    var originalHtml = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-pulse mr-1"></i>获取中...';
    btn.disabled = true;

    fetch('/api/fetch-site-meta?url=' + encodeURIComponent(url))
        .then(function(r) { return r.json(); })
        .then(function(res) {
            if (res.code === 0) {
                var d = res.data;
                if (d.title && !document.querySelector('[name="title"]').value) {
                    document.querySelector('[name="title"]').value = d.title;
                }
                if (d.description && !document.querySelector('[name="description"]').value) {
                    document.querySelector('[name="description"]').value = d.description;
                }
                if (d.icon_url && !document.querySelector('[name="icon_url"]').value) {
                    document.querySelector('[name="icon_url"]').value = d.icon_url;
                    var preview = document.getElementById('iconPreview');
                    if (preview) { preview.src = d.icon_url; preview.classList.remove('hidden'); }
                }
            } else {
                alert('获取失败: ' + (res.msg || '未知错误'));
            }
        })
        .catch(function() { alert('请求失败，请检查网络'); })
        .finally(function() {
            btn.innerHTML = originalHtml;
            btn.disabled = false;
        });
}
```

- [ ] **Step 2: 改造 my/edit_site.html** — 同上改动（这个页面和 add_site 结构相同）

- [ ] **Step 3: 改造 admin/site/add.html 和 admin/site/edit.html** — 同样改造，但表单元素可能有差异（admin 版用 `icon_url` 字段，和 my 版一致，确认 `[name="icon_url"]` 选择器生效）

- [ ] **Step 4: 测试**

```bash
rm -rf runtime/temp/ && mkdir runtime/temp/

# 确认按钮存在
curl -s -c /tmp/vcookie.txt -X POST -d "username=admin&password=admin123" http://localhost:8000/login -o /dev/null
curl -s -b /tmp/vcookie.txt http://localhost:8000/my/addSite 2>&1 | grep -c "智能填充"
# Expected: 1

curl -s -b /tmp/vcookie.txt http://localhost:8000/admin/site/add 2>&1 | grep -c "智能填充"
# Expected: 1
```

- [ ] **Step 5: Commit**

```bash
git add app/view/my/add_site.html app/view/my/edit_site.html app/view/admin/site/add.html app/view/admin/site/edit.html
git commit -m "feat: 添加网站智能填充功能（标题+图标+描述自动获取）"
git push origin main
```

---

### 最终验证

```bash
# API 正常
curl -s "http://localhost:8000/api/fetch-site-meta?url=https://www.baidu.com" | python3 -c "import sys,json; d=json.load(sys.stdin); print('OK' if d['code']==0 else 'FAIL')"

# 页面正常
curl -s -o /dev/null -w "%{http_code}" -b /tmp/vcookie.txt http://localhost:8000/my/addSite
curl -s -o /dev/null -w "%{http_code}" -b /tmp/vcookie.txt http://localhost:8000/my/editSite/1
curl -s -o /dev/null -w "%{http_code}" -b /tmp/vcookie.txt http://localhost:8000/admin/site/add
curl -s -o /dev/null -w "%{http_code}" -b /tmp/vcookie.txt http://localhost:8000/admin/site/edit/1
# Expected: all 200
```
