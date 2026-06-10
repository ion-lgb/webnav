import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const url = searchParams.get("url") || ""

  if (!url || (!url.startsWith("http://") && !url.startsWith("https://"))) {
    return NextResponse.json(
      { error: "无效的URL" },
      { status: 400 }
    )
  }

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 5000)

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    })

    clearTimeout(timeout)

    if (!res.ok) {
      return NextResponse.json(
        { error: "无法访问该网站" },
        { status: 400 }
      )
    }

    const html = await res.text()

    const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i)
    const title = titleMatch ? titleMatch[1].trim() : ""

    const descMatch = html.match(
      /<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["'][^>]*>/i
    ) || html.match(
      /<meta[^>]*content=["']([^"']*)["'][^>]*name=["']description["'][^>]*>/i
    )
    const description = descMatch ? descMatch[1].trim() : ""

    const iconMatch = html.match(
      /<link[^>]*rel=["'](?:shortcut )?icon["'][^>]*href=["']([^"']*)["'][^>]*>/i
    ) || html.match(
      /<link[^>]*href=["']([^"']*)["'][^>]*rel=["'](?:shortcut )?icon["'][^>]*>/i
    )
    let iconUrl = iconMatch ? iconMatch[1].trim() : ""

    if (!iconUrl) {
      try {
        const parsed = new URL(url)
        iconUrl = `https://www.google.com/s2/favicons?domain=${parsed.hostname}&sz=64`
      } catch {
        // ignore
      }
    } else if (iconUrl.startsWith("/")) {
      try {
        const parsed = new URL(url)
        iconUrl = `${parsed.origin}${iconUrl}`
      } catch {
        // ignore
      }
    }

    return NextResponse.json({
      data: { title, description, iconUrl },
    })
  } catch {
    return NextResponse.json(
      { error: "无法访问该网站" },
      { status: 400 }
    )
  }
}
