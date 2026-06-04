# Quill 富文本编辑器 — 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 页面管理编辑页将纯 HTML textarea 替换为 Quill 富文本编辑器

**Architecture:** npm 安装 quill，复制 JS/CSS 到 public/static，修改模板用 div#editor + 隐藏 textarea 同步

**Tech Stack:** Quill 2.x + Vanilla JS

---

### Task 1: 安装 Quill + 修改页面编辑模板

**Files:**
- Create: `public/static/css/quill.snow.css`
- Create: `public/static/js/quill.js`
- Modify: `app/view/admin/page/edit.html`

- [ ] **Step 1: 安装 Quill**

```bash
cd /Users/ion/xm/webnav
npm install quill
cp node_modules/quill/dist/quill.js public/static/js/quill.js
cp node_modules/quill/dist/quill.snow.css public/static/css/quill.snow.css
```

- [ ] **Step 2: 修改编辑模板**

Read `app/view/admin/page/edit.html`, replace the textarea section:

旧（第 31-33 行左右）：
```html
            <textarea name="content" rows="20" class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all font-mono">{$page.content}</textarea>
```

改为：
```html
            <link rel="stylesheet" href="/static/css/quill.snow.css">
            <textarea name="content" id="contentTextarea" class="hidden">{$page.content}</textarea>
            <div id="editor" style="min-height:300px"></div>
```

同时给 JS block 添加 Quill 初始化（在已有的 `{block name="js"}` 或 `</form>` 之后）：
```html
<script src="/static/js/quill.js"></script>
<script>
var quill = new Quill('#editor', {
    theme: 'snow',
    modules: {
        toolbar: [
            [{ header: [1, 2, 3, 4, false] }],
            ['bold', 'italic'],
            [{ list: 'ordered' }, { list: 'bullet' }],
            ['link', 'blockquote', 'code-block', 'hr'],
            ['clean']
        ]
    }
});
quill.root.innerHTML = document.getElementById('contentTextarea').value;
quill.on('text-change', function() {
    document.getElementById('contentTextarea').value = quill.root.innerHTML;
});
</script>
```

- [ ] **Step 3: 测试**

```bash
rm -rf runtime/temp/ && mkdir runtime/temp/

# 确认编辑器 JS 文件可访问
curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/static/js/quill.js && echo " js"
curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/static/css/quill.snow.css && echo " css"

# 确认页面加载正常
curl -s -b /tmp/cookie.txt http://localhost:8000/admin/page/edit/1 2>&1 | grep -c "quill"
# Expected: > 0
```

- [ ] **Step 4: Commit**

```bash
git add public/static/css/quill.snow.css public/static/js/quill.js app/view/admin/page/edit.html
git commit -m "feat: 页面管理编辑页集成 Quill 富文本编辑器"
git push origin main
```

---

### 最终验证

浏览器打开 `/admin/page/edit/1`，确认：
- Quill 工具栏正常显示
- 已有内容正确回填到编辑器
- 编辑后提交，内容保存正常
- HTMLPurifier 过滤仍然生效（script 标签被移除）
