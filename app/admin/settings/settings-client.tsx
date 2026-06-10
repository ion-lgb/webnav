"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"

interface SettingsClientProps {
  initialData: Record<string, string>
}

export function SettingsClient({ initialData }: SettingsClientProps) {
  const [form, setForm] = useState({
    site_name: initialData.site_name ?? "",
    site_description: initialData.site_description ?? "",
    theme_color: initialData.theme_color ?? "#e8590c",
    banner_enabled: initialData.banner_enabled !== "0",
    left_sidebar_enabled: initialData.left_sidebar_enabled !== "0",
    footer_enabled: initialData.footer_enabled !== "0",
  })
  const [saving, setSaving] = useState(false)

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSave() {
    setSaving(true)
    try {
      const payload = {
        site_name: form.site_name,
        site_description: form.site_description,
        theme_color: form.theme_color,
        banner_enabled: form.banner_enabled ? "1" : "0",
        left_sidebar_enabled: form.left_sidebar_enabled ? "1" : "0",
        footer_enabled: form.footer_enabled ? "1" : "0",
      }
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (res.ok) {
        toast.success("设置已保存")
      } else {
        toast.error("保存失败")
      }
    } catch {
      toast.error("保存失败")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>基本设置</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <Label>站点名称</Label>
          <Input
            value={form.site_name}
            onChange={(e) => update("site_name", e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label>站点描述</Label>
          <Textarea
            value={form.site_description}
            onChange={(e) => update("site_description", e.target.value)}
            rows={3}
          />
        </div>
        <div className="space-y-1.5">
          <Label>主题色</Label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={form.theme_color}
              onChange={(e) => update("theme_color", e.target.value)}
              className="h-8 w-12 rounded cursor-pointer border"
            />
            <Input
              value={form.theme_color}
              onChange={(e) => update("theme_color", e.target.value)}
              className="w-32"
            />
          </div>
        </div>
        <div className="flex items-center justify-between">
          <Label>Banner 显示</Label>
          <Switch
            checked={form.banner_enabled}
            onCheckedChange={(v) => update("banner_enabled", v)}
          />
        </div>
        <div className="flex items-center justify-between">
          <Label>左侧栏显示</Label>
          <Switch
            checked={form.left_sidebar_enabled}
            onCheckedChange={(v) => update("left_sidebar_enabled", v)}
          />
        </div>
        <div className="flex items-center justify-between">
          <Label>页脚显示</Label>
          <Switch
            checked={form.footer_enabled}
            onCheckedChange={(v) => update("footer_enabled", v)}
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "保存中..." : "保存设置"}
        </Button>
      </CardFooter>
    </Card>
  )
}
