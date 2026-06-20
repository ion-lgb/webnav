import { db } from "@/lib/db"
import { settings } from "@/lib/db/schema"
import { cache } from "react"

export interface SiteSettings {
  site_name: string
  site_description: string
  theme_color: string
  banner_enabled: boolean
  left_sidebar_enabled: boolean
  footer_enabled: boolean
}

const defaults: SiteSettings = {
  site_name: "WebNav",
  site_description: "一个简洁的网站导航与书签管理工具",
  theme_color: "#e8590c",
  banner_enabled: true,
  left_sidebar_enabled: true,
  footer_enabled: true,
}

export const getSiteSettings = cache(async (): Promise<SiteSettings> => {
  try {
    const rows = await db.select().from(settings)
    const data: Record<string, string> = {}
    for (const row of rows) {
      data[row.key] = row.value ?? ""
    }
    return {
      site_name: data.site_name || defaults.site_name,
      site_description: data.site_description || defaults.site_description,
      theme_color: data.theme_color || defaults.theme_color,
      banner_enabled: data.banner_enabled !== "0",
      left_sidebar_enabled: data.left_sidebar_enabled !== "0",
      footer_enabled: data.footer_enabled !== "0",
    }
  } catch {
    return defaults
  }
})
