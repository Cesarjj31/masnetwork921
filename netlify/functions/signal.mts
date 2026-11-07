import { eq } from 'drizzle-orm'
import { database } from '../../db/index'
import { appConfig } from '../../db/schema'
import { defaults } from '../../src/lib/station'
import { lookup } from 'node:dns/promises'
function isPrivate(ip: string) {
  return (
    /^(127\.|10\.|192\.168\.|169\.254\.|0\.|172\.(1[6-9]|2\d|3[01])\.)/.test(
      ip,
    ) ||
    ip === '::1' ||
    /^(fc|fd|fe80)/i.test(ip) ||
    ip.startsWith('::ffff:')
  )
}
export default async () => {
  try {
    const [row] = await database()
      .select()
      .from(appConfig)
      .where(eq(appConfig.id, 'station'))
    const stream =
      (row?.value as { stream?: string } | undefined)?.stream || defaults.stream
    const url = new URL(stream)
    if (url.protocol !== 'https:' || url.username || url.password)
      return Response.json(
        { online: false },
        { headers: { 'Cache-Control': 'no-store' } },
      )
    const addresses = await lookup(url.hostname, { all: true })
    if (!addresses.length || addresses.some((a) => isPrivate(a.address)))
      return Response.json(
        { online: false },
        { headers: { 'Cache-Control': 'no-store' } },
      )
    const response = await fetch(url, {
      headers: { Range: 'bytes=0-0' },
      signal: AbortSignal.timeout(8000),
      redirect: 'error',
    })
    const online =
      [200, 206, 416].includes(response.status) &&
      !response.headers.get('content-type')?.includes('text/html')
    await response.body?.cancel()
    return Response.json(
      { online },
      { headers: { 'Cache-Control': 'no-store' } },
    )
  } catch {
    return Response.json(
      { online: null },
      { headers: { 'Cache-Control': 'no-store' } },
    )
  }
}
export const config = { path: '/api/signal' }
