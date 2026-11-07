import { eq } from 'drizzle-orm'
import { database } from '../../db/index'
import { appConfig } from '../../db/schema'
import { defaults } from '../../src/lib/station'
export default async () => {
  let station = defaults
  try {
    const [row] = await database()
      .select()
      .from(appConfig)
      .where(eq(appConfig.id, 'station'))
    if (row) station = { ...defaults, ...(row.value as object) }
  } catch {
    /* Installation remains available when configuration cannot be loaded. */
  }
  const customLogo = station.logo !== defaults.logo
  return Response.json(
    {
      id: '/',
      name: `${station.name} ${station.frequency}`,
      short_name: station.name.slice(0, 12),
      description: station.slogan,
      lang: 'es',
      start_url: '/',
      scope: '/',
      display: 'standalone',
      orientation: 'any',
      background_color: station.blue,
      theme_color: station.blue,
      icons: customLogo
        ? [{ src: station.logo, sizes: 'any', purpose: 'any' }]
        : [
            {
              src: '/img/icon-192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/img/icon-512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/img/icon-maskable.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
      categories: ['music', 'entertainment'],
      shortcuts: [
        { name: 'Programación', url: '/#programacion' },
        { name: 'Pedidos y saludos', url: '/#pedidos' },
      ],
    },
    {
      headers: {
        'Content-Type': 'application/manifest+json',
        'Cache-Control': 'no-cache',
      },
    },
  )
}
export const config = { path: '/manifest.webmanifest' }
