import { initialEffects } from './effects'
export type Show = {
  id: string
  name: string
  host: string
  start: string
  end: string
  day: string
}
export type Slide = {
  id: string
  title: string
  subtitle: string
  url: string
  type: string
  link: string
}
export type Station = typeof defaults
export const defaultShows: Show[] = [
  [
    'La Pachanga Navideña',
    'Richard Medina y Jonas Garcia',
    '09:00',
    '11:00',
    'lv',
  ],
  ['Conexión 0285', 'Klainer Guerrero', '11:00', '13:00', 'lv'],
  ['La Calle 89', 'Oswaldo Avila', '14:00', '16:00', 'lv'],
  ['Más Mix', 'Cesar Rodriguez y Norelis Saavedra', '16:00', '19:00', 'lv'],
  ['Mix Music', 'DJ Rey Daza', '19:00', '21:00', 'lv'],
  ['Fuera De Guión', 'Juhany Bolívar', '10:00', '12:00', 'sab'],
  ['Los Propios Y Sus Invitados', 'Adafel Urdaneta', '12:00', '14:00', 'sab'],
  [
    'Itroumania',
    'DJ Daniel Itrou, DJ Rudy Leal, DJ JJ y Maikol.Teka',
    '14:00',
    '17:00',
    'sab',
  ],
  ['Lo Más Retro Actual', 'DJ Luis Vera', '17:00', '19:00', 'sab'],
  ['Los Propios Y Sus Invitados', 'Adafel Urdaneta', '12:00', '14:00', 'dom'],
  ['Sound City', 'Arnoldo Martinez DJ 94K', '14:00', '18:00', 'dom'],
  ['La Rokola', 'Cochino Light y Norelis Saavedra', '18:00', '20:00', 'dom'],
].map(([name, host, start, end, day], i) => ({
  id: String(i + 1),
  name,
  host,
  start,
  end,
  day,
}))
export const defaults = {
  name: 'Más Network',
  frequency: '92.1 FM',
  slogan: '¡Medio Palo!',
  heroTitle: 'Tu radio.\nTu música.\nTu gente.',
  heroText:
    'La señal que conecta a Ciudad Bolívar con lo que te mueve. Música, entretenimiento y buena compañía, donde estés.',
  copy: {
    liveButton: 'Escuchar en vivo',
    scheduleButton: 'Ver programación',
    highlightsHeading: 'Más que una radio.',
    highlightsEyebrow: 'CONECTADOS CONTIGO',
    requestHeading: '¿Qué quieres escuchar hoy?',
    requestText: 'Pide tu canción, manda un saludo y sé parte de Más Network.',
    requestButton: 'Pedidos y saludos',
    scheduleHeading: 'Tu cita con Más.',
    scheduleText: 'Conoce los programas que le ponen ritmo a tu día.',
    installHeading: 'Tu radio.\nEn todas partes.',
    installText: 'Instala nuestra app y lleva el Medio Palo siempre contigo.',
    installButton: 'Descargar aplicación',
    infoHeading: 'El sonido de\nCiudad Bolívar.',
    infoText: 'Música, conexión y el auténtico Medio Palo.',
    socialsHeading: 'Somos Más. Síguenos.',
    socialHandle: '@masnetwork921',
    footerText: 'Desde Ciudad Bolívar, para el mundo.',
  } as Record<string, string>,
  stream: 'https://server6.globalhostla.com:9194/stream',
  logo: '/img/logo.png',
  background: '/img/banner.webp',
  director: 'Cesar Rodriguez',
  city: 'Ciudad Bolívar, Venezuela',
  email: 'masnetworkbolivar@gmail.com',
  whatsapp: '584161039426',
  shareUrl: '',
  ticker:
    'MÁS NETWORK 92.1 FM   •   LA RADIO DEL MEDIO PALO   •   DESDE CIUDAD BOLÍVAR PARA EL MUNDO',
  offlineMessage: 'Estamos fuera del aire. Volvemos pronto con más música.',
  welcome: '¡Bienvenido a la radio del Medio Palo!',
  nextMessage: 'A continuación: {name}',
  promo: '¡La radio que va contigo!',
  blue: '#072a69',
  yellow: '#ffdc18',
  font: 'Outfit',
  fontSize: 16,
  radius: 20,
  spacing: 1,
  tickerSpeed: 28,
  tickerHeight: 34,
  tickerFont: 11,
  tickerBorder: 'square',
  socialSize: 21,
  scheduleView: 'classic',
  timeFormat: '12h',
  noteOpacity: 0.12,
  sections: [
    'player',
    'carousel',
    'requests',
    'schedule',
    'info',
    'socials',
    'footer',
  ],
  visible: {
    player: true,
    carousel: true,
    requests: true,
    schedule: true,
    info: true,
    socials: true,
    footer: true,
    ticker: true,
  },
  flags: {
    offlineBanner: true,
    nextShowBanner: true,
    welcomeToast: false,
    offlineAlert: true,
    reconnectToast: true,
    showAlert: true,
    liveBadge: true,
    promoBanner: false,
    dailyGreeting: false,
    scheduleRemind: false,
    nowPlayingBanner: true,
    playerVolumeFade: false,
    fullscreenPlayer: true,
    energyMode: false,
    radioStatusDot: true,
    autoScrollSchedule: false,
    scheduleCountdown: true,
    favoriteShow: true,
    compactMode: false,
    shareButton: true,
    copyLinkToast: true,
    logoTapEasterEgg: false,
    socialPreview: true,
    requestBadge: true,
    infoExpandable: true,
    tickerPause: true,
    nightMode: false,
    bannerAutoHide: true,
    toastPosition: false,
    broadcastAlert: false,
  },
  effects: initialEffects,
  cinema: {
    logo: true,
    ticker: true,
    player: true,
    socials: true,
    notes: true,
  },
  sectionStyles: {} as Record<
    string,
    {
      font: string
      size: number
      weight: string
      italic: boolean
      transform: string
    }
  >,
  socials: [
    {
      name: 'Instagram',
      url: 'https://www.instagram.com/masnetwork921?rpxt=ZnR3ZHJsNWxjcjdi',
      enabled: true,
    },
    {
      name: 'TikTok',
      url: 'https://www.tiktok.com/@masnetwork921?_r=1&_t=ZS-9BD7K0ztfqp',
      enabled: true,
    },
    {
      name: 'Facebook',
      url: 'https://www.facebook.com/MasNetwork921FM/?locale=es_LA',
      enabled: true,
    },
    { name: 'WhatsApp', url: 'https://wa.me/584161039426', enabled: true },
    { name: 'YouTube', url: '', enabled: false },
    { name: 'Telegram', url: '', enabled: false },
    { name: 'Snapchat', url: '', enabled: false },
    { name: 'Pinterest', url: '', enabled: false },
  ],
  slides: [
    {
      id: '1',
      title: 'La radio del Medio Palo',
      subtitle: 'De Ciudad Bolívar para el mundo',
      url: '/img/banner.webp',
      type: 'image',
      link: '',
    },
    {
      id: '2',
      title: 'Siempre contigo',
      subtitle: 'La mejor compañía en el 92.1 FM',
      url: '/img/venezuela.jpg',
      type: 'image',
      link: '',
    },
    {
      id: '3',
      title: 'Somos Más Network',
      subtitle: 'La música que nos conecta',
      url: '/img/poster.png',
      type: 'image',
      link: '',
    },
  ] as Slide[],
  shows: defaultShows,
}
export function caracasNow() {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Caracas',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date())
  const get = (type: string) => parts.find((p) => p.type === type)?.value || ''
  const weekday = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(
    get('weekday'),
  )
  return {
    weekday,
    day: weekday === 0 ? 'dom' : weekday === 6 ? 'sab' : 'lv',
    minutes: Number(get('hour')) * 60 + Number(get('minute')),
  }
}
export function minutes(t: string) {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}
export function timeLabel(t: string, format = '12h') {
  if (format === '24h') return t
  if (format === 'dot') return t.replace(':', '.')
  const [h, m] = t.split(':').map(Number),
    period = h >= 12 ? 'PM' : 'AM',
    base = `${h % 12 || 12}:${String(m).padStart(2, '0')}`
  return format === 'short'
    ? `${base}${period.toLowerCase()}`
    : format === 'formal'
      ? `${base} ${h >= 12 ? 'p.m.' : 'a.m.'}`
      : `${base} ${period}`
}
export const dayNames: Record<string, string> = {
  lv: 'Lunes a viernes',
  sab: 'Sábado',
  dom: 'Domingo',
}

export function nextOccurrence(
  shows: Show[],
  now: ReturnType<typeof caracasNow>,
) {
  for (let offset = 0; offset < 8; offset++) {
    const weekday = (now.weekday + offset) % 7,
      day = weekday === 0 ? 'dom' : weekday === 6 ? 'sab' : 'lv'
    const next = shows
      .filter(
        (s) => s.day === day && (offset > 0 || minutes(s.start) > now.minutes),
      )
      .sort((a, b) => minutes(a.start) - minutes(b.start))[0]
    if (next)
      return {
        ...next,
        until: offset * 1440 + minutes(next.start) - now.minutes,
        dayOffset: offset,
      }
  }
  return undefined
}
export function imageUrl(url: string, width = 1000) {
  return url.startsWith('/img/')
    ? `/.netlify/images?url=${encodeURIComponent(url)}&w=${width}&fm=webp&q=85`
    : url
}
