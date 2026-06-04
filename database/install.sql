-- WebNav 数据库初始化脚本
-- 使用方法: mysql -u root -p < install.sql

CREATE DATABASE IF NOT EXISTS `webnav` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `webnav`;

-- 用户表
CREATE TABLE IF NOT EXISTS `wn_users` (
    `id` int unsigned NOT NULL AUTO_INCREMENT,
    `username` varchar(50) NOT NULL COMMENT '用户名',
    `email` varchar(100) NOT NULL COMMENT '邮箱',
    `password` varchar(255) NOT NULL COMMENT '密码(bcrypt)',
    `role` enum('admin','user') NOT NULL DEFAULT 'user' COMMENT '角色',
    `avatar` varchar(255) DEFAULT NULL COMMENT '头像路径',
    `status` tinyint(1) NOT NULL DEFAULT 1 COMMENT '状态:1启用,0禁用',
    `created_at` datetime DEFAULT NULL,
    `updated_at` datetime DEFAULT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_username` (`username`),
    UNIQUE KEY `uk_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- 分类表
CREATE TABLE IF NOT EXISTS `wn_categories` (
    `id` int unsigned NOT NULL AUTO_INCREMENT,
    `user_id` int unsigned DEFAULT NULL COMMENT '所属用户(Null=公共分类)',
    `parent_id` int unsigned DEFAULT NULL COMMENT '父分类(Null=顶级)',
    `name` varchar(50) NOT NULL COMMENT '分类名',
    `sort_order` int NOT NULL DEFAULT 0 COMMENT '排序权重',
    `icon` varchar(50) DEFAULT NULL COMMENT '图标class',
    `created_at` datetime DEFAULT NULL,
    `updated_at` datetime DEFAULT NULL,
    PRIMARY KEY (`id`),
    KEY `idx_user_id` (`user_id`),
    KEY `idx_parent_id` (`parent_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='分类表';

-- 网站表
CREATE TABLE IF NOT EXISTS `wn_sites` (
    `id` int unsigned NOT NULL AUTO_INCREMENT,
    `user_id` int unsigned NOT NULL COMMENT '添加者',
    `category_id` int unsigned NOT NULL COMMENT '所属分类',
    `title` varchar(100) NOT NULL COMMENT '网站名称',
    `url` varchar(500) NOT NULL COMMENT '网址',
    `description` varchar(255) DEFAULT NULL COMMENT '描述',
    `icon_url` varchar(500) DEFAULT NULL COMMENT 'favicon URL',
    `screenshot` varchar(255) DEFAULT NULL COMMENT '截图路径',
    `click_count` int unsigned NOT NULL DEFAULT 0 COMMENT '点击次数',
    `sort_order` int NOT NULL DEFAULT 0 COMMENT '排序',
    `is_public` tinyint(1) NOT NULL DEFAULT 1 COMMENT '是否公开',
    `created_at` datetime DEFAULT NULL,
    `updated_at` datetime DEFAULT NULL,
    PRIMARY KEY (`id`),
    KEY `idx_user_id` (`user_id`),
    KEY `idx_category_id` (`category_id`),
    KEY `idx_click_count` (`click_count`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='网站表';

-- 收藏表
CREATE TABLE IF NOT EXISTS `wn_favorites` (
    `id` int unsigned NOT NULL AUTO_INCREMENT,
    `user_id` int unsigned NOT NULL COMMENT '用户',
    `site_id` int unsigned NOT NULL COMMENT '网站',
    `category_id` int unsigned DEFAULT NULL COMMENT '归入哪个分类',
    `sort_order` int NOT NULL DEFAULT 0 COMMENT '排序',
    `created_at` datetime DEFAULT NULL,
    PRIMARY KEY (`id`),
    KEY `idx_user_id` (`user_id`),
    KEY `idx_site_id` (`site_id`),
    UNIQUE KEY `uk_user_site` (`user_id`, `site_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='收藏表';

-- 插入默认管理员 (密码: admin123)
INSERT INTO `wn_users` (`username`, `email`, `password`, `role`, `status`, `created_at`, `updated_at`) VALUES
('admin', 'admin@webnav.local', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', 1, NOW(), NOW());

-- 插入默认公共分类
INSERT INTO `wn_categories` (`user_id`, `parent_id`, `name`, `sort_order`, `icon`, `created_at`, `updated_at`) VALUES
(NULL, NULL, '常用工具', 1, 'fa-wrench', NOW(), NOW()),
(NULL, NULL, '社交媒体', 2, 'fa-share-alt', NOW(), NOW()),
(NULL, NULL, '新闻资讯', 3, 'fa-newspaper', NOW(), NOW()),
(NULL, NULL, '开发技术', 4, 'fa-code', NOW(), NOW()),
(NULL, NULL, '学习教育', 5, 'fa-graduation-cap', NOW(), NOW()),
(NULL, NULL, '影音娱乐', 6, 'fa-film', NOW(), NOW()),
(NULL, NULL, '生活服务', 7, 'fa-shopping-cart', NOW(), NOW());

-- 反馈表
CREATE TABLE IF NOT EXISTS `wn_feedbacks` (
    `id` int unsigned NOT NULL AUTO_INCREMENT,
    `user_id` int unsigned DEFAULT NULL COMMENT '提交用户(NULL=匿名)',
    `name` varchar(50) DEFAULT NULL COMMENT '提交者称呼',
    `email` varchar(100) DEFAULT NULL COMMENT '联系邮箱',
    `content` text NOT NULL COMMENT '反馈内容',
    `reply` text DEFAULT NULL COMMENT '管理员回复',
    `replied_by` int unsigned DEFAULT NULL COMMENT '回复管理员',
    `replied_at` datetime DEFAULT NULL COMMENT '回复时间',
    `status` tinyint(1) NOT NULL DEFAULT 0 COMMENT '状态:0未回复,1已回复,2已关闭',
    `created_at` datetime DEFAULT NULL,
    `updated_at` datetime DEFAULT NULL,
    PRIMARY KEY (`id`),
    KEY `idx_user_id` (`user_id`),
    KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='反馈表';

-- 页面内容表
CREATE TABLE IF NOT EXISTS `wn_pages` (
    `id` int unsigned NOT NULL AUTO_INCREMENT,
    `slug` varchar(50) NOT NULL COMMENT '页面标识(about/privacy等)',
    `title` varchar(100) NOT NULL COMMENT '页面标题',
    `content` longtext NOT NULL COMMENT '页面内容',
    `updated_by` int unsigned DEFAULT NULL COMMENT '最后编辑者',
    `created_at` datetime DEFAULT NULL,
    `updated_at` datetime DEFAULT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='页面内容表';

-- 插入默认页面内容
INSERT INTO `wn_pages` (`slug`, `title`, `content`, `created_at`, `updated_at`) VALUES
('about', '关于我们', '<h3 class=\"text-lg font-semibold text-gray-800 mb-3\">关于 WebNav</h3><p class=\"text-gray-600 mb-4\">WebNav 是一个个人网址导航网站，旨在帮助你高效管理和访问常用网站。</p><h3 class=\"text-lg font-semibold text-gray-800 mb-3\">功能特点</h3><ul class=\"list-disc list-inside text-gray-600 space-y-2 mb-4\"><li>分类管理网站链接</li><li>个人收藏与公开书签</li><li>书签导入导出</li><li>智能搜索</li></ul><h3 class=\"text-lg font-semibold text-gray-800 mb-3\">联系方式</h3><p class=\"text-gray-600\">如有任何问题或建议，欢迎通过反馈页面联系我们。</p>', NOW(), NOW()),
('privacy', '隐私政策', '<h3 class=\"text-lg font-semibold text-gray-800 mb-3\">隐私政策</h3><p class=\"text-gray-600 mb-4\">WebNav 重视你的隐私。本隐私政策说明我们如何收集、使用和保护你的信息。</p><h3 class=\"text-lg font-semibold text-gray-800 mb-3\">信息收集</h3><p class=\"text-gray-600 mb-4\">我们仅收集必要的账户信息（用户名、邮箱）以及你主动添加的书签数据。</p><h3 class=\"text-lg font-semibold text-gray-800 mb-3\">信息使用</h3><p class=\"text-gray-600 mb-4\">收集的信息仅用于提供网站导航服务，不会与第三方共享。</p><h3 class=\"text-lg font-semibold text-gray-800 mb-3\">Cookie 使用</h3><p class=\"text-gray-600 mb-4\">我们使用 Session Cookie 维护登录状态，不跟踪你的浏览行为。</p><h3 class=\"text-lg font-semibold text-gray-800 mb-3\">数据安全</h3><p class=\"text-gray-600\">我们采取合理措施保护你的数据安全，密码使用 bcrypt 加密存储。</p>', NOW(), NOW());

-- 点击日志表
CREATE TABLE IF NOT EXISTS `wn_click_logs` (
    `id` int unsigned NOT NULL AUTO_INCREMENT,
    `site_id` int unsigned NOT NULL COMMENT '网站ID',
    `user_id` int unsigned DEFAULT NULL COMMENT '点击用户',
    `ip` varchar(45) DEFAULT NULL COMMENT 'IP地址',
    `referer` varchar(500) DEFAULT NULL COMMENT '来源页面',
    `created_at` datetime DEFAULT NULL,
    PRIMARY KEY (`id`),
    KEY `idx_site_id` (`site_id`),
    KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='点击日志表';

-- 登录尝试表
CREATE TABLE IF NOT EXISTS `wn_login_attempts` (
    `id` int unsigned NOT NULL AUTO_INCREMENT,
    `ip` varchar(45) NOT NULL COMMENT 'IP地址',
    `attempts` int unsigned NOT NULL DEFAULT 1 COMMENT '尝试次数',
    `first_attempt` datetime NOT NULL COMMENT '首次尝试时间',
    `locked_until` datetime DEFAULT NULL COMMENT '锁定至',
    `created_at` datetime DEFAULT NULL,
    `updated_at` datetime DEFAULT NULL,
    PRIMARY KEY (`id`),
    KEY `idx_ip` (`ip`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='登录尝试表';