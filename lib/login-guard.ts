import { eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { loginAttempts } from "@/lib/db/schema"

const MAX_ATTEMPTS = 5
const WINDOW_MINUTES = 5
const LOCK_MINUTES = 15

export async function checkLoginAttempt(ip: string) {
  const record = await db
    .select()
    .from(loginAttempts)
    .where(eq(loginAttempts.ip, ip))
    .limit(1)
    .then((rows) => rows[0])

  if (!record) {
    return { locked: false, remainingAttempts: MAX_ATTEMPTS }
  }

  if (record.lockedUntil && record.lockedUntil > new Date()) {
    const remainingMs = record.lockedUntil.getTime() - Date.now()
    return {
      locked: true,
      remainingSeconds: Math.ceil(remainingMs / 1000),
      remainingAttempts: 0,
    }
  }

  const windowStart = new Date(Date.now() - WINDOW_MINUTES * 60 * 1000)
  if (record.firstAttempt < windowStart) {
    await clearAttempts(ip)
    return { locked: false, remainingAttempts: MAX_ATTEMPTS }
  }

  const remaining = MAX_ATTEMPTS - record.attempts
  if (remaining <= 0) {
    const lockedUntil = new Date(Date.now() + LOCK_MINUTES * 60 * 1000)
    await db
      .update(loginAttempts)
      .set({ lockedUntil, updatedAt: new Date() })
      .where(eq(loginAttempts.ip, ip))
    return { locked: true, remainingSeconds: LOCK_MINUTES * 60, remainingAttempts: 0 }
  }

  return { locked: false, remainingAttempts: remaining }
}

export async function recordFailedAttempt(ip: string) {
  const record = await db
    .select()
    .from(loginAttempts)
    .where(eq(loginAttempts.ip, ip))
    .limit(1)
    .then((rows) => rows[0])

  const now = new Date()

  if (!record) {
    await db.insert(loginAttempts).values({
      ip,
      attempts: 1,
      firstAttempt: now,
      createdAt: now,
    })
    return
  }

  const windowStart = new Date(Date.now() - WINDOW_MINUTES * 60 * 1000)
  if (record.firstAttempt < windowStart) {
    await db
      .update(loginAttempts)
      .set({ attempts: 1, firstAttempt: now, updatedAt: now })
      .where(eq(loginAttempts.ip, ip))
    return
  }

  const newAttempts = record.attempts + 1
  const update: { attempts: number; updatedAt: Date; lockedUntil?: Date } = { attempts: newAttempts, updatedAt: now }

  if (newAttempts >= MAX_ATTEMPTS) {
    update.lockedUntil = new Date(Date.now() + LOCK_MINUTES * 60 * 1000)
  }

  await db
    .update(loginAttempts)
    .set(update)
    .where(eq(loginAttempts.ip, ip))
}

export async function clearAttempts(ip: string) {
  await db.delete(loginAttempts).where(eq(loginAttempts.ip, ip))
}
