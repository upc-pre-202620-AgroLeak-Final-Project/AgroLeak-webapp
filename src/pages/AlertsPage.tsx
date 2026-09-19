import {
  AlertOctagon,
  Bell,
  Check,
  CheckCircle2,
  Clock3,
  Filter,
  RadioTower,
  RefreshCw,
  ShieldAlert,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
import { Modal } from '../components/Modal'
import { Badge, EmptyState, ErrorBanner, LoadingBlock, PageHeader } from '../components/ui'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import { DEMO_ALERTS } from '../data/demo'
import { apiRequest, errorMessage } from '../lib/api'
import { formatDate } from '../lib/format'
import type { Alert, AlertSeverity, AlertStatus } from '../types/api'

type FilterStatus = 'ALL' | AlertStatus

const statusLabels: Record<AlertStatus, string> = {
  OPEN: 'Abierta',
  ACKNOWLEDGED: 'En revisión',
  RESOLVED: 'Resuelta',
}

const severityLabels: Record<AlertSeverity, string> = {
  CRITICAL: 'Crítica',
  WARNING: 'Advertencia',
  INFO: 'Informativa',
}

function severityTone(severity: AlertSeverity) {
  return severity === 'CRITICAL' ? 'red' as const : severity === 'WARNING' ? 'amber' as const : 'blue' as const
}

function statusTone(status: AlertStatus) {
  return status === 'RESOLVED' ? 'green' as const : status === 'ACKNOWLEDGED' ? 'blue' as const : 'red' as const
}

function AlertIcon({ type }: { type: Alert['type'] }) {
  if (type === 'DEVICE_OFFLINE') return <RadioTower size={21} />
  if (type === 'SAFETY_LOCKOUT') return <ShieldAlert size={21} />
  return <AlertOctagon size={21} />
}

export function AlertsPage() {
  const { token, isDemo } = useAuth()
  const { showToast } = useToast()
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [filter, setFilter] = useState<FilterStatus>('ALL')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [resolving, setResolving] = useState<Alert | null>(null)
  const [resolutionNote, setResolutionNote] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const result = isDemo
        ? DEMO_ALERTS
        : await apiRequest<Alert[]>('/alerts', { token })
      setAlerts(result)
    } catch (requestError) {
      setError(errorMessage(requestError))
    } finally {
      setLoading(false)
    }
  }, [isDemo, token])

  useEffect(() => {
    void load()
  }, [load])

  const counters = useMemo(() => {
    return {
      open: alerts.filter((alert) => alert.status === 'OPEN').length,
      acknowledged: alerts.filter((alert) => alert.status === 'ACKNOWLEDGED').length,
      resolved: alerts.filter((alert) => alert.status === 'RESOLVED').length,
    }
  }, [alerts])

  const visibleAlerts = useMemo(
    () => alerts.filter((alert) => filter === 'ALL' || alert.status === filter),
    [alerts, filter],
  )

  const acknowledge = async (alert: Alert) => {
    try {
      const updated = isDemo
        ? { ...alert, status: 'ACKNOWLEDGED' as const, acknowledgedBy: 'María Torres', acknowledgedAt: new Date().toISOString() }
        : await apiRequest<Alert>(`/alerts/${alert.id}/acknowledge`, { method: 'PATCH', token })
      setAlerts((current) => current.map((item) => (item.id === alert.id ? updated : item)))
      showToast('Alerta marcada como en revisión.')
    } catch (requestError) {
      showToast(errorMessage(requestError), 'warning')
    }
  }

  const openResolve = (alert: Alert) => {
    setResolving(alert)
    setResolutionNote('')
  }

  const resolve = async (event: FormEvent) => {
    event.preventDefault()
    if (!resolving) return
    setSubmitting(true)
    try {
      const updated = isDemo
        ? {
            ...resolving,
            status: 'RESOLVED' as const,
            resolvedBy: 'María Torres',
            resolvedAt: new Date().toISOString(),
            resolutionNote: resolutionNote.trim(),
          }
        : await apiRequest<Alert>(`/alerts/${resolving.id}/resolve`, {
            method: 'PATCH',
            token,
            body: { resolutionNote: resolutionNote.trim() },
          })
      setAlerts((current) => current.map((item) => (item.id === resolving.id ? updated : item)))
      setResolving(null)
      showToast('Alerta resuelta y nota guardada.')
    } catch (requestError) {
      showToast(errorMessage(requestError), 'warning')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="SEGUIMIENTO"
        title="Centro de alertas"
        description="Prioriza eventos, documenta la revisión y conserva un historial claro de cada incidente."
        action={<button className="button button--outline" type="button" onClick={() => void load()}><RefreshCw size={17} /> Actualizar</button>}
      />

      <div className="alert-summary-grid">
        <article className="alert-summary-card alert-summary-card--red"><span><Bell size={19} /></span><div><strong>{counters.open}</strong><p>Abiertas</p></div><small>Requieren atención</small></article>
        <article className="alert-summary-card alert-summary-card--blue"><span><Clock3 size={19} /></span><div><strong>{counters.acknowledged}</strong><p>En revisión</p></div><small>Seguimiento iniciado</small></article>
        <article className="alert-summary-card alert-summary-card--green"><span><CheckCircle2 size={19} /></span><div><strong>{counters.resolved}</strong><p>Resueltas</p></div><small>Con evidencia registrada</small></article>
      </div>

      <div className="filter-bar">
        <div className="filter-bar__label"><Filter size={17} /> Filtrar por estado</div>
        <div className="filter-tabs">
          {([
            ['ALL', 'Todas'],
            ['OPEN', 'Abiertas'],
            ['ACKNOWLEDGED', 'En revisión'],
            ['RESOLVED', 'Resueltas'],
          ] as Array<[FilterStatus, string]>).map(([value, label]) => (
            <button key={value} type="button" className={filter === value ? 'active' : ''} onClick={() => setFilter(value)}>{label}</button>
          ))}
        </div>
      </div>

      {error && <ErrorBanner message={error} retry={() => void load()} />}
      {loading ? <LoadingBlock /> : visibleAlerts.length ? (
        <div className="alerts-list">
          {visibleAlerts.map((alert) => (
            <article className={`alert-card alert-card--${severityTone(alert.severity)}`} key={alert.id}>
              <div className={`alert-card__icon alert-card__icon--${severityTone(alert.severity)}`}><AlertIcon type={alert.type} /></div>
              <div className="alert-card__body">
                <div className="alert-card__meta">
                  <Badge tone={severityTone(alert.severity)}>{severityLabels[alert.severity]}</Badge>
                  <Badge tone={statusTone(alert.status)} dot>{statusLabels[alert.status]}</Badge>
                  <span>{formatDate(alert.createdAt)}</span>
                </div>
                <h2>{alert.title}</h2>
                <p>{alert.message}</p>
                <div className="alert-card__segment"><DropletsIcon /> {alert.segmentName}</div>
                {alert.resolutionNote && (
                  <div className="resolution-note"><CheckCircle2 size={17} /><div><strong>Resolución registrada</strong><span>{alert.resolutionNote}</span></div></div>
                )}
              </div>
              {alert.status !== 'RESOLVED' && (
                <div className="alert-card__actions">
                  {alert.status === 'OPEN' && <button className="button button--outline button--small" type="button" onClick={() => void acknowledge(alert)}><Check size={16} /> Tomar alerta</button>}
                  <button className="button button--primary button--small" type="button" onClick={() => openResolve(alert)}>Resolver</button>
                </div>
              )}
            </article>
          ))}
        </div>
      ) : (
        <EmptyState title="No hay alertas en esta vista" description="Prueba con otro filtro o espera nuevos eventos del sistema." />
      )}

      <Modal
        open={Boolean(resolving)}
        onClose={() => !submitting && setResolving(null)}
        title="Resolver alerta"
        description="Describe qué se inspeccionó y cuál fue la acción correctiva."
      >
        <form className="modal-form" onSubmit={resolve}>
          <div className="action-notice">
            <AlertOctagon size={22} />
            <div><strong>{resolving?.title}</strong><span>{resolving?.segmentName}</span></div>
          </div>
          <label className="field">
            <span>Nota de resolución <b>*</b></span>
            <textarea
              value={resolutionNote}
              onChange={(event) => setResolutionNote(event.target.value)}
              placeholder="Ejemplo: se inspeccionó el tramo, se ajustó la unión y se verificó el caudal."
              maxLength={600}
              required
              rows={5}
            />
            <small>{resolutionNote.length}/600 caracteres</small>
          </label>
          <div className="modal-form__footer">
            <button className="button button--ghost" type="button" onClick={() => setResolving(null)}>Cancelar</button>
            <button className="button button--primary" type="submit" disabled={submitting}>{submitting ? 'Guardando…' : 'Marcar como resuelta'}</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

function DropletsIcon() {
  return <span className="tiny-droplet" aria-hidden="true" />
}
