import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const sessionToken = request.cookies.get("authjs.session-token")?.value

  if (pathname.startsWith("/bookmarks") || pathname.startsWith("/admin")) {
    if (!sessionToken) {
      const loginUrl = new URL("/login", request.url)
      loginUrl.searchParams.set("callbackUrl", pathname)
      return NextResponse.redirect(loginUrl)
    }
    // Session exists, allow access. Admin role check happens in the layout.
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/bookmarks/:path*", "/admin/:path*"],
}
