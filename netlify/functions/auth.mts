import { randomBytes } from 'node:crypto'
import { eq, lt } from 'drizzle-orm'
import { database } from '../../db/index'
import { sessions, attempts } from '../../db/schema'
import { authorized, digest, sameOrigin } from '../lib/auth-utils'
import { checkPin } from '../lib/pin-check'
import type { Context } from '@netlify/functions'
export default async (req: Request, context: Context) => {
  try {
    const db = database()
    if (req.method === 'GET')
      return Response.json(
        { authenticated: await authorized(req) },
        { headers: { 'Cache-Control': 'no-store' } },
      )
    if (!sameOrigin(req))
      return new Response('Origen no permitido', { status: 403 })
    if (req.method === 'DELETE') {
      const cookie = req.headers
        .get('cookie')
        ?.split(';')
        .map((x) => x.trim())
        .find((x) => x.startsWith('radio_admin='))
        ?.slice(12)
      if (cookie)
        await db.delete(sessions).where(eq(sessions.id, digest(cookie)))
      return Response.json(
        { ok: true },
        {
          headers: {
            'Set-Cookie':
              'radio_admin=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0',
          },
        },
      )
    }
    if (req.method !== 'POST')
      return new Response('Método no permitido', { status: 405 })
    const key = digest(context.ip || 'unknown'),
      now = new Date()
    const [attempt] = await db
      .select()
      .from(attempts)
      .where(eq(attempts.id, key))
    if (attempt && attempt.resetAt > now && attempt.count >= 8)
      return Response.json(
        { error: 'Demasiados intentos. Intenta de nuevo en 15 minutos.' },
        { status: 429 },
      )
    const body = await req.json()
    if (typeof body.pin !== 'string' || body.pin.length > 20)
      return new Response('PIN inválido', { status: 400 })
    if (!checkPin(body.pin)) {
      const count = attempt && attempt.resetAt > now ? attempt.count + 1 : 1
      await db
        .insert(attempts)
        .values({ id: key, count, resetAt: new Date(Date.now() + 900000) })
        .onConflictDoUpdate({
          target: attempts.id,
          set: {
            count,
            resetAt:
              attempt && attempt.resetAt > now
                ? attempt.resetAt
                : new Date(Date.now() + 900000),
          },
        })
      return Response.json(
        { error: 'PIN incorrecto. Verifica e intenta otra vez.' },
        { status: 401 },
      )
    }
    await db.delete(attempts).where(eq(attempts.id, key))
    await db.delete(sessions).where(lt(sessions.expiresAt, now))
    const token = randomBytes(32).toString('hex')
    await db
      .insert(sessions)
      .values({ id: digest(token), expiresAt: new Date(Date.now() + 28800000) })
    return Response.json(
      { ok: true },
      {
        headers: {
          'Set-Cookie': `radio_admin=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=28800`,
          'Cache-Control': 'no-store',
        },
      },
    )
  } catch {
    return Response.json(
      {
        error: 'No se pudo conectar con la administración. Intenta nuevamente.',
      },
      { status: 503 },
    )
  }
}
export const config = { path: '/api/auth' }
