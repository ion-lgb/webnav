"use client"

import Link from "next/link"
import { signOut } from "next-auth/react"
import { Bookmark, Settings, LogOut } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface UserMenuProps {
  user: {
    id?: string
    username?: string | null
    role?: string
  } | null
}

export function UserMenu({ user }: UserMenuProps) {
  if (!user) {
    return (
      <div className="flex items-center gap-3">
        <Link
          href="/login"
          className="text-sm text-[var(--main-color)] hover:text-[var(--theme-color)]"
        >
          登录
        </Link>
        <Link
          href="/register"
          className="px-4 py-1.5 text-sm text-white bg-[var(--theme-color)] rounded-full hover:bg-[var(--hover-color)] transition-colors"
        >
          注册
        </Link>
      </div>
    )
  }

  const username = user.username || "U"
  const isAdmin = user.role === "admin"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 outline-none">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-gradient-to-br from-[var(--theme-color)] to-purple-500 text-white text-sm">
              {username.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem asChild>
          <Link href="/bookmarks" className="flex items-center cursor-pointer">
            <Bookmark className="mr-2 h-4 w-4" />
            我的书签
          </Link>
        </DropdownMenuItem>
        {isAdmin && (
          <DropdownMenuItem asChild>
            <Link href="/admin" className="flex items-center cursor-pointer">
              <Settings className="mr-2 h-4 w-4" />
              管理后台
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex items-center cursor-pointer text-red-600"
        >
          <LogOut className="mr-2 h-4 w-4" />
          退出
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
