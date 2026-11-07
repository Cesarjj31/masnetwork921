import { getStore } from '@netlify/blobs'
import type { Context } from '@netlify/functions'
import { authorized, sameOrigin } from '../lib/auth-utils'
export default async (req: Request, context: Context) => {
  try {
    const store = getStore('station-media')
    if (req.method === 'GET') {
      const key = context.params.key
      if (!key || !/^[a-f0-9-]+\.(png|jpg|webp|gif|mp4|webm)$/.test(key))
        return new Response('No encontrado', { status: 404 })
      const data = await store.get(key, { type: 'arrayBuffer' })
      if (!data) return new Response('No encontrado', { status: 404 })
      const ext = key.split('.').pop()!,
        types: Record<string, string> = {
          png: 'image/png',
          jpg: 'image/jpeg',
          webp: 'image/webp',
          gif: 'image/gif',
          mp4: 'video/mp4',
          webm: 'video/webm',
        }
      return new Response(data, {
        headers: {
          'Content-Type': types[ext],
          'Cache-Control': 'public, max-age=31536000, immutable',
          'X-Content-Type-Options': 'nosniff',
        },
      })
    }
    if (req.method !== 'POST')
      return new Response('Método no permitido', { status: 405 })
    if (!sameOrigin(req) || !(await authorized(req)))
      return new Response('Sesión expirada', { status: 401 })
    const file = (await req.formData()).get('file')
    const types: Record<string, string> = {
      'image/png': 'png',
      'image/jpeg': 'jpg',
      'image/webp': 'webp',
      'image/gif': 'gif',
      'video/mp4': 'mp4',
      'video/webm': 'webm',
    }
    if (!(file instanceof File) || !types[file.type] || file.size > 4_500_000)
      return Response.json(
        {
          error:
            'Selecciona una imagen o video MP4/WebM de hasta 4,5 MB. Para videos mayores, usa su URL HTTPS.',
        },
        { status: 400 },
      )
    const key = `${crypto.randomUUID()}.${types[file.type]}`
    await store.set(key, await file.arrayBuffer())
    return Response.json({ url: `/api/media/${key}` })
  } catch {
    return Response.json(
      { error: 'No se pudo cargar el archivo. Intenta nuevamente.' },
      { status: 503 },
    )
  }
}
export const config = { path: ['/api/media', '/api/media/:key'] }
