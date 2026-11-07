import { createHash } from 'node:crypto'
import { eq, gt, and } from 'drizzle-orm'
import { database } from '../../db/index'
import { sessions } from '../../db/schema'
export function digest(value: string) {
  return createHash('sha256').update(value).digest('hex')
}
export async function authorized(req: Request) {
  const cookie = req.headers
    .get('cookie')
    ?.split(';')
    .map((x) => x.trim())
    .find((x) => x.startsWith('radio_admin='))
    ?.slice(12)
  if (!cookie) return false
  const rows = await database()
    .select()
    .from(sessions)
    .where(
      and(eq(sessions.id, digest(cookie)), gt(sessions.expiresAt, new Date())),
    )
  return rows.length > 0
}
export function sameOrigin(req: Request) {
  return req.headers.get('origin') === new URL(req.url).origin
}
