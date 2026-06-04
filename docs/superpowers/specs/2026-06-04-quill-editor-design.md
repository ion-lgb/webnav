# 页面管理 Quill 富文本编辑器 — 设计方案

> 日期：2026-06-04 | 版本：1.0

## 概述

后台"页面管理"编辑页面中，将纯 HTML 文本域替换为 Quill 富文本编辑器。

---

## 一、技术方案

- **编辑器**：Quill 2.x（npm 安装，本地化）
- **工具栏**：标题(h1-h4)、加粗、斜体、有序/无序列表、链接、引用块、代码块、分割线、清除格式
- **数据流**：Quill 绑定隐藏 `<textarea name="content">`，提交时自动同步 HTML
- **安全**：服务端 HTMLPurifier 过滤（已有），前端只提供编辑体验

---

## 二、文件变更

### 新增
- `public/static/js/quill.js` — Quill 编译后的 JS
- `public/static/css/quill.css` — Quill 样式

### 修改
- `app/view/admin/page/edit.html` — textarea 替换为 editor div + Quill JS 初始化

---

## 三、实现要点

```html
<!-- 文本域改为隐藏域 + 编辑器容器 -->
<textarea name="content" id="contentTextarea" class="hidden">{$page.content}</textarea>
<div id="editor" style="min-height:300px"></div>

<script src="/static/js/quill.js"></script>
<link rel="stylesheet" href="/static/css/quill.css">
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

---

## 四、测试清单
- [ ] Quill 编辑器正常渲染
- [ ] 输入内容自动同步到隐藏 textarea
- [ ] 提交后服务端 HTMLPurifier 过滤正常
- [ ] 再次编辑时已有内容正确回填
