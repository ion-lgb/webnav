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