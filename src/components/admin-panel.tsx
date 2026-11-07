import { useState } from 'react'
import {
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Upload,
  Save,
  LogOut,
  Radio,
  Settings2,
  CalendarDays,
  Images,
  Type,
  Palette,
  LayoutGrid,
  MessageSquare,
  Link,
  Clapperboard,
  Sparkles,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import type { Station, Show } from '@/lib/station'
import { dayNames } from '@/lib/station'
import { effectGroups } from '@/lib/effects'
const tabs = [
  ['Identidad', Radio],
  ['Textos', MessageSquare],
  ['Programación', CalendarDays],
  ['Carruseles', Images],
  ['Mensajes', MessageSquare],
  ['Redes y contacto', Link],
  ['Apariencia', Palette],
  ['Tipografía', Type],
  ['Secciones', LayoutGrid],
  ['Modo cine', Clapperboard],
  ['Efectos y funciones', Sparkles],
] as const
const labels: Record<string, string> = {
  offlineBanner: 'Banner sin señal',
  nextShowBanner: 'Siguiente programa',
  welcomeToast: 'Bienvenida',
  offlineAlert: 'Aviso sin conexión',
  reconnectToast: 'Aviso de reconexión',
  showAlert: 'Aviso de nuevo programa',
  liveBadge: 'Insignia en vivo',
  promoBanner: 'Banner promocional',
  dailyGreeting: 'Saludo del día',
  scheduleRemind: 'Recordar favoritos',
  nowPlayingBanner: 'Programa actual',
  playerVolumeFade: 'Volumen progresivo',
  fullscreenPlayer: 'Pantalla completa',
  energyMode: 'Ahorrar energía',
  radioStatusDot: 'Indicador de señal',
  autoScrollSchedule: 'Desplazar al programa actual',
  scheduleCountdown: 'Cuenta regresiva',
  favoriteShow: 'Favoritos',
  compactMode: 'Modo compacto',
  shareButton: 'Botón compartir',
  copyLinkToast: 'Aviso de enlace copiado',
  logoTapEasterEgg: 'Efecto al tocar el logo',
  socialPreview: 'Mostrar enlace de redes',
  requestBadge: 'Etiqueta de pedidos',
  infoExpandable: 'Información desplegable',
  tickerPause: 'Pausar ticker al tocar',
  nightMode: 'Modo nocturno',
  bannerAutoHide: 'Ocultar avisos automáticamente',
  toastPosition: 'Avisos en la parte inferior',
  broadcastAlert: 'Aviso de transmisión especial',
  waves: 'Ondas de audio',
  logoPulse: 'Pulso del logo',
  floatingNotes: 'Notas flotantes',
  scanlines: 'Líneas de transmisión',
  rotatingLogo: 'Logo en rotación',
  particles: 'Partículas',
  confetti: 'Confeti al reproducir',
  hoverLift: 'Elevación al pasar el cursor',
}
export function AdminPanel({
  open,
  onClose,
  station,
  onSaved,
}: {
  open: boolean
  onClose: () => void
  station: Station
  onSaved: (s: Station) => void
}) {
  const [tab, setTab] = useState('Identidad'),
    [draft, setDraft] = useState<Station>(structuredClone(station)),
    [busy, setBusy] = useState(false),
    [dirty, setDirty] = useState(false),
    [error, setError] = useState('')
  function set<K extends keyof Station>(key: K, value: Station[K]) {
    setDraft((d) => ({ ...d, [key]: value }))
    setDirty(true)
  }
  function input(key: keyof Station, label: string, type = 'text') {
    return (
      <label className="field" key={key}>
        {label}
        <input
          type={type}
          value={String(draft[key])}
          onChange={(e) =>
            set(
              key,
              (type === 'number'
                ? Number(e.target.value)
                : e.target.value) as never,
            )
          }
        />
      </label>
    )
  }
  async function upload(file: File | undefined, cb: (url: string) => void) {
    if (!file) return
    setBusy(true)
    try {
      const data = new FormData()
      data.append('file', file)
      const r = await fetch('/api/media', { method: 'POST', body: data })
      const result = await r.json()
      if (!r.ok) throw Error(result.error)
      cb(result.url)
      toast.success('Archivo cargado. Guarda los cambios para publicarlo.')
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      setBusy(false)
    }
  }
  function media(key: 'logo' | 'background', label: string) {
    return (
      <div className="asset-field">
        {input(key, label, 'url')}
        <label className="button secondary small">
          <Upload size={15} /> Subir archivo
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            hidden
            onChange={(e) =>
              upload(e.target.files?.[0], (url) => set(key, url))
            }
          />
        </label>
        <img src={draft[key]} alt={label} />
      </div>
    )
  }
  function move<T>(items: T[], i: number, offset: number) {
    const copy = [...items],
      j = i + offset
    if (j < 0 || j >= items.length) return copy
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
    return copy
  }
  async function save() {
    setBusy(true)
    setError('')
    try {
      const r = await fetch('/api/station', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draft),
      })
      const result = await r.json().catch(() => ({
        error: 'Sesión expirada. Cierra el panel e ingresa de nuevo.',
      }))
      if (!r.ok) throw Error(result.error)
      onSaved(draft)
      setDirty(false)
      toast.success('Cambios publicados para todos los oyentes.')
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusy(false)
    }
  }
  function updateShow(id: string, key: keyof Show, value: string) {
    set(
      'shows',
      draft.shows.map((x) => (x.id === id ? { ...x, [key]: value } : x)),
    )
  }
  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v && !dirty) onClose()
        else if (!v)
          setError(
            'Tienes cambios pendientes. Guarda o descarta antes de salir.',
          )
      }}
    >
      <DialogContent className="admin-dialog">
        <div className="admin-heading">
          <div className="eyebrow">
            <Settings2 size={15} /> CENTRO DE CONTROL
          </div>
          <DialogTitle>Tu radio, a tu manera.</DialogTitle>
          <DialogDescription>
            Administra el contenido y publica tus cambios con «Guardar cambios».
          </DialogDescription>
        </div>
        <div className="admin-layout">
          <aside className="admin-tabs">
            {tabs.map(([name, Icon]) => (
              <button
                className={tab === name ? 'selected' : ''}
                key={name}
                onClick={() => setTab(name)}
              >
                <Icon size={17} />
                {name}
              </button>
            ))}
          </aside>
          <div className="admin-fields">
            <h3>{tab}</h3>
            {tab === 'Identidad' && (
              <>
                <div className="form-grid">
                  {input('name', 'Nombre de la emisora')}
                  {input('frequency', 'Frecuencia')}
                  {input('slogan', 'Eslogan')}
                </div>
                <label className="field">
                  Título de portada
                  <textarea
                    value={draft.heroTitle}
                    onChange={(e) => set('heroTitle', e.target.value)}
                  />
                </label>
                {input('heroText', 'Descripción de portada')}
                {input('stream', 'URL de audio directo (HTTPS)', 'url')}
                <p className="hint">
                  Usa un enlace al audio, como /stream; las páginas de
                  reproductores no son audio directo.
                </p>
                {media('logo', 'Logo de la emisora')}
                {media('background', 'Imagen de portada')}
              </>
            )}
            {tab === 'Textos' && (
              <>
                {Object.entries(draft.copy).map(([key, value]) => (
                  <label className="field" key={key}>
                    {(
                      {
                        liveButton: 'Botón de escuchar',
                        scheduleButton: 'Botón de programación',
                        highlightsHeading: 'Título de novedades',
                        highlightsEyebrow: 'Etiqueta de novedades',
                        requestHeading: 'Título de pedidos',
                        requestText: 'Descripción de pedidos',
                        requestButton: 'Botón de pedidos',
                        scheduleHeading: 'Título de programación',
                        scheduleText: 'Descripción de programación',
                        installHeading: 'Título de instalación',
                        installText: 'Descripción de instalación',
                        installButton: 'Botón de instalación',
                        infoHeading: 'Título de la emisora',
                        infoText: 'Descripción de la emisora',
                        socialsHeading: 'Título de redes',
                        socialHandle: 'Nombre en redes',
                        footerText: 'Pie de página',
                      } as Record<string, string>
                    )[key] || key}
                    <textarea
                      value={value}
                      onChange={(e) =>
                        set('copy', { ...draft.copy, [key]: e.target.value })
                      }
                    />
                  </label>
                ))}
              </>
            )}
            {tab === 'Programación' && (
              <>
                <div className="form-grid">
                  <label className="field">
                    Presentación
                    <select
                      value={draft.scheduleView}
                      onChange={(e) => set('scheduleView', e.target.value)}
                    >
                      {Object.entries({
                        classic: 'Clásico',
                        timeline: 'Línea de tiempo',
                        compact: 'Compacto',
                        grid: 'Cuadrícula',
                        broadcast: 'Broadcast',
                        magazine: 'Revista',
                        neon: 'Neón',
                        minimal: 'Mínimal',
                      }).map(([v, l]) => (
                        <option key={v} value={v}>
                          {l}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="field">
                    Formato de hora
                    <select
                      value={draft.timeFormat}
                      onChange={(e) => set('timeFormat', e.target.value)}
                    >
                      {['12h', 'short', '24h', 'dot', 'formal'].map((x) => (
                        <option key={x}>{x}</option>
                      ))}
                    </select>
                  </label>
                </div>
                <p className="hint">
                  Horario de Caracas. Conexión 0285 se configuró de 11:00 AM a
                  1:00 PM para mantener la secuencia indicada.
                </p>
                {draft.shows.map((s, i) => (
                  <article className="edit-card" key={s.id}>
                    <div className="edit-toolbar">
                      <b>Programa {i + 1}</b>
                      <div>
                        <button
                          aria-label="Subir programa"
                          onClick={() => set('shows', move(draft.shows, i, -1))}
                        >
                          <ArrowUp size={16} />
                        </button>
                        <button
                          aria-label="Bajar programa"
                          onClick={() => set('shows', move(draft.shows, i, 1))}
                        >
                          <ArrowDown size={16} />
                        </button>
                        <button
                          aria-label="Eliminar programa"
                          onClick={() =>
                            set(
                              'shows',
                              draft.shows.filter((x) => x.id !== s.id),
                            )
                          }
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    <div className="form-grid">
                      <label className="field">
                        Programa
                        <input
                          value={s.name}
                          onChange={(e) =>
                            updateShow(s.id, 'name', e.target.value)
                          }
                        />
                      </label>
                      <label className="field">
                        Locutor / locutora
                        <input
                          value={s.host}
                          onChange={(e) =>
                            updateShow(s.id, 'host', e.target.value)
                          }
                        />
                      </label>
                      <label className="field">
                        Día
                        <select
                          value={s.day}
                          onChange={(e) =>
                            updateShow(s.id, 'day', e.target.value)
                          }
                        >
                          {Object.entries(dayNames).map(([v, l]) => (
                            <option key={v} value={v}>
                              {l}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="field">
                        Inicio
                        <input
                          type="time"
                          value={s.start}
                          onChange={(e) =>
                            updateShow(s.id, 'start', e.target.value)
                          }
                        />
                      </label>
                      <label className="field">
                        Fin
                        <input
                          type="time"
                          value={s.end}
                          onChange={(e) =>
                            updateShow(s.id, 'end', e.target.value)
                          }
                        />
                      </label>
                    </div>
                  </article>
                ))}
                <button
                  className="button secondary"
                  onClick={() =>
                    set('shows', [
                      ...draft.shows,
                      {
                        id: crypto.randomUUID(),
                        name: 'Nuevo programa',
                        host: '',
                        start: '09:00',
                        end: '10:00',
                        day: 'lv',
                      },
                    ])
                  }
                >
                  <Plus size={17} /> Agregar programa
                </button>
              </>
            )}
            {tab === 'Carruseles' && (
              <>
                <p className="hint">
                  Imágenes o videos MP4/WebM de hasta 4,5 MB. Para videos más
                  grandes usa un enlace HTTPS directo. El enlace de destino es
                  opcional.
                </p>
                {draft.slides.map((s, i) => (
                  <article className="edit-card" key={s.id}>
                    <div className="edit-toolbar">
                      <b>Diapositiva {i + 1}</b>
                      <div>
                        <button
                          aria-label="Subir diapositiva"
                          onClick={() =>
                            set('slides', move(draft.slides, i, -1))
                          }
                        >
                          <ArrowUp size={16} />
                        </button>
                        <button
                          aria-label="Bajar diapositiva"
                          onClick={() =>
                            set('slides', move(draft.slides, i, 1))
                          }
                        >
                          <ArrowDown size={16} />
                        </button>
                        <button
                          aria-label="Eliminar diapositiva"
                          onClick={() =>
                            set(
                              'slides',
                              draft.slides.filter((x) => x.id !== s.id),
                            )
                          }
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    {['title', 'subtitle', 'url', 'link'].map((k, j) => (
                      <label className="field" key={k}>
                        {
                          [
                            'Título',
                            'Descripción',
                            'URL del archivo',
                            'Enlace al hacer clic',
                          ][j]
                        }
                        <input
                          value={s[k as keyof typeof s]}
                          onChange={(e) =>
                            set(
                              'slides',
                              draft.slides.map((x) =>
                                x.id === s.id
                                  ? { ...x, [k]: e.target.value }
                                  : x,
                              ),
                            )
                          }
                        />
                      </label>
                    ))}
                    <label className="field">
                      Tipo
                      <select
                        value={s.type}
                        onChange={(e) =>
                          set(
                            'slides',
                            draft.slides.map((x) =>
                              x.id === s.id
                                ? { ...x, type: e.target.value }
                                : x,
                            ),
                          )
                        }
                      >
                        <option value="image">Imagen</option>
                        <option value="video">Video</option>
                      </select>
                    </label>
                    <label className="button secondary small">
                      <Upload size={16} /> Subir imagen o video
                      <input
                        type="file"
                        hidden
                        accept="image/png,image/jpeg,image/webp,image/gif,video/mp4,video/webm"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          upload(file, (url) =>
                            set(
                              'slides',
                              draft.slides.map((x) =>
                                x.id === s.id
                                  ? {
                                      ...x,
                                      url,
                                      type: file?.type.startsWith('video')
                                        ? 'video'
                                        : 'image',
                                    }
                                  : x,
                              ),
                            ),
                          )
                        }}
                      />
                    </label>
                  </article>
                ))}
                <button
                  className="button secondary"
                  onClick={() =>
                    set('slides', [
                      ...draft.slides,
                      {
                        id: crypto.randomUUID(),
                        title: 'Nueva diapositiva',
                        subtitle: '',
                        url: '/img/banner.webp',
                        type: 'image',
                        link: '',
                      },
                    ])
                  }
                >
                  <Plus size={17} /> Agregar diapositiva
                </button>
              </>
            )}
            {tab === 'Mensajes' && (
              <>
                {input('ticker', 'Texto desplazante')}
                {input('nextMessage', 'Siguiente programa · usa {name}')}
                {input('offlineMessage', 'Mensaje sin señal')}
                {input('welcome', 'Bienvenida')}
                {input('promo', 'Banner promocional')}
                <div className="form-grid">
                  {input('tickerHeight', 'Altura del ticker · 24–48', 'number')}
                  {input('tickerFont', 'Fuente del ticker · 9–16', 'number')}
                  {input(
                    'tickerSpeed',
                    'Duración del recorrido · 8–90 segundos',
                    'number',
                  )}
                  <label className="field">
                    Borde del ticker
                    <select
                      value={draft.tickerBorder}
                      onChange={(e) => set('tickerBorder', e.target.value)}
                    >
                      {['square', 'rounded', 'pill', 'none'].map((x) => (
                        <option key={x}>{x}</option>
                      ))}
                    </select>
                  </label>
                </div>
              </>
            )}
            {tab === 'Redes y contacto' && (
              <>
                <div className="form-grid">
                  {input('director', 'Director')}
                  {input('city', 'Ciudad')}
                  {input('email', 'Correo electrónico', 'email')}
                  {input(
                    'whatsapp',
                    'WhatsApp · código de país y número, solo dígitos',
                  )}
                  {input(
                    'shareUrl',
                    'URL para compartir · vacío usa la actual',
                    'url',
                  )}
                  {input(
                    'socialSize',
                    'Tamaño de los iconos · 16–32',
                    'number',
                  )}
                </div>
                {draft.socials.map((s, i) => (
                  <article className="edit-card" key={s.name}>
                    <div className="edit-toolbar">
                      <label className="toggle">
                        <input
                          type="checkbox"
                          checked={s.enabled}
                          onChange={(e) =>
                            set(
                              'socials',
                              draft.socials.map((x) =>
                                x.name === s.name
                                  ? { ...x, enabled: e.target.checked }
                                  : x,
                              ),
                            )
                          }
                        />
                        {s.name}
                      </label>
                      <div>
                        <button
                          aria-label={`Subir ${s.name}`}
                          onClick={() =>
                            set('socials', move(draft.socials, i, -1))
                          }
                        >
                          <ArrowUp size={16} />
                        </button>
                        <button
                          aria-label={`Bajar ${s.name}`}
                          onClick={() =>
                            set('socials', move(draft.socials, i, 1))
                          }
                        >
                          <ArrowDown size={16} />
                        </button>
                      </div>
                    </div>
                    <label className="field">
                      Enlace HTTPS
                      <input
                        type="url"
                        value={s.url}
                        onChange={(e) =>
                          set(
                            'socials',
                            draft.socials.map((x) =>
                              x.name === s.name
                                ? { ...x, url: e.target.value }
                                : x,
                            ),
                          )
                        }
                      />
                    </label>
                  </article>
                ))}
              </>
            )}
            {tab === 'Apariencia' && (
              <>
                <div className="form-grid">
                  {input('blue', 'Azul principal', 'color')}
                  {input('yellow', 'Amarillo de acento', 'color')}
                  {input('radius', 'Radio de esquinas · 0–40', 'number')}
                  {input('spacing', 'Espaciado · 0,6–1,5', 'number')}
                  {input('noteOpacity', 'Opacidad de notas · 0–1', 'number')}
                </div>
                <div
                  className="appearance-preview"
                  style={{
                    background: draft.blue,
                    color: draft.yellow,
                    borderRadius: draft.radius,
                  }}
                >
                  <Radio />
                  <strong>{draft.name}</strong>
                  <span>{draft.slogan}</span>
                </div>
              </>
            )}
            {tab === 'Tipografía' && (
              <>
                <div className="form-grid">
                  <label className="field">
                    Fuente global
                    <select
                      value={draft.font}
                      onChange={(e) => set('font', e.target.value)}
                    >
                      {['Outfit', 'Barlow Condensed', 'Georgia', 'Verdana'].map(
                        (x) => (
                          <option key={x}>{x}</option>
                        ),
                      )}
                    </select>
                  </label>
                  {input('fontSize', 'Tamaño base · 12–24', 'number')}
                </div>
                {[
                  'player',
                  'requests',
                  'schedule',
                  'info',
                  'socials',
                  'footer',
                ].map((key) => {
                  const s = draft.sectionStyles[key] || {
                    font: draft.font,
                    size: 1,
                    weight: '400',
                    italic: false,
                    transform: 'none',
                  }
                  const update = (v: Partial<typeof s>) =>
                    set('sectionStyles', {
                      ...draft.sectionStyles,
                      [key]: { ...s, ...v },
                    })
                  return (
                    <article className="edit-card" key={key}>
                      <b>{key}</b>
                      <div className="form-grid">
                        <label className="field">
                          Fuente
                          <select
                            value={s.font}
                            onChange={(e) => update({ font: e.target.value })}
                          >
                            {[
                              'Outfit',
                              'Barlow Condensed',
                              'Georgia',
                              'Verdana',
                            ].map((x) => (
                              <option key={x}>{x}</option>
                            ))}
                          </select>
                        </label>
                        <label className="field">
                          Escala · 0,6–2
                          <input
                            type="number"
                            min=".6"
                            max="2"
                            step=".1"
                            value={s.size}
                            onChange={(e) =>
                              update({ size: Number(e.target.value) })
                            }
                          />
                        </label>
                        <label className="field">
                          Transformación
                          <select
                            value={s.transform}
                            onChange={(e) =>
                              update({ transform: e.target.value })
                            }
                          >
                            {[
                              'none',
                              'uppercase',
                              'lowercase',
                              'capitalize',
                            ].map((x) => (
                              <option key={x}>{x}</option>
                            ))}
                          </select>
                        </label>
                        <label className="toggle">
                          <input
                            type="checkbox"
                            checked={s.weight === '700'}
                            onChange={(e) =>
                              update({
                                weight: e.target.checked ? '700' : '400',
                              })
                            }
                          />{' '}
                          Negrita
                        </label>
                        <label className="toggle">
                          <input
                            type="checkbox"
                            checked={s.italic}
                            onChange={(e) =>
                              update({ italic: e.target.checked })
                            }
                          />{' '}
                          Cursiva
                        </label>
                      </div>
                      <p
                        style={{
                          fontFamily: s.font,
                          fontSize: `${s.size}em`,
                          fontWeight: s.weight,
                          fontStyle: s.italic ? 'italic' : 'normal',
                          textTransform: s.transform as 'none',
                        }}
                      >
                        Así suena {draft.name}
                      </p>
                    </article>
                  )
                })}
              </>
            )}
            {tab === 'Secciones' && (
              <>
                <p className="hint">
                  Activa, oculta y cambia el orden de los bloques de la
                  aplicación.
                </p>
                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={draft.visible.ticker}
                    onChange={(e) =>
                      set('visible', {
                        ...draft.visible,
                        ticker: e.target.checked,
                      })
                    }
                  />{' '}
                  Ticker superior
                </label>
                {draft.sections.map((key, i) => (
                  <div className="edit-card edit-toolbar" key={key}>
                    <label className="toggle">
                      <input
                        type="checkbox"
                        checked={
                          draft.visible[key as keyof typeof draft.visible]
                        }
                        onChange={(e) =>
                          set('visible', {
                            ...draft.visible,
                            [key]: e.target.checked,
                          })
                        }
                      />
                      {
                        (
                          {
                            player: 'Reproductor',
                            carousel: 'Carruseles',
                            requests: 'Pedidos y saludos',
                            schedule: 'Programación',
                            info: 'Información',
                            socials: 'Redes sociales',
                            footer: 'Pie de página',
                          } as Record<string, string>
                        )[key]
                      }
                    </label>
                    <div>
                      <button
                        aria-label="Subir sección"
                        onClick={() =>
                          set('sections', move(draft.sections, i, -1))
                        }
                      >
                        <ArrowUp size={16} />
                      </button>
                      <button
                        aria-label="Bajar sección"
                        onClick={() =>
                          set('sections', move(draft.sections, i, 1))
                        }
                      >
                        <ArrowDown size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </>
            )}
            {tab === 'Modo cine' && (
              <>
                <p className="hint">
                  El botón de pantalla completa abre el modo cine. Elige los
                  elementos que aparecen en él.
                </p>
                {Object.entries(draft.cinema).map(([key, v]) => (
                  <label className="toggle" key={key}>
                    <input
                      type="checkbox"
                      checked={v}
                      onChange={(e) =>
                        set('cinema', {
                          ...draft.cinema,
                          [key]: e.target.checked,
                        })
                      }
                    />
                    {
                      (
                        {
                          logo: 'Logo',
                          ticker: 'Texto desplazante',
                          player: 'Reproductor',
                          socials: 'Redes sociales',
                          notes: 'Notas flotantes',
                        } as Record<string, string>
                      )[key]
                    }
                  </label>
                ))}
              </>
            )}
            {tab === 'Efectos y funciones' && (
              <>
                {Object.entries(effectGroups).map(([group, items]) => (
                  <div key={group}>
                    <h4>{group}</h4>
                    <div className="switch-grid">
                      {Object.entries(items).map(([key, label]) => (
                        <label className="toggle" key={key}>
                          <input
                            type="checkbox"
                            checked={draft.effects[key] || false}
                            onChange={(e) =>
                              set('effects', {
                                ...draft.effects,
                                [key]: e.target.checked,
                              })
                            }
                          />
                          {label}
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
                {(['flags'] as const).map((group) => (
                  <div key={group}>
                    <h4>Funciones</h4>
                    <div className="switch-grid">
                      {Object.entries(draft[group]).map(([key, v]) => (
                        <label className="toggle" key={key}>
                          <input
                            type="checkbox"
                            checked={v}
                            onChange={(e) =>
                              set(group, {
                                ...draft[group],
                                [key]: e.target.checked,
                              })
                            }
                          />
                          {labels[key] || key}
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
        <div className="admin-bottom">
          {error && (
            <p role="alert" className="form-error">
              {error}
            </p>
          )}
          <span>
            {dirty ? 'Cambios sin publicar' : 'Todos los cambios guardados'}
          </span>
          <div>
            <button
              className="button secondary small"
              disabled={busy}
              onClick={() => {
                setDraft(structuredClone(station))
                setDirty(false)
                setError('')
                onClose()
              }}
            >
              Descartar / Cerrar
            </button>
            <button
              className="button primary small"
              disabled={busy || !dirty}
              onClick={save}
            >
              <Save size={16} />
              {busy ? 'Guardando…' : 'Guardar cambios'}
            </button>
            <button
              className="icon-button"
              title="Cerrar sesión"
              aria-label="Cerrar sesión"
              onClick={async () => {
                await fetch('/api/auth', { method: 'DELETE' })
                onClose()
                toast.info('Sesión cerrada')
              }}
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
