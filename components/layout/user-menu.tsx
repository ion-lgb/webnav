"use client"

import Link from "next/link"
import { signOut } from "next-auth/react"
import { Bookmark, Settings, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
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
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/login">登录</Link>
        </Button>
        <Button size="sm" asChild>
          <Link href="/register">注册</Link>
        </Button>
      </div>
    )
  }

  const username = user.username || "U"
  const isAdmin = user.role === "admin"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary text-primary-foreground text-sm">
              {username.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem asChild>
          <Link href="/bookmarks">
            <Bookmark className="mr-2 h-4 w-4" />
            我的书签
          </Link>
        </DropdownMenuItem>
        {isAdmin && (
          <DropdownMenuItem asChild>
            <Link href="/admin">
              <Settings className="mr-2 h-4 w-4" />
              管理后台
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => signOut({ callbackUrl: "/" })}
          className="text-destructive"
        >
          <LogOut className="mr-2 h-4 w-4" />
          退出
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
