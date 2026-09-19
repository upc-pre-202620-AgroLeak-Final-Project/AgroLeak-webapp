import {
  Activity,
  CheckCircle2,
  ChevronRight,
  CircleOff,
  Clock3,
  Droplets,
  Gauge,
  LockKeyhole,
  RefreshCw,
  ShieldAlert,
  UnlockKeyhole,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
import { FlowChart } from '../components/FlowChart'
import { Modal } from '../components/Modal'
import { Badge, EmptyState, ErrorBanner, LoadingBlock, PageHeader, SectionCard } from '../components/ui'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import { DEMO_COMMANDS, DEMO_SEGMENTS, DEMO_TELEMETRY } from '../data/demo'
import { apiRequest, errorMessage } from '../lib/api'
import { formatDate, formatTime, percent } from '../lib/format'
import type { ActuationCommand, FlowTelemetry, IrrigationSegment } from '../types/api'

type ActionKind = 'close' | 'reopen'

const valveCopy = {
  OPEN: { label: 'Abierta', tone: 'green' as const },
  CLOSED: { label: 'Cerrada', tone: 'red' as const },
  CLOSING: { label: 'Cerrando', tone: 'amber' as const },
  OPENING: { label: 'Abriendo', tone: 'amber' as const },
  UNKNOWN: { label: 'Sin confirmar', tone: 'gray' as const },
  LOCKED: { label: 'Bloqueada', tone: 'red' as const },
}

const evaluationLabels: Record<string, string> = {
  NORMAL: 'Normal',
  POTENTIAL_ANOMALY: 'Posible anomalía',
  CONFIRMED_ANOMALY: 'Anomalía confirmada',
  NO_INFLOW: 'Sin flujo de entrada',
  SENSOR_INCONSISTENCY: 'Lectura inconsistente',
}

const commandLabels: Record<string, string> = {
  CLOSE_VALVE: 'Cerrar válvula',
  OPEN_VALVE: 'Abrir válvula',
  LOCALIZED_CONTROL: 'Control localizado',
}

const commandStatusLabels: Record<string, string> = {
  REQUESTED: 'Solicitado',
  ACCEPTED: 'Aceptado',
  EXECUTING: 'Ejecutando',
  SUCCEEDED: 'Completado',
  FAILED: 'Fallido',
  REJECTED: 'Rechazado',
  EXPIRED: 'Expirado',
}

export function IrrigationPage() {
  const { token, isDemo } = useAuth()
  const { showToast } = useToast()
  const [segments, setSegments] = useState<IrrigationSegment[]>([])
  const [selectedId, setSelectedId] = useState<string>('')
  const [telemetry, setTelemetry] = useState<FlowTelemetry[]>([])
  const [commands, setCommands] = useState<ActuationCommand[]>([])
  const [loading, setLoading] = useState(true)
  const [detailLoading, setDetailLoading] = useState(false)
  const [error, setError] = useState('')
  const [action, setAction] = useState<ActionKind | null>(null)
  const [reason, setReason] = useState('')
  const [inspectionNote, setInspectionNote] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const selected = useMemo(
    () => segments.find((segment) => segment.id === selectedId) ?? null,
    [segments, selectedId],
  )

  const loadSegments = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const result = isDemo ? DEMO_SEGMENTS : await apiRequest<IrrigationSegment[]>('/irrigation-segments', { token })
      setSegments(result)
      setSelectedId((current) => (result.some((segment) => segment.id === current) ? current : result[0]?.id ?? ''))
    } catch (requestError) {
      setError(errorMessage(requestError))
    } finally {
      setLoading(false)
    }
  }, [isDemo, token])

  const loadDetails = useCallback(async () => {
    if (!selectedId) {
      setTelemetry([])
      setCommands([])
      return
    }
    setDetailLoading(true)
    try {
      if (isDemo) {
        setTelemetry(selectedId === DEMO_SEGMENTS[0].id ? DEMO_TELEMETRY : DEMO_TELEMETRY.map((item, index) => ({
          ...item,
          id: `${item.id}-b`,
          segmentId: selectedId,
          inletFlowLitersPerMinute: Number(item.inletFlowLitersPerMinute) + 2,
          outletFlowLitersPerMinute: index > 6 ? Number(item.outletFlowLitersPerMinute) - 3.5 : Number(item.outletFlowLitersPerMinute) + 1,
          lossPercentage: index > 6 ? 16.8 : item.lossPercentage,
          evaluationStatus: index > 6 ? 'CONFIRMED_ANOMALY' : 'NORMAL',
        })))
        setCommands(DEMO_COMMANDS.filter((command) => command.segmentId === selectedId))
      } else {
        const [readingResponse, commandResponse] = await Promise.all([
          apiRequest<FlowTelemetry[]>(`/irrigation-segments/${selectedId}/telemetry`, { token }),
          apiRequest<ActuationCommand[]>(`/irrigation-segments/${selectedId}/commands`, { token }),
        ])
        setTelemetry(readingResponse)
        setCommands(commandResponse)
      }
    } catch (requestError) {
      setError(errorMessage(requestError))
    } finally {
      setDetailLoading(false)
    }
  }, [isDemo, selectedId, token])

  useEffect(() => {
    void loadSegments()
  }, [loadSegments])

  useEffect(() => {
    void loadDetails()
  }, [loadDetails])

  const openAction = (kind: ActionKind) => {
    setAction(kind)
    setReason(kind === 'close' ? 'Cierre preventivo solicitado desde el panel web.' : 'Reapertura posterior a inspección del tramo.')
    setInspectionNote('')
  }

  const submitAction = async (event: FormEvent) => {
    event.preventDefault()
    if (!selected || !action) return
    if (action === 'reopen' && !inspectionNote.trim()) {
      showToast('Registra el resultado de la inspección antes de reabrir.', 'warning')
      return
    }
    setSubmitting(true)
    try {
      let created: ActuationCommand
      if (isDemo) {
        created = {
          id: `demo-command-${Date.now()}`,
          commandId: crypto.randomUUID(),
          type: action === 'close' ? 'CLOSE_VALVE' : 'OPEN_VALVE',
          status: 'REQUESTED',
          segmentId: selected.id,
          segmentName: selected.name,
          valveDeviceCode: selected.shutoffValveCode,
          requestedBy: 'María Torres',
          reason: reason.trim(),
          inspectionNote: inspectionNote.trim() || null,
          requestedAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 120_000).toISOString(),
          executedAt: null,
          resultMessage: null,
        }
      } else {
        created = await apiRequest<ActuationCommand>(`/irrigation-segments/${selected.id}/commands/${action}`, {
          method: 'POST',
          token,
          body: { reason: reason.trim(), inspectionNote: inspectionNote.trim() || null },
        })
      }
      setCommands((current) => [created, ...current])
      setSegments((current) => current.map((segment) => (
        segment.id === selected.id
          ? { ...segment, valveState: action === 'close' ? 'CLOSING' : 'OPENING' }
          : segment
      )))
      setAction(null)
      showToast(action === 'close' ? 'Comando de cierre enviado al Edge.' : 'Comando de reapertura enviado al Edge.')
    } catch (requestError) {
      showToast(errorMessage(requestError), 'warning')
    } finally {
      setSubmitting(false)
    }
  }

  const readings = [...telemetry].sort((a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime())
  const latest = readings[0]
  const valve = selected ? valveCopy[selected.valveState] : valveCopy.UNKNOWN

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="RED HIDRÁULICA"
        title="Control de riego"
        description="Compara el caudal de entrada y salida, detecta diferencias y actúa con trazabilidad."
        action={
          <button className="button button--outline" type="button" onClick={() => void loadSegments()} disabled={loading}>
            <RefreshCw size={17} className={loading ? 'spin' : ''} /> Actualizar
          </button>
        }
      />

      {error && <ErrorBanner message={error} retry={() => void loadSegments()} />}
      {loading ? <LoadingBlock /> : segments.length === 0 ? (
        <EmptyState title="No hay tramos configurados" description="Primero registra dos sensores de caudal y una electroválvula desde Swagger." />
      ) : (
        <div className="irrigation-layout">
          <aside className="segment-selector">
            <div className="segment-selector__header">
              <span>TRAMOS REGISTRADOS</span>
              <strong>{segments.length}</strong>
            </div>
            {segments.map((segment) => {
              const state = valveCopy[segment.valveState]
              return (
                <button
                  key={segment.id}
                  type="button"
                  className={`segment-selector__item${selectedId === segment.id ? ' segment-selector__item--active' : ''}`}
                  onClick={() => setSelectedId(segment.id)}
                >
                  <span className="segment-selector__icon"><Droplets size={19} /></span>
                  <span>
                    <strong>{segment.name}</strong>
                    <small>{segment.plotName}</small>
                    <em className={`text-${state.tone}`}>● {state.label}</em>
                  </span>
                  <ChevronRight size={18} />
                </button>
              )
            })}
          </aside>

          {selected && (
            <div className="irrigation-detail">
              <SectionCard className="segment-hero-card">
                <div className="segment-hero">
                  <div>
                    <div className="segment-hero__badges">
                      <Badge tone={valve.tone} dot>Válvula {valve.label.toLowerCase()}</Badge>
                      <Badge tone={selected.automaticClosureEnabled ? 'blue' : 'gray'}>
                        {selected.automaticClosureEnabled ? 'Protección automática' : 'Respuesta manual'}
                      </Badge>
                    </div>
                    <h2>{selected.name}</h2>
                    <p>{selected.plotName} · Válvula {selected.shutoffValveCode}</p>
                  </div>
                  <div className="segment-hero__actions">
                    <button
                      className="button button--danger-soft"
                      type="button"
                      disabled={selected.valveState !== 'OPEN'}
                      onClick={() => openAction('close')}
                    >
                      <LockKeyhole size={17} /> Cerrar válvula
                    </button>
                    <button
                      className="button button--secondary"
                      type="button"
                      disabled={selected.valveState !== 'CLOSED'}
                      onClick={() => openAction('reopen')}
                    >
                      <UnlockKeyhole size={17} /> Reabrir
                    </button>
                  </div>
                </div>
                <div className="segment-metrics">
                  <div><span><Gauge size={17} /> Caudal de entrada</span><strong>{latest ? Number(latest.inletFlowLitersPerMinute).toFixed(1) : '—'} <small>L/min</small></strong></div>
                  <div><span><Droplets size={17} /> Caudal de salida</span><strong>{latest ? Number(latest.outletFlowLitersPerMinute).toFixed(1) : '—'} <small>L/min</small></strong></div>
                  <div><span><Activity size={17} /> Diferencia</span><strong className={Number(latest?.lossPercentage ?? 0) >= Number(selected.lossThresholdPercent) ? 'metric-danger' : ''}>{percent(latest?.lossPercentage)}</strong></div>
                  <div><span><ShieldAlert size={17} /> Umbral configurado</span><strong>{percent(selected.lossThresholdPercent, 0)}</strong></div>
                </div>
              </SectionCard>

              {detailLoading ? <LoadingBlock label="Consultando historial del tramo…" /> : (
                <>
                  <SectionCard
                    title="Caudal de las últimas lecturas"
                    subtitle="Comparación entre sensor de entrada y sensor de salida"
                    action={<Badge tone={latest?.evaluationStatus === 'NORMAL' ? 'green' : 'amber'} dot>{latest ? evaluationLabels[latest.evaluationStatus] : 'Sin lecturas'}</Badge>}
                  >
                    <FlowChart data={telemetry} />
                  </SectionCard>

                  <div className="irrigation-subgrid">
                    <SectionCard title="Lecturas recientes" subtitle="Últimos registros recibidos por el Edge">
                      {readings.length ? (
                        <div className="readings-table table-scroll">
                          <table>
                            <thead><tr><th>Hora</th><th>Entrada</th><th>Salida</th><th>Diferencia</th><th>Estado</th></tr></thead>
                            <tbody>
                              {readings.slice(0, 8).map((reading) => (
                                <tr key={reading.id}>
                                  <td>{formatTime(reading.recordedAt)}</td>
                                  <td>{Number(reading.inletFlowLitersPerMinute).toFixed(1)} L/min</td>
                                  <td>{Number(reading.outletFlowLitersPerMinute).toFixed(1)} L/min</td>
                                  <td>{percent(reading.lossPercentage)}</td>
                                  <td><Badge tone={reading.evaluationStatus === 'NORMAL' ? 'green' : 'red'} dot>{evaluationLabels[reading.evaluationStatus]}</Badge></td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : <EmptyState title="Esperando telemetría" description="Las lecturas aparecerán cuando el Edge envíe el primer dato." />}
                    </SectionCard>

                    <SectionCard title="Historial de actuación" subtitle="Cada comando queda registrado">
                      {commands.length ? (
                        <div className="command-list">
                          {commands.slice(0, 6).map((command) => (
                            <article key={command.id}>
                              <span className={`command-list__icon command-list__icon--${command.status === 'SUCCEEDED' ? 'success' : 'pending'}`}>
                                {command.status === 'SUCCEEDED' ? <CheckCircle2 size={18} /> : <Clock3 size={18} />}
                              </span>
                              <div>
                                <strong>{commandLabels[command.type]}</strong>
                                <p>{command.reason}</p>
                                <small>{formatDate(command.requestedAt)} · {command.requestedBy}</small>
                              </div>
                              <Badge tone={command.status === 'SUCCEEDED' ? 'green' : command.status === 'FAILED' ? 'red' : 'amber'}>{commandStatusLabels[command.status]}</Badge>
                            </article>
                          ))}
                        </div>
                      ) : <EmptyState title="Sin comandos recientes" description="No se han solicitado acciones para este tramo." />}
                    </SectionCard>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}

      <Modal
        open={Boolean(action)}
        onClose={() => !submitting && setAction(null)}
        title={action === 'close' ? 'Solicitar cierre preventivo' : 'Solicitar reapertura'}
        description={action === 'close'
          ? 'El comando será enviado al Edge y vencerá si no se ejecuta en dos minutos.'
          : 'Por seguridad, registra la inspección realizada antes de abrir la válvula.'}
      >
        <form className="modal-form" onSubmit={submitAction}>
          <div className={`action-notice${action === 'close' ? ' action-notice--danger' : ''}`}>
            {action === 'close' ? <CircleOff size={22} /> : <UnlockKeyhole size={22} />}
            <div><strong>{selected?.name}</strong><span>{selected?.plotName} · {selected?.shutoffValveCode}</span></div>
          </div>
          <label className="field">
            <span>Motivo de la acción</span>
            <textarea value={reason} onChange={(event) => setReason(event.target.value)} maxLength={500} required rows={3} />
          </label>
          {action === 'reopen' && (
            <label className="field">
              <span>Resultado de la inspección <b>*</b></span>
              <textarea
                value={inspectionNote}
                onChange={(event) => setInspectionNote(event.target.value)}
                placeholder="Ejemplo: se revisó la tubería, se ajustó la unión y no se observan fugas."
                maxLength={600}
                required
                rows={4}
              />
            </label>
          )}
          <div className="modal-form__footer">
            <button className="button button--ghost" type="button" onClick={() => setAction(null)} disabled={submitting}>Cancelar</button>
            <button className={action === 'close' ? 'button button--danger' : 'button button--primary'} type="submit" disabled={submitting}>
              {submitting ? 'Enviando…' : action === 'close' ? 'Confirmar cierre' : 'Confirmar reapertura'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
