import {
  mysqlTable,
  int,
  varchar,
  text,
  datetime,
  mysqlEnum,
  tinyint,
  uniqueIndex,
  index,
} from "drizzle-orm/mysql-core"
import { sql } from "drizzle-orm"

export const users = mysqlTable(
  "wn_users",
  {
    id: int("id", { unsigned: true }).primaryKey().autoincrement(),
    username: varchar("username", { length: 50 }).notNull(),
    email: varchar("email", { length: 100 }).notNull(),
    password: varchar("password", { length: 255 }).notNull(),
    role: mysqlEnum("role", ["admin", "user"]).notNull().default("user"),
    avatar: varchar("avatar", { length: 255 }),
    status: tinyint("status").notNull().default(1),
    createdAt: datetime("created_at").default(sql`NULL`),
    updatedAt: datetime("updated_at").default(sql`NULL`),
  },
  (table) => [
    uniqueIndex("uk_username").on(table.username),
    uniqueIndex("uk_email").on(table.email),
  ]
)

export const categories = mysqlTable(
  "wn_categories",
  {
    id: int("id", { unsigned: true }).primaryKey().autoincrement(),
    userId: int("user_id", { unsigned: true }),
    parentId: int("parent_id", { unsigned: true }),
    name: varchar("name", { length: 50 }).notNull(),
    sortOrder: int("sort_order").notNull().default(0),
    icon: varchar("icon", { length: 50 }),
    createdAt: datetime("created_at").default(sql`NULL`),
    updatedAt: datetime("updated_at").default(sql`NULL`),
  },
  (table) => [
    index("idx_user_id").on(table.userId),
    index("idx_parent_id").on(table.parentId),
  ]
)

export const sites = mysqlTable(
  "wn_sites",
  {
    id: int("id", { unsigned: true }).primaryKey().autoincrement(),
    userId: int("user_id", { unsigned: true }).notNull(),
    categoryId: int("category_id", { unsigned: true }).notNull(),
    title: varchar("title", { length: 100 }).notNull(),
    url: varchar("url", { length: 500 }).notNull(),
    description: varchar("description", { length: 255 }),
    iconUrl: varchar("icon_url", { length: 500 }),
    screenshot: varchar("screenshot", { length: 255 }),
    clickCount: int("click_count", { unsigned: true }).notNull().default(0),
    sortOrder: int("sort_order").notNull().default(0),
    isPublic: tinyint("is_public").notNull().default(1),
    createdAt: datetime("created_at").default(sql`NULL`),
    updatedAt: datetime("updated_at").default(sql`NULL`),
  },
  (table) => [
    index("idx_user_id").on(table.userId),
    index("idx_category_id").on(table.categoryId),
    index("idx_click_count").on(table.clickCount),
  ]
)

export const favorites = mysqlTable(
  "wn_favorites",
  {
    id: int("id", { unsigned: true }).primaryKey().autoincrement(),
    userId: int("user_id", { unsigned: true }).notNull(),
    siteId: int("site_id", { unsigned: true }).notNull(),
    categoryId: int("category_id", { unsigned: true }),
    sortOrder: int("sort_order").notNull().default(0),
    createdAt: datetime("created_at").default(sql`NULL`),
  },
  (table) => [
    index("idx_user_id").on(table.userId),
    index("idx_site_id").on(table.siteId),
    uniqueIndex("uk_user_site").on(table.userId, table.siteId),
  ]
)

export const feedbacks = mysqlTable(
  "wn_feedbacks",
  {
    id: int("id", { unsigned: true }).primaryKey().autoincrement(),
    userId: int("user_id", { unsigned: true }),
    name: varchar("name", { length: 50 }),
    email: varchar("email", { length: 100 }),
    content: text("content").notNull(),
    reply: text("reply"),
    repliedBy: int("replied_by", { unsigned: true }),
    repliedAt: datetime("replied_at"),
    status: tinyint("status").notNull().default(0),
    createdAt: datetime("created_at").default(sql`NULL`),
    updatedAt: datetime("updated_at").default(sql`NULL`),
  },
  (table) => [
    index("idx_user_id").on(table.userId),
    index("idx_status").on(table.status),
  ]
)

export const pages = mysqlTable(
  "wn_pages",
  {
    id: int("id", { unsigned: true }).primaryKey().autoincrement(),
    slug: varchar("slug", { length: 50 }).notNull(),
    title: varchar("title", { length: 100 }).notNull(),
    content: text("content").notNull(),
    updatedBy: int("updated_by", { unsigned: true }),
    createdAt: datetime("created_at").default(sql`NULL`),
    updatedAt: datetime("updated_at").default(sql`NULL`),
  },
  (table) => [uniqueIndex("uk_slug").on(table.slug)]
)

export const clickLogs = mysqlTable(
  "wn_click_logs",
  {
    id: int("id", { unsigned: true }).primaryKey().autoincrement(),
    siteId: int("site_id", { unsigned: true }).notNull(),
    userId: int("user_id", { unsigned: true }),
    ip: varchar("ip", { length: 45 }),
    referer: varchar("referer", { length: 500 }),
    createdAt: datetime("created_at").default(sql`NULL`),
  },
  (table) => [
    index("idx_site_id").on(table.siteId),
    index("idx_created_at").on(table.createdAt),
  ]
)

export const loginAttempts = mysqlTable(
  "wn_login_attempts",
  {
    id: int("id", { unsigned: true }).primaryKey().autoincrement(),
    ip: varchar("ip", { length: 45 }).notNull(),
    attempts: int("attempts", { unsigned: true }).notNull().default(1),
    firstAttempt: datetime("first_attempt").notNull(),
    lockedUntil: datetime("locked_until"),
    createdAt: datetime("created_at").default(sql`NULL`),
    updatedAt: datetime("updated_at").default(sql`NULL`),
  },
  (table) => [index("idx_ip").on(table.ip)]
)

export const settings = mysqlTable(
  "wn_settings",
  {
    id: int("id", { unsigned: true }).primaryKey().autoincrement(),
    key: varchar("key", { length: 100 }).notNull(),
    value: text("value"),
  },
  (table) => [uniqueIndex("uk_key").on(table.key)]
)
