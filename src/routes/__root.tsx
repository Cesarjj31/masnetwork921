import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'

import { TooltipProvider } from '@/components/ui/tooltip'
import { NotFoundPage } from '@/components/error-pages'

import '../styles.css'

const siteName = 'Más Network 92.1 FM | ¡Medio Palo!'
const siteDescription =
  'Escucha Más Network 92.1 FM en vivo desde Ciudad Bolívar. Tu música, tus programas y tu gente. ¡Medio Palo!'

export const Route = createRootRoute({
  head: () => ({
    links: [
      { rel: 'manifest', href: '/manifest.webmanifest' },
      { rel: 'icon', href: '/img/icon-192.png' },
      { rel: 'apple-touch-icon', href: '/img/icon-192.png' },
    ],
    meta: [
      { name: 'theme-color', content: '#071d49' },
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: siteName,
      },
      {
        name: 'description',
        content: siteDescription,
      },
      {
        property: 'og:title',
        content: siteName,
      },
      {
        property: 'og:description',
        content: siteDescription,
      },
      {
        property: 'og:type',
        content: 'website',
      },
      {
        name: 'twitter:card',
        content: 'summary_large_image',
      },
    ],
  }),
  shellComponent: RootDocument,
  notFoundComponent: NotFoundPage,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <HeadContent />
      </head>
      <body>
        <TooltipProvider>{children}</TooltipProvider>
        <Scripts />
      </body>
    </html>
  )
}
