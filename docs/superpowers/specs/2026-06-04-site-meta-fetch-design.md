# 网站智能填充功能 — 设计方案

> 日期：2026-06-04 | 版本：1.0

## 概述

用户在添加/编辑网站时，输入 URL 后点击"智能填充"按钮，自动获取目标网站的标题、图标和描述并填入表单。

---

## 一、API 接口

### `GET /api/fetch-site-meta?url=<encoded_url>`

**请求参数：** `url` — 完整网址（含 `http(s)://`）

**成功响应：**
```json
{
  "code": 0,
  "data": {
    "title": "GitHub",
    "description": "GitHub is where over 150 million developers shape the future of software.",
    "icon_url": "https://github.com/favicon.ico"
  }
}
```

**失败响应：**
```json
{
  "code": 1,
  "msg": "无法访问该网站"
}
```

**实现逻辑：**
1. 校验 URL 格式（`filter_var(FILTER_VALIDATE_URL)` + 仅允许 http/https）
2. cURL 请求目标页面，超时 5 秒，follow redirects 最多 3 次
3. 用正则提取 `<title>(.*?)</title>` 和 `<meta name="description" content="(.*?)">`
4. favicon 优先取 `<link rel="icon" href="...">` 或 `<link rel="shortcut icon" href="...">`，将相对路径补全为绝对 URL；若未找到取 Google Favicon API 兜底
5. 返回 JSON，异常时返回 `code:1`

**超时/容错：** 5 秒超时，HTTP 非 2xx 返回 `code:1`

---

## 二、前端改动

### 涉及模板（4 个）
- `app/view/my/add_site.html`
- `app/view/my/edit_site.html`
- `app/view/admin/site/add.html`
- `app/view/admin/site/edit.html`

### 改动内容

**按钮改造：**
- 文案："自动图标" → "智能填充"
- 图标：`fa-magic` → `fa-wand-magic-sparkles`

**JS 函数重写 `autoFill`（原 `autoFillIcon`）：**
```javascript
function autoFill() {
    var urlInput = document.getElementById('siteUrl');
    var url = urlInput.value.trim();
    if (!url || !url.startsWith('http')) return;

    var titleInput = document.querySelector('[name="title"]');
    var descInput = document.querySelector('[name="description"]');
    var iconInput = document.querySelector('[name="icon_url"]');
    var iconPreview = document.getElementById('iconPreview');
    var btn = document.querySelector('[onclick*="autoFill"]');
    var originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-pulse mr-1"></i>获取中...';
    btn.disabled = true;

    fetch('/api/fetch-site-meta?url=' + encodeURIComponent(url))
        .then(function(r) { return r.json(); })
        .then(function(res) {
            if (res.code === 0) {
                if (!titleInput.value) titleInput.value = res.data.title || '';
                if (!descInput.value) descInput.value = res.data.description || '';
                if (!iconInput.value && res.data.icon_url) {
                    iconInput.value = res.data.icon_url;
                    if (iconPreview) { iconPreview.src = res.data.icon_url; iconPreview.classList.remove('hidden'); }
                }
            } else {
                alert('获取失败: ' + (res.msg || '未知错误'));
            }
        })
        .catch(function() { alert('请求失败，请检查网络'); })
        .finally(function() {
            btn.innerHTML = originalText;
            btn.disabled = false;
        });
}
```

**规则：只覆盖空字段** — title、description、icon_url 已有值时跳过覆盖，允许用户手动输入优先。

---

## 三、文件清单

### 新增
- `app/controller/Api.php` — 追加 `fetchSiteMeta()` 方法

### 修改
- `route/app.php` — 新增路由
- `app/view/my/add_site.html` — 按钮 + JS + 表单 onblur 移除改为 button click
- `app/view/my/edit_site.html` — 同上
- `app/view/admin/site/add.html` — 同上
- `app/view/admin/site/edit.html` — 同上

---

## 四、测试清单
- [ ] `GET /api/fetch-site-meta?url=https://github.com` 返回标题+描述+图标
- [ ] 无效 URL 返回 `code:1`
- [ ] 无法访问的 URL 返回 `code:1`
- [ ] 前端"智能填充"按钮点击后填入数据
- [ ] 已有内容不被覆盖
- [ ] 后端 5 秒超时
