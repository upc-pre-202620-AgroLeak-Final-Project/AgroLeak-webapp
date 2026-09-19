import {
  Bot,
  Camera,
  Check,
  Crosshair,
  Eye,
  Leaf,
  Radar,
  ShieldCheck,
  Sparkles,
  SprayCan,
  X,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Badge, ErrorBanner, LoadingBlock, PageHeader, SectionCard } from '../components/ui'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import { DEMO_DEVICES, DEMO_PLOTS, DEMO_VISION } from '../data/demo'
import { apiRequest, errorMessage } from '../lib/api'
import { formatDate, timeAgo } from '../lib/format'
import type { Device, Farm, Plot, VisionObservation } from '../types/api'

export function VisionPage() {
  const { token, isDemo } = useAuth()
  const { showToast } = useToast()
  const [devices, setDevices] = useState<Array<Device & { plotName: string }>>([])
  const [observations, setObservations] = useState<VisionObservation[]>(DEMO_VISION)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadDevices = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      if (isDemo) {
        setDevices(DEMO_DEVICES.map((device) => ({
          ...device,
          plotName: DEMO_PLOTS.find((plot) => plot.id === device.plotId)?.name ?? 'Parcela demo',
        })))
      } else {
        const farms = await apiRequest<Farm[]>('/farms', { token })
        const plots = (await Promise.all(farms.map((farm) => apiRequest<Plot[]>(`/farms/${farm.id}/plots`, { token })))).flat()
        const allDevices = (await Promise.all(plots.map(async (plot) => (
          (await apiRequest<Device[]>(`/plots/${plot.id}/devices`, { token })).map((device) => ({ ...device, plotName: plot.name }))
        )))).flat()
        setDevices(allDevices)
      }
    } catch (requestError) {
      setError(errorMessage(requestError))
    } finally {
      setLoading(false)
    }
  }, [isDemo, token])

  useEffect(() => {
    void loadDevices()
  }, [loadDevices])

  const cameras = devices.filter((device) => device.type === 'CAMERA')
  const actuators = devices.filter((device) => device.type === 'LOCALIZED_ACTUATOR')
  const confirmed = useMemo(() => observations.filter((item) => item.status === 'CONFIRMED').length, [observations])

  const updateObservation = (id: string, status: VisionObservation['status'], action?: VisionObservation['action']) => {
    setObservations((current) => current.map((item) => item.id === id ? { ...item, status, action: action ?? item.action } : item))
    showToast(status === 'CONFIRMED' ? 'Observación confirmada en el prototipo.' : 'Observación descartada.')
  }

  const authorize = (id: string) => {
    setObservations((current) => current.map((item) => item.id === id ? { ...item, status: 'CONFIRMED', action: 'LOCALIZED_RESPONSE' } : item))
    showToast('Respuesta localizada simulada. No se envió una acción física.', 'info')
  }

  return (
    <div className="page-stack vision-page">
      <PageHeader
        eyebrow="PROTECCIÓN DEL CULTIVO"
        title="Visión artificial"
        description="Una cámara observa puntos críticos, reconoce posibles plagas y facilita una respuesta localizada."
        action={<Badge tone="purple"><Sparkles size={14} /> Prototipo académico</Badge>}
      />

      <div className="prototype-banner">
        <Bot size={21} />
        <div><strong>Módulo visual en fase de integración</strong><span>Las cámaras ya forman parte del inventario. Las detecciones mostradas abajo son datos simulados para validar la experiencia del frontend.</span></div>
      </div>

      {error && <ErrorBanner message={error} retry={() => void loadDevices()} />}

      <section className="vision-hero">
        <div className="vision-hero__copy">
          <Badge tone="green" dot>Monitoreo inteligente</Badge>
          <h2>Detectar antes permite actuar mejor.</h2>
          <p>AgroLeak combina evidencia visual, nivel de confianza y validación humana antes de preparar una respuesta localizada.</p>
          <div className="vision-hero__metrics">
            <div><strong>{cameras.length}</strong><span>Cámaras registradas</span></div>
            <div><strong>{confirmed}</strong><span>Detecciones confirmadas</span></div>
            <div><strong>{actuators.length}</strong><span>Actuadores localizados</span></div>
          </div>
        </div>
        <div className="vision-hero__visual">
          <div className="ai-scan">
            <span className="ai-scan__line" />
            <Leaf size={80} />
            <div className="ai-box ai-box--one"><span>Posible plaga</span><strong>94%</strong></div>
            <div className="ai-box ai-box--two"><span>Hoja saludable</span><strong>88%</strong></div>
            <span className="ai-scan__camera"><Camera size={18} /> CAM-AI-001</span>
          </div>
        </div>
      </section>

      <div className="vision-flow">
        <article><span><Camera size={21} /></span><div><small>PASO 1</small><strong>Captura</strong><p>La cámara registra el punto delimitado.</p></div></article>
        <i />
        <article><span><Radar size={21} /></span><div><small>PASO 2</small><strong>Clasificación IA</strong><p>El modelo estima clase y confianza.</p></div></article>
        <i />
        <article><span><ShieldCheck size={21} /></span><div><small>PASO 3</small><strong>Validación</strong><p>El productor confirma la evidencia.</p></div></article>
        <i />
        <article><span><Crosshair size={21} /></span><div><small>PASO 4</small><strong>Respuesta localizada</strong><p>Se prepara una acción segura y trazable.</p></div></article>
      </div>

      {loading ? <LoadingBlock label="Consultando cámaras y actuadores…" /> : (
        <div className="vision-grid">
          <SectionCard title="Puntos de observación" subtitle="Equipos de visión registrados en tus parcelas">
            <div className="camera-list">
              {cameras.length ? cameras.map((camera) => (
                <article key={camera.id}>
                  <span className="camera-list__preview"><Camera size={25} /></span>
                  <div><strong>{camera.name}</strong><small>{camera.deviceCode} · {camera.plotName}</small></div>
                  <Badge tone={camera.status === 'ONLINE' ? 'green' : 'red'} dot>{camera.status === 'ONLINE' ? 'En línea' : 'Sin conexión'}</Badge>
                </article>
              )) : <div className="inline-empty"><Camera size={22} /><span>No hay cámaras registradas.</span></div>}
            </div>
          </SectionCard>

          <SectionCard title="Criterios de seguridad" subtitle="La acción nunca depende de una sola imagen">
            <div className="safety-checklist">
              <div><Check size={16} /><span>Confianza mínima configurable</span></div>
              <div><Check size={16} /><span>Validación humana antes de actuar</span></div>
              <div><Check size={16} /><span>Comando con vencimiento e identificación</span></div>
              <div><Check size={16} /><span>Respuesta localizada, no aplicación general</span></div>
              <div><Check size={16} /><span>Resultado físico registrado por el Edge</span></div>
            </div>
          </SectionCard>
        </div>
      )}

      <SectionCard
        title="Observaciones recientes"
        subtitle="Evidencia simulada para el prototipo visual"
        action={<Badge tone="amber">Datos demo</Badge>}
      >
        <div className="observation-grid">
          {observations.map((observation, index) => (
            <article className="observation-card" key={observation.id}>
              <div className={`observation-card__image observation-card__image--${index + 1}`}>
                <div className="detection-target"><span /><span /><span /><span /></div>
                <Badge tone={observation.accent === 'red' ? 'red' : observation.accent === 'amber' ? 'amber' : 'green'}>{observation.confidence}% confianza</Badge>
                <span className="observation-card__time"><Eye size={14} /> {timeAgo(observation.detectedAt)}</span>
              </div>
              <div className="observation-card__body">
                <div><h3>{observation.pest}</h3><em>{observation.scientificName}</em></div>
                <dl><div><dt>Cámara</dt><dd>{observation.cameraCode}</dd></div><div><dt>Parcela</dt><dd>{observation.plotName}</dd></div><div><dt>Captura</dt><dd>{formatDate(observation.detectedAt)}</dd></div></dl>
                <div className="observation-card__status">
                  <Badge tone={observation.status === 'CONFIRMED' ? 'red' : observation.status === 'DISMISSED' ? 'gray' : 'amber'} dot>
                    {observation.status === 'CONFIRMED' ? 'Confirmada' : observation.status === 'DISMISSED' ? 'Descartada' : 'Pendiente'}
                  </Badge>
                  {observation.action === 'LOCALIZED_RESPONSE' && <Badge tone="purple"><SprayCan size={13} /> Respuesta preparada</Badge>}
                </div>
                {observation.status === 'PENDING' && (
                  <div className="observation-card__actions">
                    <button className="button button--ghost button--small" type="button" onClick={() => updateObservation(observation.id, 'DISMISSED', 'NONE')}><X size={16} /> Descartar</button>
                    <button className="button button--outline button--small" type="button" onClick={() => updateObservation(observation.id, 'CONFIRMED', 'REVIEW')}><Check size={16} /> Confirmar</button>
                  </div>
                )}
                {observation.status === 'CONFIRMED' && observation.action !== 'LOCALIZED_RESPONSE' && (
                  <button className="button button--secondary button--full button--small" type="button" onClick={() => authorize(observation.id)}><Crosshair size={16} /> Simular respuesta localizada</button>
                )}
              </div>
            </article>
          ))}
        </div>
      </SectionCard>
    </div>
  )
}
