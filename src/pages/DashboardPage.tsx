import {
  Activity,
  ArrowRight,
  BellRing,
  Bot,
  Building2,
  CheckCircle2,
  Droplets,
  Leaf,
  MapPinned,
  RadioTower,
  ShieldCheck,
} from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FlowChart } from '../components/FlowChart'
import { Badge, EmptyState, ErrorBanner, LoadingBlock, PageHeader, SectionCard, StatCard } from '../components/ui'
import { useAuth } from '../contexts/AuthContext'
import { DEMO_DASHBOARD, DEMO_SEGMENTS, DEMO_TELEMETRY, DEMO_VISION } from '../data/demo'
import { apiRequest, errorMessage } from '../lib/api'
import { formatDate, percent, timeAgo } from '../lib/format'
import type { DashboardSummary, FlowTelemetry, IrrigationSegment } from '../types/api'

function alertTone(severity: string) {
  if (severity === 'CRITICAL') return 'red' as const
  if (severity === 'WARNING') return 'amber' as const
  return 'blue' as const
}

function valveTone(state: string) {
  if (state === 'OPEN') return 'green' as const
  if (state === 'CLOSED' || state === 'LOCKED') return 'red' as const
  return 'amber' as const
}

function valveLabel(state: string) {
  return {
    OPEN: 'Válvula abierta',
    CLOSED: 'Válvula cerrada',
    CLOSING: 'Cerrando',
    OPENING: 'Abriendo',
    UNKNOWN: 'Sin confirmar',
    LOCKED: 'Bloqueada',
  }[state] ?? state
}

export function DashboardPage() {
  const { user, token, isDemo } = useAuth()
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [segments, setSegments] = useState<IrrigationSegment[]>([])
  const [telemetry, setTelemetry] = useState<FlowTelemetry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    if (isDemo) {
      setSummary(DEMO_DASHBOARD)
      setSegments(DEMO_SEGMENTS)
      setTelemetry(DEMO_TELEMETRY)
      setLoading(false)
      return
    }
    try {
      const [summaryResponse, segmentResponse] = await Promise.all([
        apiRequest<DashboardSummary>('/dashboard/summary', { token }),
        apiRequest<IrrigationSegment[]>('/irrigation-segments', { token }),
      ])
      setSummary(summaryResponse)
      setSegments(segmentResponse)
      if (segmentResponse[0]) {
        const readings = await apiRequest<FlowTelemetry[]>(`/irrigation-segments/${segmentResponse[0].id}/telemetry`, { token })
        setTelemetry(readings)
      } else {
        setTelemetry([])
      }
    } catch (requestError) {
      setError(errorMessage(requestError))
    } finally {
      setLoading(false)
    }
  }, [isDemo, token])

  useEffect(() => {
    void load()
  }, [load])

  const firstName = user?.fullName.split(' ')[0] ?? 'Productor'
  const latestReading = [...telemetry].sort(
    (a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime(),
  )[0]

  return (
    <div className="page-stack dashboard-page">
      <PageHeader
        eyebrow={user?.role === 'ADMIN' ? 'VISTA GLOBAL' : 'OPERACIÓN DE HOY'}
        title={`Buenos días, ${firstName}`}
        description="Aquí tienes una lectura rápida del estado de tu operación agrícola."
        action={
          <div className="header-date">
            <span>Actualizado</span>
            <strong>{formatDate(new Date().toISOString(), true)}</strong>
          </div>
        }
      />

      <div className="system-banner">
        <div className="system-banner__icon"><ShieldCheck size={23} /></div>
        <div>
          <strong>Protección activa en tus cultivos</strong>
          <span>{segments.filter((segment) => segment.automaticClosureEnabled).length} tramos cuentan con respuesta preventiva automática.</span>
        </div>
        <Badge tone="green" dot>Sistema operativo</Badge>
      </div>

      {error && <ErrorBanner message={error} retry={() => void load()} />}
      {loading ? (
        <LoadingBlock label="Consultando sensores y alertas…" />
      ) : summary ? (
        <>
          <div className="stats-grid">
            <StatCard label="Fincas" value={summary.farmCount} hint={`${summary.plotCount} parcelas registradas`} icon={Building2} tone="green" />
            <StatCard label="Tramos de riego" value={summary.irrigationSegmentCount} hint={`${segments.filter((item) => item.valveState === 'OPEN').length} operando ahora`} icon={Droplets} tone="blue" />
            <StatCard label="Dispositivos online" value={summary.onlineDeviceCount} hint="Reportando al gateway" icon={RadioTower} tone="purple" />
            <StatCard label="Alertas abiertas" value={summary.openAlertCount} hint={summary.openAlertCount ? 'Requieren tu atención' : 'Todo bajo control'} icon={BellRing} tone={summary.openAlertCount ? 'red' : 'green'} />
          </div>

          <div className="dashboard-grid dashboard-grid--main">
            <SectionCard
              title="Comportamiento del caudal"
              subtitle={segments[0] ? `${segments[0].name} · ${segments[0].plotName}` : 'Sin tramo seleccionado'}
              action={<Link className="text-link" to="/app/riego">Ver detalle <ArrowRight size={16} /></Link>}
              className="dashboard-flow-card"
            >
              <div className="flow-summary-row">
                <div>
                  <span>Entrada actual</span>
                  <strong>{latestReading ? Number(latestReading.inletFlowLitersPerMinute).toFixed(1) : '—'} <small>L/min</small></strong>
                </div>
                <div>
                  <span>Diferencia estimada</span>
                  <strong>{percent(latestReading?.lossPercentage)}</strong>
                </div>
                <Badge tone={latestReading?.evaluationStatus === 'NORMAL' ? 'green' : 'amber'} dot>
                  {latestReading?.evaluationStatus === 'NORMAL' ? 'Flujo normal' : latestReading ? 'Revisar lectura' : 'Esperando datos'}
                </Badge>
              </div>
              <FlowChart data={telemetry} />
            </SectionCard>

            <SectionCard
              title="Alertas recientes"
              subtitle="Prioridades que necesitan seguimiento"
              action={<Link className="text-link" to="/app/alertas">Ver todas <ArrowRight size={16} /></Link>}
              className="dashboard-alerts-card"
            >
              {summary.latestAlerts.length ? (
                <div className="compact-alert-list">
                  {summary.latestAlerts.map((alert) => (
                    <article className="compact-alert" key={alert.id}>
                      <div className={`compact-alert__icon compact-alert__icon--${alertTone(alert.severity)}`}>
                        <BellRing size={18} />
                      </div>
                      <div>
                        <div className="compact-alert__meta">
                          <Badge tone={alertTone(alert.severity)}>{alert.severity === 'CRITICAL' ? 'Crítica' : alert.severity === 'WARNING' ? 'Advertencia' : 'Informativa'}</Badge>
                          <span>{timeAgo(alert.createdAt)}</span>
                        </div>
                        <strong>{alert.title}</strong>
                        <p>{alert.segmentName}</p>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <EmptyState title="Sin alertas recientes" description="No hay eventos que necesiten atención en este momento." />
              )}
            </SectionCard>
          </div>

          <SectionCard
            title="Estado de los tramos"
            subtitle="Una vista simple de la red de riego"
            action={<Link className="text-link" to="/app/riego">Gestionar riego <ArrowRight size={16} /></Link>}
          >
            {segments.length ? (
              <div className="segment-overview-grid">
                {segments.slice(0, 4).map((segment) => (
                  <article className="segment-overview" key={segment.id}>
                    <div className="segment-overview__top">
                      <div className="segment-overview__icon"><Droplets size={20} /></div>
                      <Badge tone={valveTone(segment.valveState)} dot>{valveLabel(segment.valveState)}</Badge>
                    </div>
                    <h3>{segment.name}</h3>
                    <p><MapPinned size={15} /> {segment.plotName}</p>
                    <div className="segment-overview__details">
                      <span>Umbral <strong>{percent(segment.lossThresholdPercent, 0)}</strong></span>
                      <span>Respuesta <strong>{segment.automaticClosureEnabled ? 'Automática' : 'Manual'}</strong></span>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <EmptyState title="Aún no hay tramos" description="Registra sensores y una válvula para configurar el primer tramo." />
            )}
          </SectionCard>

          <div className="dashboard-grid dashboard-grid--bottom">
            <SectionCard className="vision-preview-card">
              <div className="vision-preview">
                <div className="vision-preview__copy">
                  <Badge tone="purple"><Bot size={14} /> Visión artificial</Badge>
                  <h2>Protección que también observa tus plantas.</h2>
                  <p>La cámara identifica posibles plagas y prepara una respuesta localizada para evitar aplicaciones innecesarias.</p>
                  <Link to="/app/vision" className="button button--secondary">Explorar monitoreo IA <ArrowRight size={17} /></Link>
                </div>
                <div className="vision-preview__detection">
                  <div className="detection-frame">
                    <span className="detection-frame__corner detection-frame__corner--tl" />
                    <span className="detection-frame__corner detection-frame__corner--tr" />
                    <span className="detection-frame__corner detection-frame__corner--bl" />
                    <span className="detection-frame__corner detection-frame__corner--br" />
                    <Leaf size={52} />
                    <div><strong>{DEMO_VISION[0].pest}</strong><span>{DEMO_VISION[0].confidence}% confianza</span></div>
                  </div>
                </div>
              </div>
            </SectionCard>

            <SectionCard title="Actividad del sistema" subtitle="Últimas confirmaciones del Edge">
              <div className="activity-list">
                <div><span className="activity-list__icon"><CheckCircle2 size={17} /></span><p><strong>Lectura recibida</strong><small>Caudal de Línea Norte A · {timeAgo(latestReading?.recordedAt)}</small></p></div>
                <div><span className="activity-list__icon"><Activity size={17} /></span><p><strong>Reglas verificadas</strong><small>Sin anomalías persistentes · hace 2 min</small></p></div>
                <div><span className="activity-list__icon"><RadioTower size={17} /></span><p><strong>Gateway sincronizado</strong><small>EDGE-DEMO-01 · hace 3 min</small></p></div>
              </div>
            </SectionCard>
          </div>
        </>
      ) : null}
    </div>
  )
}
