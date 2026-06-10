"use client"

import Link from "next/link"
import { signOut } from "next-auth/react"
import { Settings, LogOut, LogIn } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
      <Button variant="ghost" size="sm" asChild>
        <Link href="/login"><LogIn className="mr-1 h-4 w-4" />登录</Link>
      </Button>
    )
  }

  const username = user.username || "U"

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
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem asChild>
          <Link href="/admin">
            <Settings className="mr-2 h-4 w-4" />
            管理后台
          </Link>
        </DropdownMenuItem>
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
