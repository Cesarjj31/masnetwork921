import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'
import type { CSSProperties, FormEvent } from 'react'
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  ArrowUpRight,
  Download,
  Headphones,
  Radio,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Clock3,
  MapPin,
  Mail,
  Heart,
  Share2,
  Maximize2,
  X,
  Menu,
  LockKeyhole,
  Music2,
  RefreshCw,
  Signal,
  MessageCircle,
  Smartphone,
  Monitor,
  Check,
  LoaderCircle,
} from 'lucide-react'
import { toast } from 'sonner'
import { Toaster } from '@/components/ui/sonner'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { AdminPanel } from '@/components/admin-panel'
import { SocialIcon } from '@/components/social-icon'
import {
  defaults,
  caracasNow,
  minutes,
  timeLabel,
  dayNames,
  nextOccurrence,
  imageUrl,
} from '@/lib/station'
import type { Station } from '@/lib/station'
export const Route = createFileRoute('/')({ component: Home })
type InstallEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: string }>
}
function Home() {
  const [station, setStation] = useState<Station>(defaults),
    [loading, setLoading] = useState(true),
    [online, setOnline] = useState(true),
    [dataError, setDataError] = useState(false),
    [playing, setPlaying] = useState(false),
    [connecting, setConnecting] = useState(false),
    [signalError, setSignalError] = useState(false),
    [volume, setVolume] = useState(0.8),
    [day, setDay] = useState('lv'),
    [now, setNow] = useState<ReturnType<typeof caracasNow> | null>(null),
    [slide, setSlide] = useState(0),
    [videoPlaying, setVideoPlaying] = useState(false),
    [menu, setMenu] = useState(false),
    [installOpen, setInstallOpen] = useState(false),
    [installEvent, setInstallEvent] = useState<InstallEvent | null>(null),
    [installed, setInstalled] = useState(false),
    [login, setLogin] = useState(false),
    [admin, setAdmin] = useState(false),
    [pin, setPin] = useState(''),
    [loginError, setLoginError] = useState(''),
    [loginBusy, setLoginBusy] = useState(false),
    [cinema, setCinema] = useState(false),
    [favorites, setFavorites] = useState<string[]>([]),
    [tickerPaused, setTickerPaused] = useState(false),
    [greeting, setGreeting] = useState(''),
    [burst, setBurst] = useState(false)
  const audio = useRef<HTMLAudioElement>(null),
    etag = useRef(''),
    longPress = useRef<ReturnType<typeof setTimeout> | null>(null),
    lastProgram = useRef(''),
    settingsRef = useRef(station),
    adminRef = useRef(false),
    loadRef = useRef(false)
  settingsRef.current = station
  adminRef.current = admin
  async function load() {
    if (loadRef.current || adminRef.current) return
    loadRef.current = true
    try {
      const r = await fetch('/api/station', {
        signal: AbortSignal.timeout(10000),
        headers: etag.current ? { 'If-None-Match': etag.current } : {},
        cache: 'no-cache',
      })
      if (r.status !== 304) {
        if (!r.ok) throw Error()
        const data = await r.json()
        setStation({
          ...defaults,
          ...data,
          copy: { ...defaults.copy, ...data.copy },
          flags: { ...defaults.flags, ...data.flags },
          effects: { ...defaults.effects, ...data.effects },
        })
        etag.current = r.headers.get('etag') || ''
      }
      setDataError(false)
    } catch {
      setDataError(true)
    } finally {
      setLoading(false)
      loadRef.current = false
    }
  }
  useEffect(() => {
    load()
    const n = caracasNow()
    setNow(n)
    setDay(n.day)
    setOnline(navigator.onLine)
    setInstalled(window.matchMedia('(display-mode: standalone)').matches)
    if ('serviceWorker' in navigator)
      navigator.serviceWorker.register('/sw.js').catch(() => {})
    const update = () => {
      if (document.visibilityState === 'visible') {
        load()
        setNow(caracasNow())
      }
    }
    const interval = setInterval(update, 15000)
    const offline = () => {
      setOnline(false)
      if (
        settingsRef.current.flags.offlineAlert ||
        settingsRef.current.effects.connectionNotice
      )
        toast.error('Sin conexión a internet')
    }
    const online = () => {
      setOnline(true)
      load()
      if (
        settingsRef.current.flags.reconnectToast ||
        settingsRef.current.effects.connectionNotice
      )
        toast.success('Conexión restablecida')
    }
    const installer = (e: Event) => {
      e.preventDefault()
      setInstallEvent(e as InstallEvent)
    }
    const installedHandler = () => {
      setInstalled(true)
      setInstallEvent(null)
      toast.success('Aplicación instalada')
    }
    window.addEventListener('offline', offline)
    window.addEventListener('online', online)
    window.addEventListener('beforeinstallprompt', installer)
    window.addEventListener('appinstalled', installedHandler)
    document.addEventListener('visibilitychange', update)
    return () => {
      clearInterval(interval)
      window.removeEventListener('offline', offline)
      window.removeEventListener('online', online)
      window.removeEventListener('beforeinstallprompt', installer)
      window.removeEventListener('appinstalled', installedHandler)
      document.removeEventListener('visibilitychange', update)
    }
  }, [])
  useEffect(() => {
    if (!loading) {
      if (station.flags.welcomeToast) toast.info(station.welcome)
      if (station.flags.dailyGreeting) {
        const h = new Date().toLocaleString('en-US', {
          timeZone: 'America/Caracas',
          hour: 'numeric',
          hour12: false,
        })
        setGreeting(
          Number(h) < 12
            ? '¡Buenos días, Ciudad Bolívar!'
            : Number(h) < 18
              ? '¡Buenas tardes, Ciudad Bolívar!'
              : '¡Buenas noches, Ciudad Bolívar!',
        )
      }
      if (station.flags.broadcastAlert) toast.info(station.promo)
    }
  }, [loading])
  useEffect(() => {
    if (audio.current) audio.current.volume = volume
  }, [volume])
  useEffect(() => {
    setPlaying(false)
    setConnecting(false)
    setSignalError(false)
    audio.current?.load()
  }, [station.stream])
  useEffect(() => {
    if (loading || station.flags.energyMode || videoPlaying) return
    const timer = setInterval(() => {
      if (document.visibilityState === 'visible' && !admin)
        setSlide((i) => (i + 1) % Math.max(1, station.slides.length))
    }, 8000)
    return () => clearInterval(timer)
  }, [
    loading,
    station.slides.length,
    admin,
    station.flags.energyMode,
    videoPlaying,
  ])
  useEffect(() => {
    setVideoPlaying(false)
  }, [slide])
  useEffect(() => {
    document.documentElement.style.setProperty('--blue', station.blue)
    document.documentElement.style.setProperty('--yellow', station.yellow)
  }, [station.blue, station.yellow])
  useEffect(() => {
    let checking = false,
      cancelled = false
    async function probe() {
      if (
        checking ||
        document.visibilityState !== 'visible' ||
        !navigator.onLine ||
        adminRef.current
      )
        return
      checking = true
      try {
        const response = await fetch('/api/signal', {
          signal: AbortSignal.timeout(11000),
          cache: 'no-store',
        })
        const data = await response.json()
        if (!cancelled && data.online === false) setSignalError(true)
        if (!cancelled && data.online === true) setSignalError(false)
      } catch {
        /* Audio events remain the authority when the probe is inconclusive. */
      } finally {
        checking = false
      }
    }
    probe()
    const interval = setInterval(probe, 45000)
    document.addEventListener('visibilitychange', probe)
    return () => {
      cancelled = true
      clearInterval(interval)
      document.removeEventListener('visibilitychange', probe)
    }
  }, [station.stream])
  useEffect(() => {
    if (!connecting) return
    const timeout = setTimeout(() => {
      audio.current?.pause()
      setConnecting(false)
      setSignalError(true)
    }, 15000)
    return () => clearTimeout(timeout)
  }, [connecting])
  useEffect(() => {
    if ('mediaSession' in navigator)
      navigator.mediaSession.playbackState = playing ? 'playing' : 'paused'
  }, [playing])
  useEffect(() => {
    if (!signalError) return
    const retry = setInterval(() => {
      if (navigator.onLine && document.visibilityState === 'visible')
        audio.current?.load()
    }, 45000)
    return () => clearInterval(retry)
  }, [signalError])
  const current = now
    ? station.shows.find(
        (s) =>
          s.day === now.day &&
          minutes(s.start) <= now.minutes &&
          minutes(s.end) > now.minutes,
      )
    : undefined
  const next = now ? nextOccurrence(station.shows, now) : undefined
  useEffect(() => {
    if (!current) return
    if (
      lastProgram.current &&
      lastProgram.current !== current.id &&
      station.flags.showAlert
    )
      toast.info(`Ahora: ${current.name}`)
    lastProgram.current = current.id
    if (station.flags.autoScrollSchedule)
      document
        .getElementById(`show-${current.id}`)
        ?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [current?.id, station.flags.showAlert, station.flags.autoScrollSchedule])
  useEffect(() => {
    if (
      !next ||
      !now ||
      !station.flags.scheduleRemind ||
      !favorites.includes(next.id)
    )
      return
    const left = next.until
    if (left === 5) toast.info(`${next.name} comienza en 5 minutos`)
  }, [next?.id, now?.minutes, favorites, station.flags.scheduleRemind])
  useEffect(() => {
    if (!('mediaSession' in navigator)) return
    navigator.mediaSession.metadata = new MediaMetadata({
      title: current?.name || `${station.name} ${station.frequency}`,
      artist: current?.host || station.slogan,
      artwork: [
        {
          src: new URL('/img/icon-512.png', location.origin).href,
          sizes: '512x512',
          type: 'image/png',
        },
      ],
    })
    navigator.mediaSession.setActionHandler('play', () => {
      audio.current?.play().catch(() => setSignalError(true))
    })
    navigator.mediaSession.setActionHandler('pause', () =>
      audio.current?.pause(),
    )
    return () => {
      navigator.mediaSession.setActionHandler('play', null)
      navigator.mediaSession.setActionHandler('pause', null)
    }
  }, [current?.name, station.name, station.frequency, station.slogan])
  async function togglePlay() {
    const a = audio.current
    if (!a) return
    if (playing) {
      a.pause()
      if (station.effects.stopNotice) toast.info('Reproducción pausada')
      return
    }
    setConnecting(true)
    setSignalError(false)
    if (station.flags.playerVolumeFade) {
      a.volume = 0
      let v = 0
      const fade = setInterval(() => {
        v += 0.05
        a.volume = Math.min(v, volume)
        if (v >= volume) clearInterval(fade)
      }, 80)
    }
    try {
      await a.play()
      if (station.effects.startNotice)
        toast.success('Estás escuchando Más Network')
      if (station.effects.trackNotice && current)
        toast.info(`${current.name} · ${current.host}`)
      if (station.effects.confetti) {
        setBurst(true)
        setTimeout(() => setBurst(false), 1800)
      }
    } catch {
      setSignalError(true)
      setConnecting(false)
    }
  }
  async function openAdmin() {
    setMenu(false)
    try {
      const r = await fetch('/api/auth')
      const data = await r.json()
      if (data.authenticated) {
        setAdmin(true)
        return
      }
    } catch {}
    setLoginError('')
    setPin('')
    setLogin(true)
  }
  async function authenticate(e: FormEvent) {
    e.preventDefault()
    setLoginBusy(true)
    setLoginError('')
    try {
      const r = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      })
      const data = await r.json()
      if (!r.ok) throw Error(data.error)
      setPin('')
      setLogin(false)
      setAdmin(true)
    } catch (e) {
      setLoginError((e as Error).message)
    } finally {
      setLoginBusy(false)
    }
  }
  function startHold() {
    longPress.current = setTimeout(openAdmin, 3000)
  }
  function endHold() {
    if (longPress.current) clearTimeout(longPress.current)
  }
  async function share() {
    const url = station.shareUrl || location.origin
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${station.name} ${station.frequency}`,
          text: station.slogan,
          url,
        })
        if (station.effects.shareNotice) toast.success('Radio compartida')
      } else {
        await navigator.clipboard.writeText(url)
        if (station.flags.copyLinkToast) toast.success('Enlace copiado')
      }
    } catch (e) {
      if ((e as Error).name !== 'AbortError')
        toast.error('No se pudo compartir. Copia la dirección del navegador.')
    }
  }
  async function install() {
    if (station.effects.installNotice)
      toast.info('Instala Más Network desde el menú de tu navegador')
    if (installEvent) {
      await installEvent.prompt()
      const result = await installEvent.userChoice
      if (result.outcome === 'accepted') setInstallOpen(false)
      setInstallEvent(null)
    } else setInstallOpen(true)
  }
  function socialBar() {
    return (
      <div className="social-links">
        {station.socials
          .filter((s) => s.enabled && s.url)
          .map((s) => (
            <a
              key={s.name}
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={s.name}
              title={
                station.flags.socialPreview ? `${s.name}: ${s.url}` : s.name
              }
            >
              <SocialIcon name={s.name} size={station.socialSize} />
            </a>
          ))}
      </div>
    )
  }
  function playButton(small = false) {
    return (
      <button
        className={`play-button ${small ? 'small-play' : ''} ${connecting ? 'connecting' : ''}`}
        onClick={togglePlay}
        aria-label={playing ? 'Pausar radio' : 'Escuchar radio en vivo'}
        disabled={connecting}
      >
        {connecting ? (
          <LoaderCircle className="spin" size={small ? 23 : 32} />
        ) : playing ? (
          <Pause size={small ? 23 : 32} fill="currentColor" />
        ) : (
          <Play size={small ? 23 : 32} fill="currentColor" />
        )}
      </button>
    )
  }
  const wa = `https://wa.me/${station.whatsapp}?text=${encodeURIComponent('¡Hola, Más Network! Quiero enviar un saludo y pedir una canción: ')}`
  const shown = station.slides[slide % Math.max(1, station.slides.length)]
  const sectionStyle = (key: string) => {
    const s = station.sectionStyles[key]
    return s
      ? {
          fontFamily: s.font,
          fontSize: `${s.size}em`,
          fontWeight: s.weight,
          fontStyle: s.italic ? 'italic' : 'normal',
          textTransform: s.transform as CSSProperties['textTransform'],
        }
      : undefined
  }
  const blocks: Record<string, React.ReactNode> = {
    player: (
      <section className="hero" id="inicio">
        <div
          className="hero-grain"
          style={{
            backgroundImage: `linear-gradient(90deg, var(--blue), transparent), url("${imageUrl(station.background, 1200)}")`,
          }}
        />
        <div className="hero-content">
          <div className="eyebrow">
            <span className="live-dot" /> DESDE CIUDAD BOLÍVAR, VENEZUELA
          </div>
          <h1>
            {station.heroTitle.split('\n').map((line, i) => (
              <span className={i === 1 ? 'yellow' : ''} key={i}>
                {line}
              </span>
            ))}
          </h1>
          <p>{station.heroText}</p>
          <div className="hero-actions">
            <button
              className="button primary"
              onClick={togglePlay}
              disabled={connecting}
            >
              {connecting ? (
                <LoaderCircle className="spin" size={19} />
              ) : playing ? (
                <Pause size={19} fill="currentColor" />
              ) : (
                <Play size={19} fill="currentColor" />
              )}
              {connecting
                ? 'Conectando…'
                : playing
                  ? 'Pausar señal'
                  : station.copy.liveButton}
              <span className="button-divider" />
              <Headphones size={18} />
            </button>
            <button
              className="hero-program-link"
              onClick={() =>
                document
                  .getElementById('programacion')
                  ?.scrollIntoView({ behavior: 'smooth' })
              }
            >
              {station.copy.scheduleButton} <ArrowUpRight size={18} />
            </button>
          </div>
          <div className="hero-foot">
            <span className="tiny-equalizer">
              <i />
              <i />
              <i />
              <i />
            </span>{' '}
            {station.slogan} <span className="hero-foot-line" /> LA SEÑAL QUE
            NOS UNE
          </div>
        </div>
        <div className="hero-art">
          <div className="visual-atmosphere" aria-hidden="true">
            <i />
            <i />
            <i />
            <i />
            <i />
            <i />
          </div>
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
          <div className="hero-frequency">92.1</div>
          <div className="vertical-text">MÁS MÚSICA. MÁS CONTIGO.</div>
          <img
            className={`hero-logo ${station.effects.logoPulse ? 'logo-pulse' : ''} ${station.effects.rotatingLogo ? 'rotating-logo' : ''}`}
            src={imageUrl(station.logo, 650)}
            alt={`${station.name} ${station.frequency}`}
            onPointerDown={startHold}
            onPointerUp={endHold}
            onPointerLeave={endHold}
          />
          <div className="frequency-label">
            <span>CIUDAD BOLÍVAR</span>
            <strong>{station.frequency}</strong>
            <span>¡LA RADIO DEL MEDIO PALO!</span>
          </div>
          <span className="art-star">✳</span>
          <div className="on-air-label">
            <span className="live-dot" /> TU COMPAÑÍA, EN VIVO
          </div>
        </div>
        <div className="hero-bottom-line" />
      </section>
    ),
    carousel: (
      <section className="content-section highlights" id="novedades">
        <div className="section-top">
          <div>
            <div className="eyebrow blue-label">
              {station.copy.highlightsEyebrow}
            </div>
            <h2>{station.copy.highlightsHeading}</h2>
          </div>
          <div className="carousel-controls">
            <span>
              {String(
                (slide % Math.max(1, station.slides.length)) + 1,
              ).padStart(2, '0')}{' '}
              <em>/ {String(station.slides.length).padStart(2, '0')}</em>
            </span>
            <button
              className="circle-button"
              aria-label="Diapositiva anterior"
              onClick={() =>
                setSlide(
                  (i) =>
                    (i - 1 + station.slides.length) %
                    Math.max(1, station.slides.length),
                )
              }
            >
              <ChevronLeft size={19} />
            </button>
            <button
              className="circle-button"
              aria-label="Siguiente diapositiva"
              onClick={() =>
                setSlide((i) => (i + 1) % Math.max(1, station.slides.length))
              }
            >
              <ChevronRight size={19} />
            </button>
          </div>
        </div>
        <div className="highlights-grid">
          {shown ? (
            <div className="feature-slide" key={shown.id}>
              {shown.type === 'video' ? (
                <video
                  src={
                    shown.type === 'video'
                      ? shown.url
                      : imageUrl(shown.url, 1000)
                  }
                  controls
                  playsInline
                  preload="metadata"
                  onPlay={() => {
                    audio.current?.pause()
                    setVideoPlaying(true)
                  }}
                  onPause={() => setVideoPlaying(false)}
                  onEnded={() => setVideoPlaying(false)}
                />
              ) : (
                <img
                  src={
                    shown.type === 'video'
                      ? shown.url
                      : imageUrl(shown.url, 1000)
                  }
                  alt={shown.title}
                />
              )}
              <div className="slide-caption">
                <div>
                  <span className="eyebrow">SOMOS MÁS NETWORK</span>
                  <h3>{shown.title}</h3>
                  <p>{shown.subtitle}</p>
                </div>
                {shown.link && (
                  <a
                    className="circle-button"
                    href={shown.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Ver ${shown.title}`}
                  >
                    <ArrowUpRight size={22} />
                  </a>
                )}
              </div>
              <div className="slide-dots">
                {station.slides.map((s, i) => (
                  <button
                    key={s.id}
                    aria-label={`Ver diapositiva ${i + 1}`}
                    className={
                      i === slide % station.slides.length ? 'active' : ''
                    }
                    onClick={() => setSlide(i)}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <ImagesIcon />
              Pronto más novedades de tu radio.
            </div>
          )}
          <div className="install-card">
            <div className="install-card-top">
              <span className="eyebrow">LLÉVANOS CONTIGO</span>
              <ArrowUpRight size={23} />
            </div>
            <div className="device-illustration">
              <div className="phone">
                <div className="phone-camera" />
                <img src={imageUrl(station.logo, 650)} alt="" />
                <div className="phone-waves">▂ ▅ ▃ ▆ ▂ ▅ ▃</div>
                <span className="phone-play">
                  <Play size={13} fill="currentColor" />
                </span>
              </div>
              <span className="device-circle" />
              <Music2 className="device-note" size={33} />
            </div>
            <h3>
              {station.copy.installHeading.split('\n').map((line, i) => (
                <span key={i} style={{ display: 'block' }}>
                  {line}
                </span>
              ))}
            </h3>
            <p>{station.copy.installText}</p>
            <button className="button navy" onClick={install}>
              <Download size={18} />
              {installed ? 'App instalada' : station.copy.installButton}
              <ArrowRight size={17} />
            </button>
            <small>ANDROID · iOS · COMPUTADORA</small>
          </div>
        </div>
      </section>
    ),
    requests: (
      <section className="request-section" id="pedidos">
        <div className="request-icon">
          <MessageCircle size={34} />
          <Music2 size={17} />
        </div>
        <div>
          <div className="eyebrow">TU VOZ TAMBIÉN SUENA AQUÍ</div>
          <h2>{station.copy.requestHeading}</h2>
          <p>{station.copy.requestText}</p>
        </div>
        <a
          className="button primary"
          href={wa}
          target="_blank"
          rel="noopener noreferrer"
        >
          <SocialIcon name="WhatsApp" size={21} /> {station.copy.requestButton}{' '}
          <ArrowUpRight size={19} />
        </a>
        {station.flags.requestBadge && (
          <span className="request-badge">DIRECTO A CABINA</span>
        )}
      </section>
    ),
    schedule: (
      <section className="content-section schedule-section" id="programacion">
        <div className="section-top">
          <div>
            <div className="eyebrow blue-label">
              BUENAS VOCES. GRANDES MOMENTOS.
            </div>
            <h2>{station.copy.scheduleHeading}</h2>
            <p className="section-description">{station.copy.scheduleText}</p>
          </div>
          <div className="timezone">
            <Clock3 size={15} /> Hora de Venezuela (GMT−4)
          </div>
        </div>
        <div className="schedule-tabs">
          {[
            ['lv', 'Lunes a viernes'],
            ['sab', 'Sábado'],
            ['dom', 'Domingo'],
            ['all', 'Toda la semana'],
          ].map(([v, label]) => (
            <button
              className={day === v ? 'active' : ''}
              key={v}
              onClick={() => setDay(v)}
            >
              {label}
              {now?.day === v && <span />}
            </button>
          ))}
        </div>
        <div className={`schedule-list view-${station.scheduleView}`}>
          {station.shows.filter((s) => day === 'all' || s.day === day)
            .length === 0 ? (
            <div className="empty-state">
              Aún no hay programas para este día. Sigue disfrutando de nuestra
              música.
            </div>
          ) : (
            station.shows
              .filter((s) => day === 'all' || s.day === day)
              .map((s, i) => {
                const active = current?.id === s.id
                const progress =
                  active && now
                    ? Math.max(
                        0,
                        Math.min(
                          100,
                          ((now.minutes - minutes(s.start)) /
                            (minutes(s.end) - minutes(s.start))) *
                            100,
                        ),
                      )
                    : 0
                return (
                  <article
                    id={`show-${s.id}`}
                    className={`show-row ${active ? 'current-show' : ''}`}
                    onDoubleClick={() => {
                      if (station.effects.doubleFavorite)
                        setFavorites((f) =>
                          f.includes(s.id)
                            ? f.filter((id) => id !== s.id)
                            : [...f, s.id],
                        )
                    }}
                    key={s.id}
                  >
                    <div className="show-number">
                      {String(i + 1).padStart(2, '0')}
                    </div>
                    <div className="show-time">
                      <strong>{timeLabel(s.start, station.timeFormat)}</strong>
                      <span>{timeLabel(s.end, station.timeFormat)}</span>
                    </div>
                    <div className="show-details">
                      {day === 'all' && <small>{dayNames[s.day]}</small>}
                      <h3>{s.name}</h3>
                      <p>{s.host}</p>
                      {active && (
                        <div className="show-progress">
                          <span style={{ width: `${progress}%` }} />
                        </div>
                      )}
                    </div>
                    <div className="show-status">
                      {active && station.flags.liveBadge ? (
                        <span className="live-pill">
                          <span className="live-dot" /> EN VIVO
                        </span>
                      ) : (
                        <span className="show-tag">
                          {s.day === 'lv'
                            ? 'LUN — VIE'
                            : s.day === 'sab'
                              ? 'SÁBADO'
                              : 'DOMINGO'}
                        </span>
                      )}
                      {station.flags.favoriteShow && (
                        <button
                          className={`favorite-button ${favorites.includes(s.id) ? 'is-favorite' : ''}`}
                          title="Favorito para esta sesión"
                          aria-label={`${favorites.includes(s.id) ? 'Quitar de' : 'Agregar a'} favoritos: ${s.name}`}
                          onClick={() =>
                            setFavorites((f) =>
                              f.includes(s.id)
                                ? f.filter((id) => id !== s.id)
                                : [...f, s.id],
                            )
                          }
                        >
                          <Heart
                            size={18}
                            fill={
                              favorites.includes(s.id) ? 'currentColor' : 'none'
                            }
                          />
                        </button>
                      )}
                    </div>
                  </article>
                )
              })
          )}
        </div>
        {next && station.flags.nextShowBanner && (
          <div className="next-show">
            <span>
              <Signal size={17} />{' '}
              {station.nextMessage.replace('{name}', next.name) +
                (next.dayOffset
                  ? ' · ' +
                    (next.dayOffset === 1 ? 'mañana' : dayNames[next.day])
                  : '')}
            </span>
            <span>
              {timeLabel(next.start, station.timeFormat)}{' '}
              {station.flags.scheduleCountdown &&
                now &&
                `· En ${Math.floor(next.until / 60) ? `${Math.floor(next.until / 60)} h ` : ''}${next.until % 60} min`}
              <ArrowRight size={16} />
            </span>
          </div>
        )}
        <p className="schedule-note">
          Música que te acompaña antes, durante y después de cada programa.
        </p>
      </section>
    ),
    info: (
      <section className="station-info content-section" id="nosotros">
        <div className="station-info-brand">
          <img
            src={imageUrl(station.logo, 650)}
            alt={`${station.name} ${station.frequency}`}
          />
          <div>
            <div className="eyebrow blue-label">DE AQUÍ. CONTIGO.</div>
            <h2>
              {station.copy.infoHeading.split('\n').map((line, i) => (
                <span key={i} style={{ display: 'block' }}>
                  {line}
                </span>
              ))}
            </h2>
            <p>
              Somos {station.name} {station.frequency}.<br />
              {station.copy.infoText}
            </p>
          </div>
        </div>
        <div className="contact-details">
          {station.flags.infoExpandable ? (
            <details open>
              <summary>Conoce tu emisora</summary>
              <ContactInfo station={station} />
            </details>
          ) : (
            <ContactInfo station={station} />
          )}
        </div>
      </section>
    ),
    socials: (
      <section className="social-section">
        <div>
          <span className="eyebrow">LA CONVERSACIÓN SIGUE</span>
          <h2>{station.copy.socialsHeading}</h2>
        </div>
        {socialBar()}
        <a
          className="social-handle"
          href={station.socials.find((s) => s.name === 'Instagram')?.url || wa}
          target="_blank"
          rel="noopener noreferrer"
        >
          {station.copy.socialHandle} <ArrowUpRight size={18} />
        </a>
      </section>
    ),
    footer: (
      <footer>
        <a className="footer-brand" href="#inicio">
          <img src={imageUrl(station.logo, 650)} alt="" />
          <span>
            {station.name}
            <strong>{station.frequency}</strong>
          </span>
        </a>
        <p>
          © {new Date().getFullYear()} {station.name}.<br />
          {station.copy.footerText}
        </p>
        <div className="footer-actions">
          <button onClick={() => setInstallOpen(true)}>
            Instalar app <Download size={14} />
          </button>
          <button onClick={openAdmin}>
            <LockKeyhole size={14} /> Administración
          </button>
        </div>
        <span className="footer-slogan">{station.slogan}</span>
      </footer>
    ),
  }
  return (
    <div
      className={`radio-app ${station.flags.compactMode ? 'compact' : ''} ${station.flags.nightMode ? 'night' : ''} ${station.flags.energyMode ? 'energy-mode' : ''} ${station.effects.hoverLift ? 'hover-lift' : ''} ${station.effects.scanlines ? 'scanlines' : ''} ${Object.entries(
        station.effects,
      )
        .filter(([, active]) => active)
        .map(([key]) => `effect-${key}`)
        .join(' ')}`}
      onClick={(e) => {
        if (
          station.effects.haptic &&
          (e.target as HTMLElement).closest('button,a')
        )
          navigator.vibrate?.(15)
        if (
          station.effects.requestNotice &&
          (e.target as HTMLElement).closest('a[href*="wa.me"]')
        )
          toast.info('Abriendo WhatsApp para enviar tu pedido')
      }}
      style={
        {
          '--blue': station.blue,
          '--yellow': station.yellow,
          '--card-radius': `${station.radius}px`,
          '--spacing': station.spacing,
          fontFamily: `'${station.font}', sans-serif`,
          fontSize: station.fontSize,
        } as CSSProperties
      }
    >
      <Toaster
        position={station.flags.toastPosition ? 'bottom-right' : 'top-right'}
        visibleToasts={3}
        duration={station.flags.bannerAutoHide ? 4500 : Infinity}
        closeButton
      />
      <audio
        ref={audio}
        src={station.stream}
        preload="none"
        onPlaying={() => {
          setPlaying(true)
          setConnecting(false)
          setSignalError(false)
        }}
        onPause={() => {
          setPlaying(false)
          setConnecting(false)
        }}
        onWaiting={() => {
          if (playing) setConnecting(true)
        }}
        onCanPlay={() => {
          setConnecting(false)
          setSignalError(false)
        }}
        onError={() => {
          setSignalError(true)
          setPlaying(false)
          setConnecting(false)
        }}
      />
      {loading && (
        <div className="splash">
          <img src={imageUrl(station.logo, 650)} alt={station.name} />
          <span>PREPARANDO TU MEJOR COMPAÑÍA</span>
          <div className="load-bar">
            <i />
          </div>
        </div>
      )}
      {!online && (
        <div className="offline-overlay" role="alert">
          <img src={imageUrl(station.logo, 650)} alt={station.name} />
          <h2>Sin conexión</h2>
          <p>La radio te espera. Revisa tu conexión a internet.</p>
          <button
            className="button primary"
            onClick={() => {
              setOnline(navigator.onLine)
              load()
            }}
          >
            <RefreshCw size={17} /> Reintentar
          </button>
        </div>
      )}
      <header>
        <a
          className="brand"
          href="#inicio"
          onPointerDown={startHold}
          onPointerUp={endHold}
          onPointerLeave={endHold}
          onDoubleClick={() => {
            if (station.flags.logoTapEasterEgg) {
              setBurst(true)
              setTimeout(() => setBurst(false), 1800)
            }
          }}
        >
          <img
            src={imageUrl(station.logo, 650)}
            alt={`${station.name} ${station.frequency}`}
          />
          <span className="brand-line" />
          <span className="brand-location">
            CIUDAD BOLÍVAR
            <br />
            <strong>VENEZUELA</strong>
          </span>
        </a>
        <nav className={menu ? 'mobile-open' : ''}>
          <a
            href="#inicio"
            onClick={() => setMenu(false)}
            className="nav-active"
          >
            Inicio
          </a>
          <a href="#programacion" onClick={() => setMenu(false)}>
            Programación
          </a>
          <a href="#nosotros" onClick={() => setMenu(false)}>
            La emisora
          </a>
          <a href="#pedidos" onClick={() => setMenu(false)}>
            Contacto
          </a>
        </nav>
        <div className="header-actions">
          {station.flags.radioStatusDot && (
            <span className="header-live">
              <span className={`live-dot ${signalError ? 'signal-off' : ''}`} />
              {signalError ? 'SIN SEÑAL' : 'RADIO ONLINE'}
            </span>
          )}
          <button
            className="button navy small header-install"
            onClick={install}
          >
            <Download size={16} />
            {installed ? 'Instalada' : 'Instalar app'}
          </button>
          <button
            className="icon-button mobile-toggle"
            onClick={() => setMenu((v) => !v)}
            aria-label={menu ? 'Cerrar menú' : 'Abrir menú'}
          >
            {menu ? <X /> : <Menu />}
          </button>
        </div>
      </header>
      {station.visible.ticker && (
        <div
          className={`ticker ticker-${station.tickerBorder}`}
          style={{ height: station.tickerHeight, fontSize: station.tickerFont }}
          onClick={() =>
            station.flags.tickerPause && setTickerPaused((v) => !v)
          }
          title={
            station.flags.tickerPause
              ? 'Toca para pausar o continuar'
              : undefined
          }
        >
          <div
            style={{
              animationDuration: `${station.tickerSpeed}s`,
              animationPlayState: tickerPaused ? 'paused' : 'running',
            }}
          >
            <span>{station.ticker} &nbsp; ✳ &nbsp; </span>
            <span aria-hidden="true">{station.ticker} &nbsp; ✳ &nbsp; </span>
          </div>
        </div>
      )}
      {dataError && (
        <div className="data-notice" role="status">
          La configuración no se pudo actualizar. Mostramos la última
          programación disponible. <button onClick={load}>Reintentar</button>
        </div>
      )}
      {greeting && <div className="greeting">{greeting}</div>}
      {station.flags.promoBanner && (
        <div className="promo-banner">{station.promo}</div>
      )}
      <main>
        {station.sections
          .filter((key) => station.visible[key as keyof typeof station.visible])
          .map((key) => (
            <div className={`block-${key}`} key={key} style={sectionStyle(key)}>
              {blocks[key]}
            </div>
          ))}
      </main>
      <div className="sticky-player">
        <div className="sticky-station">
          <img src={imageUrl(station.logo, 650)} alt="" />
          <div>
            <strong>
              {station.name} <span>{station.frequency}</span>
            </strong>
            <small>
              {signalError
                ? 'Sin señal · Toca para reintentar'
                : connecting
                  ? 'Conectando con tu radio…'
                  : station.flags.nowPlayingBanner && current
                    ? current.name
                    : station.slogan}
            </small>
          </div>
        </div>
        <div className="sticky-controls">
          {playButton(true)}
          {station.flags.liveBadge && (
            <span className="player-live">
              <span className="live-dot" />
              {playing ? 'EN VIVO' : 'SEÑAL EN VIVO'}
            </span>
          )}
          <div
            className={`waveform ${playing ? 'is-playing' : ''} ${!station.effects.waves ? 'waves-hidden' : ''}`}
          >
            {Array.from({ length: 24 }, (_, i) => (
              <i
                key={i}
                style={{
                  height: `${8 + (Math.sin(i * 2.7) + 1) * 10}px`,
                  animationDelay: `${i * 0.07}s`,
                }}
              />
            ))}
          </div>
        </div>
        <div className="player-tools">
          <button
            className="icon-button"
            onClick={() => setVolume((v) => (v ? 0 : 0.8))}
            aria-label={volume ? 'Silenciar' : 'Activar sonido'}
          >
            {volume ? <Volume2 size={19} /> : <VolumeX size={19} />}
          </button>
          <input
            type="range"
            aria-label="Volumen"
            min="0"
            max="1"
            step=".01"
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
          />
          {station.flags.shareButton && (
            <button
              className="icon-button"
              onClick={share}
              aria-label="Compartir radio"
            >
              <Share2 size={18} />
            </button>
          )}
          {station.flags.fullscreenPlayer && (
            <button
              className="icon-button"
              onClick={() => {
                setCinema(true)
                document.documentElement.requestFullscreen?.().catch(() => {})
              }}
              aria-label="Abrir modo cine"
            >
              <Maximize2 size={18} />
            </button>
          )}
        </div>
      </div>
      {signalError && station.flags.offlineBanner && (
        <div className="signal-notice">
          <img src={imageUrl(station.logo, 650)} alt="" />
          <div>
            <strong>Fuera del aire / Sin señal</strong>
            <p>{station.offlineMessage}</p>
          </div>
          <button
            className="icon-button"
            aria-label="Reintentar audio"
            onClick={togglePlay}
          >
            <RefreshCw size={18} />
          </button>
        </div>
      )}
      {(station.effects.floatingNotes || station.effects.particles) &&
        !station.flags.energyMode && (
          <div
            className="floating-notes"
            style={{ opacity: station.noteOpacity }}
            aria-hidden="true"
          >
            {Array.from({ length: 8 }, (_, i) => (
              <Music2
                key={i}
                style={{ left: `${i * 13}%`, animationDelay: `${i * 1.7}s` }}
              />
            ))}
          </div>
        )}
      {burst && (
        <div className="confetti" aria-hidden="true">
          {Array.from({ length: 24 }, (_, i) => (
            <i
              key={i}
              style={{
                left: `${i * 4}%`,
                animationDelay: `${i * 0.02}s`,
                background: i % 2 ? 'var(--yellow)' : '#1682ee',
              }}
            />
          ))}
        </div>
      )}
      <Dialog open={installOpen} onOpenChange={setInstallOpen}>
        <DialogContent className="install-dialog">
          <div className="modal-icon">
            <Download size={26} />
          </div>
          <DialogTitle>Más Network, siempre contigo.</DialogTitle>
          <DialogDescription>
            Instala la aplicación desde tu navegador. Sin tiendas y sin costo.
          </DialogDescription>
          {installed ? (
            <p className="success-message">
              <Check size={20} /> La aplicación ya está instalada en este
              dispositivo.
            </p>
          ) : (
            installEvent && (
              <button className="button primary" onClick={install}>
                <Download size={18} /> Instalar ahora
              </button>
            )
          )}
          <div className="install-instructions">
            <article>
              <Smartphone />
              <div>
                <h3>Android · Chrome</h3>
                <p>
                  Abre el menú ⋮ y selecciona «Instalar aplicación» o «Agregar a
                  pantalla principal». Confirma en «Instalar».
                </p>
              </div>
            </article>
            <article>
              <Smartphone />
              <div>
                <h3>iPhone / iPad · Safari</h3>
                <p>
                  Abre esta página en Safari, toca Compartir y elige «Añadir a
                  pantalla de inicio». Luego toca «Añadir».
                </p>
              </div>
            </article>
            <article>
              <Monitor />
              <div>
                <h3>Computadora · Chrome o Edge</h3>
                <p>
                  Haz clic en el icono de instalación de la barra de direcciones
                  o abre el menú del navegador y selecciona «Instalar esta
                  aplicación».
                </p>
              </div>
            </article>
          </div>
          <p className="hint">
            La radio en vivo necesita internet. Las opciones de instalación
            dependen del navegador. La reproducción con la pantalla bloqueada
            depende del dispositivo.
          </p>
        </DialogContent>
      </Dialog>
      <Dialog
        open={login}
        onOpenChange={(v) => {
          setLogin(v)
          if (!v) setPin('')
        }}
      >
        <DialogContent className="login-dialog">
          <div className="modal-icon">
            <LockKeyhole size={25} />
          </div>
          <DialogTitle>Administración</DialogTitle>
          <DialogDescription>
            Introduce tu PIN para gestionar Más Network.
          </DialogDescription>
          <form onSubmit={authenticate}>
            <label className="field">
              PIN de acceso
              <input
                autoFocus
                type="password"
                inputMode="numeric"
                autoComplete="off"
                maxLength={12}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                required
                className="pin-input"
              />
            </label>
            {loginError && (
              <p className="form-error" role="alert">
                {loginError}
              </p>
            )}
            <button
              className="button navy"
              disabled={loginBusy || pin.length < 4}
            >
              {loginBusy ? (
                <LoaderCircle className="spin" size={18} />
              ) : (
                <LockKeyhole size={17} />
              )}{' '}
              {loginBusy ? 'Verificando…' : 'Entrar al panel'}
            </button>
          </form>
        </DialogContent>
      </Dialog>
      {admin && (
        <AdminPanel
          open={admin}
          onClose={() => setAdmin(false)}
          station={station}
          onSaved={(s) => {
            setStation(s)
            etag.current = ''
            if (s.effects.adminNotice)
              toast.info('La emisora acaba de actualizarse')
          }}
        />
      )}
      {cinema && (
        <div className="cinema">
          <button
            className="cinema-close icon-button"
            onClick={() => {
              setCinema(false)
              if (document.fullscreenElement) document.exitFullscreen?.()
            }}
            aria-label="Salir del modo cine"
          >
            <X size={28} />
          </button>
          {station.cinema.logo && (
            <img src={imageUrl(station.logo, 650)} alt={station.name} />
          )}
          <h2>
            {station.name} <span>{station.frequency}</span>
          </h2>
          {station.cinema.ticker && <p>{station.ticker}</p>}
          {station.cinema.player && (
            <>
              {playButton()}
              <strong>{current?.name || station.slogan}</strong>
              <div className={`waveform ${playing ? 'is-playing' : ''}`}>
                {Array.from({ length: 20 }, (_, i) => (
                  <i
                    key={i}
                    style={{
                      height: `${10 + (i % 5) * 8}px`,
                      animationDelay: `${i * 0.1}s`,
                    }}
                  />
                ))}
              </div>
            </>
          )}
          {station.cinema.socials && socialBar()}
          {station.cinema.notes && (
            <Music2 className="cinema-note" size={180} />
          )}
        </div>
      )}
    </div>
  )
}
function ContactInfo({ station }: { station: Station }) {
  return (
    <div className="contact-grid">
      <div>
        <MapPin size={19} />
        <span>
          <small>DESDE NUESTRA CIUDAD</small>
          {station.city}
        </span>
      </div>
      <div>
        <Radio size={19} />
        <span>
          <small>DIRECTOR</small>
          {station.director}
        </span>
      </div>
      <a href={`mailto:${station.email}`}>
        <Mail size={19} />
        <span>
          <small>ESCRÍBENOS</small>
          {station.email}
        </span>
      </a>
      <a
        href={`https://wa.me/${station.whatsapp}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        <SocialIcon name="WhatsApp" size={19} />
        <span>
          <small>WHATSAPP</small>+{station.whatsapp}
        </span>
      </a>
    </div>
  )
}
function ImagesIcon() {
  return <Music2 size={32} />
}
