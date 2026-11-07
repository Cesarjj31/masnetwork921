import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { database } from '../../db/index'
import { appConfig } from '../../db/schema'
import { defaults } from '../../src/lib/station'
import { authorized, sameOrigin } from '../lib/auth-utils'
const safeUrl = z
  .string()
  .max(2000)
  .refine(
    (s) =>
      s === '' ||
      s.startsWith('/api/media/') ||
      s.startsWith('/img/') ||
      (() => {
        try {
          const u = new URL(s)
          return u.protocol === 'https:' && !u.username && !u.password
        } catch {
          return false
        }
      })(),
    'Usa una dirección HTTPS válida',
  )
const show = z
  .object({
    id: z.string().max(100),
    name: z.string().min(1).max(160),
    host: z.string().max(250),
    start: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
    end: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
    day: z.enum(['lv', 'sab', 'dom']),
  })
  .refine((s) => s.end > s.start, 'La hora final debe ser posterior al inicio')
const schema = z.object({
  name: z.string().min(1).max(100),
  frequency: z.string().max(30),
  slogan: z.string().max(200),
  heroTitle: z.string().max(250),
  heroText: z.string().max(1000),
  copy: z.record(z.string().max(100), z.string().max(1500)),
  stream: safeUrl,
  logo: safeUrl,
  background: safeUrl,
  blue: z.string().regex(/^#[0-9a-f]{6}$/i),
  yellow: z.string().regex(/^#[0-9a-f]{6}$/i),
  font: z.enum(['Outfit', 'Barlow Condensed', 'Georgia', 'Verdana']),
  fontSize: z.number().min(12).max(24),
  radius: z.number().min(0).max(40),
  spacing: z.number().min(0.6).max(1.5),
  shows: z.array(show).max(100),
  slides: z
    .array(
      z.object({
        id: z.string(),
        title: z.string().max(200),
        subtitle: z.string().max(300),
        url: safeUrl,
        type: z.enum(['image', 'video']),
        link: safeUrl,
      }),
    )
    .max(30),
  socials: z
    .array(
      z.object({
        name: z.enum([
          'Instagram',
          'TikTok',
          'Facebook',
          'WhatsApp',
          'YouTube',
          'Telegram',
          'Snapchat',
          'Pinterest',
        ]),
        url: safeUrl,
        enabled: z.boolean(),
      }),
    )
    .max(8),
  sections: z
    .array(
      z.enum([
        'player',
        'carousel',
        'requests',
        'schedule',
        'info',
        'socials',
        'footer',
      ]),
    )
    .max(7),
  visible: z.record(z.string(), z.boolean()),
  flags: z.record(z.string(), z.boolean()),
  effects: z.record(z.string(), z.boolean()),
  cinema: z.record(z.string(), z.boolean()),
  sectionStyles: z.record(
    z.string(),
    z.object({
      font: z.string().max(50),
      size: z.number().min(0.6).max(2),
      weight: z.string().max(10),
      italic: z.boolean(),
      transform: z.enum(['none', 'uppercase', 'lowercase', 'capitalize']),
    }),
  ),
  director: z.string().max(120),
  city: z.string().max(150),
  email: z.email(),
  whatsapp: z.string().regex(/^\d{8,16}$/),
  shareUrl: safeUrl,
  ticker: z.string().max(2000),
  offlineMessage: z.string().max(500),
  welcome: z.string().max(500),
  nextMessage: z.string().max(500),
  promo: z.string().max(500),
  tickerSpeed: z.number().min(8).max(90),
  tickerHeight: z.number().min(24).max(48),
  tickerFont: z.number().min(9).max(16),
  tickerBorder: z.enum(['square', 'rounded', 'pill', 'none']),
  socialSize: z.number().min(16).max(32),
  scheduleView: z.enum([
    'classic',
    'timeline',
    'compact',
    'grid',
    'broadcast',
    'magazine',
    'neon',
    'minimal',
  ]),
  timeFormat: z.enum(['12h', 'short', '24h', 'dot', 'formal']),
  noteOpacity: z.number().min(0).max(1),
})
export default async (req: Request) => {
  try {
    const db = database()
    if (req.method === 'GET') {
      const [row] = await db
        .select()
        .from(appConfig)
        .where(eq(appConfig.id, 'station'))
      const version = row?.updatedAt.toISOString() || 'initial'
      if (req.headers.get('if-none-match') === `"${version}"`)
        return new Response(null, { status: 304 })
      return Response.json(row?.value || defaults, {
        headers: { 'Cache-Control': 'no-cache', ETag: `"${version}"` },
      })
    }
    if (req.method !== 'PUT')
      return new Response('Método no permitido', { status: 405 })
    if (!sameOrigin(req) || !(await authorized(req)))
      return new Response('Sesión expirada. Vuelve a introducir el PIN.', {
        status: 401,
      })
    const parsed = schema.safeParse(await req.json())
    if (!parsed.success)
      return Response.json(
        {
          error: parsed.error.issues
            .map((x) => `${x.path.join('.')}: ${x.message}`)
            .join('; '),
        },
        { status: 400 },
      )
    await db
      .insert(appConfig)
      .values({ id: 'station', value: parsed.data })
      .onConflictDoUpdate({
        target: appConfig.id,
        set: { value: parsed.data, updatedAt: new Date() },
      })
    return Response.json({ ok: true })
  } catch {
    return Response.json(
      {
        error:
          'No se pudieron guardar o cargar los datos. Reintenta cuando tengas conexión.',
      },
      { status: 503 },
    )
  }
}
export const config = { path: '/api/station' }
