import { db } from "@/lib/db"
import { users } from "@/lib/db/schema"
import { desc } from "drizzle-orm"
import { UsersClient } from "./users-client"

export default async function UsersPage() {
  const data = await db
    .select({
      id: users.id,
      username: users.username,
      email: users.email,
      role: users.role,
      avatar: users.avatar,
      status: users.status,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    })
    .from(users)
    .orderBy(desc(users.createdAt))

  return (
    <div>
      <h1 className="text-xl font-semibold mb-5">用户管理</h1>
      <UsersClient initialData={data} />
    </div>
  )
}
