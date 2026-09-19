import {
  Building2,
  Camera,
  ChevronDown,
  Cpu,
  Droplets,
  Leaf,
  MapPin,
  Plus,
  RadioTower,
  Sprout,
  UserRound,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
import { Modal } from '../components/Modal'
import { Badge, EmptyState, ErrorBanner, LoadingBlock, PageHeader } from '../components/ui'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import { DEMO_DEVICES, DEMO_FARMS, DEMO_PLOTS } from '../data/demo'
import { apiRequest, errorMessage } from '../lib/api'
import type { Device, Farm, FarmBundle, Plot } from '../types/api'

function deviceIcon(type: Device['type']) {
  if (type === 'CAMERA') return Camera
  if (type.includes('FLOW') || type === 'SHUTOFF_VALVE') return Droplets
  if (type === 'EDGE_GATEWAY') return RadioTower
  return Cpu
}

export function FarmsPage() {
  const { token, isDemo, user } = useAuth()
  const { showToast } = useToast()
  const [bundles, setBundles] = useState<FarmBundle[]>([])
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [createFarmOpen, setCreateFarmOpen] = useState(false)
  const [plotFarm, setPlotFarm] = useState<Farm | null>(null)
  const [farmName, setFarmName] = useState('')
  const [farmLocation, setFarmLocation] = useState('')
  const [plotName, setPlotName] = useState('')
  const [cropType, setCropType] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      if (isDemo) {
        const demoBundles = DEMO_FARMS.map((farm) => ({
          farm,
          plots: DEMO_PLOTS.filter((plot) => plot.farmId === farm.id).map((plot) => ({
            ...plot,
            devices: DEMO_DEVICES.filter((device) => device.plotId === plot.id),
          })),
        }))
        setBundles(demoBundles)
        setExpanded(new Set(demoBundles.slice(0, 1).map((bundle) => bundle.farm.id)))
      } else {
        const farms = await apiRequest<Farm[]>('/farms', { token })
        const result = await Promise.all(farms.map(async (farm) => {
          const plots = await apiRequest<Plot[]>(`/farms/${farm.id}/plots`, { token })
          const plotsWithDevices = await Promise.all(plots.map(async (plot) => ({
            ...plot,
            devices: await apiRequest<Device[]>(`/plots/${plot.id}/devices`, { token }),
          })))
          return { farm, plots: plotsWithDevices }
        }))
        setBundles(result)
        setExpanded(new Set(result.slice(0, 1).map((bundle) => bundle.farm.id)))
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

  const totals = useMemo(() => ({
    plots: bundles.reduce((sum, bundle) => sum + bundle.plots.length, 0),
    devices: bundles.reduce((sum, bundle) => sum + bundle.plots.reduce((plotSum, plot) => plotSum + plot.devices.length, 0), 0),
  }), [bundles])

  const toggle = (farmId: string) => {
    setExpanded((current) => {
      const next = new Set(current)
      if (next.has(farmId)) next.delete(farmId)
      else next.add(farmId)
      return next
    })
  }

  const createFarm = async (event: FormEvent) => {
    event.preventDefault()
    setSubmitting(true)
    try {
      const farm = isDemo
        ? {
            id: crypto.randomUUID(),
            name: farmName.trim(),
            location: farmLocation.trim() || null,
            ownerId: user?.id ?? 'demo-producer',
            ownerName: user?.fullName ?? 'Productor',
            createdAt: new Date().toISOString(),
          }
        : await apiRequest<Farm>('/farms', {
            method: 'POST',
            token,
            body: { name: farmName.trim(), location: farmLocation.trim() || null },
          })
      setBundles((current) => [...current, { farm, plots: [] }])
      setExpanded((current) => new Set([...current, farm.id]))
      setCreateFarmOpen(false)
      setFarmName('')
      setFarmLocation('')
      showToast('Finca registrada correctamente.')
    } catch (requestError) {
      showToast(errorMessage(requestError), 'warning')
    } finally {
      setSubmitting(false)
    }
  }

  const createPlot = async (event: FormEvent) => {
    event.preventDefault()
    if (!plotFarm) return
    setSubmitting(true)
    try {
      const plot = isDemo
        ? {
            id: crypto.randomUUID(),
            name: plotName.trim(),
            cropType: cropType.trim() || null,
            farmId: plotFarm.id,
            farmName: plotFarm.name,
            createdAt: new Date().toISOString(),
          }
        : await apiRequest<Plot>(`/farms/${plotFarm.id}/plots`, {
            method: 'POST',
            token,
            body: { name: plotName.trim(), cropType: cropType.trim() || null },
          })
      setBundles((current) => current.map((bundle) => (
        bundle.farm.id === plotFarm.id
          ? { ...bundle, plots: [...bundle.plots, { ...plot, devices: [] }] }
          : bundle
      )))
      setPlotFarm(null)
      setPlotName('')
      setCropType('')
      showToast('Parcela agregada a la finca.')
    } catch (requestError) {
      showToast(errorMessage(requestError), 'warning')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="ORGANIZACIÓN DEL CAMPO"
        title="Fincas y parcelas"
        description="Organiza tus cultivos y consulta qué dispositivos protegen cada zona."
        action={<button className="button button--primary" type="button" onClick={() => setCreateFarmOpen(true)}><Plus size={18} /> Nueva finca</button>}
      />

      <div className="farm-overview-strip">
        <div><span><Building2 size={18} /></span><p><strong>{bundles.length}</strong><small>Fincas registradas</small></p></div>
        <div><span><Sprout size={18} /></span><p><strong>{totals.plots}</strong><small>Parcelas productivas</small></p></div>
        <div><span><Cpu size={18} /></span><p><strong>{totals.devices}</strong><small>Dispositivos instalados</small></p></div>
      </div>

      {error && <ErrorBanner message={error} retry={() => void load()} />}
      {loading ? <LoadingBlock label="Organizando fincas y dispositivos…" /> : bundles.length ? (
        <div className="farm-list">
          {bundles.map(({ farm, plots }) => {
            const isOpen = expanded.has(farm.id)
            const deviceCount = plots.reduce((sum, plot) => sum + plot.devices.length, 0)
            const onlineCount = plots.reduce((sum, plot) => sum + plot.devices.filter((device) => device.status === 'ONLINE').length, 0)
            return (
              <article className={`farm-card${isOpen ? ' farm-card--expanded' : ''}`} key={farm.id}>
                <button className="farm-card__summary" type="button" onClick={() => toggle(farm.id)}>
                  <span className="farm-card__mark"><Building2 size={24} /></span>
                  <span className="farm-card__identity">
                    <strong>{farm.name}</strong>
                    <small><MapPin size={14} /> {farm.location || 'Ubicación pendiente'}</small>
                  </span>
                  <span className="farm-card__owner"><UserRound size={15} /> {farm.ownerName}</span>
                  <span className="farm-card__numbers"><b>{plots.length}</b><small>parcelas</small></span>
                  <span className="farm-card__numbers"><b>{onlineCount}/{deviceCount}</b><small>online</small></span>
                  <ChevronDown className={isOpen ? 'rotate' : ''} size={20} />
                </button>

                {isOpen && (
                  <div className="farm-card__content">
                    <div className="farm-card__content-header">
                      <div><strong>Parcelas de la finca</strong><span>Configura cada zona según su cultivo.</span></div>
                      <button className="button button--outline button--small" type="button" onClick={() => setPlotFarm(farm)}><Plus size={16} /> Agregar parcela</button>
                    </div>
                    {plots.length ? (
                      <div className="plot-grid">
                        {plots.map((plot) => (
                          <article className="plot-card" key={plot.id}>
                            <div className="plot-card__head">
                              <span><Leaf size={19} /></span>
                              <Badge tone="green" dot>Activa</Badge>
                            </div>
                            <h3>{plot.name}</h3>
                            <p>{plot.cropType || 'Cultivo por definir'}</p>
                            <div className="plot-card__devices">
                              {plot.devices.slice(0, 5).map((device) => {
                                const Icon = deviceIcon(device.type)
                                return <span key={device.id} title={`${device.name} · ${device.status}`} className={device.status === 'ONLINE' ? 'online' : ''}><Icon size={15} /></span>
                              })}
                              {plot.devices.length > 5 && <em>+{plot.devices.length - 5}</em>}
                            </div>
                            <div className="plot-card__footer">
                              <span>{plot.devices.length} dispositivos</span>
                              <span>{plot.devices.filter((device) => device.status === 'ONLINE').length} conectados</span>
                            </div>
                          </article>
                        ))}
                      </div>
                    ) : <EmptyState title="Finca sin parcelas" description="Agrega la primera parcela para comenzar a instalar dispositivos." />}
                  </div>
                )}
              </article>
            )
          })}
        </div>
      ) : <EmptyState title="Aún no registraste fincas" description="Crea tu primera finca para organizar parcelas y dispositivos." action={<button className="button button--primary" type="button" onClick={() => setCreateFarmOpen(true)}><Plus size={17} /> Crear finca</button>} />}

      <Modal open={createFarmOpen} onClose={() => setCreateFarmOpen(false)} title="Registrar nueva finca" description="Agrega la unidad productiva principal de tu operación.">
        <form className="modal-form" onSubmit={createFarm}>
          <label className="field"><span>Nombre de la finca <b>*</b></span><input value={farmName} onChange={(event) => setFarmName(event.target.value)} placeholder="Ejemplo: Fundo Santa Rosa" maxLength={140} required /></label>
          <label className="field"><span>Ubicación</span><div className="field__control"><MapPin size={18} /><input value={farmLocation} onChange={(event) => setFarmLocation(event.target.value)} placeholder="Distrito, región" maxLength={220} /></div></label>
          <div className="modal-form__footer"><button className="button button--ghost" type="button" onClick={() => setCreateFarmOpen(false)}>Cancelar</button><button className="button button--primary" type="submit" disabled={submitting}>{submitting ? 'Guardando…' : 'Registrar finca'}</button></div>
        </form>
      </Modal>

      <Modal open={Boolean(plotFarm)} onClose={() => setPlotFarm(null)} title="Agregar parcela" description={`Nueva zona productiva en ${plotFarm?.name ?? ''}.`}>
        <form className="modal-form" onSubmit={createPlot}>
          <label className="field"><span>Nombre de la parcela <b>*</b></span><input value={plotName} onChange={(event) => setPlotName(event.target.value)} placeholder="Ejemplo: Sector Palto Norte" maxLength={140} required /></label>
          <label className="field"><span>Tipo de cultivo</span><div className="field__control"><Leaf size={18} /><input value={cropType} onChange={(event) => setCropType(event.target.value)} placeholder="Ejemplo: Palta Hass" maxLength={120} /></div></label>
          <div className="modal-form__footer"><button className="button button--ghost" type="button" onClick={() => setPlotFarm(null)}>Cancelar</button><button className="button button--primary" type="submit" disabled={submitting}>{submitting ? 'Guardando…' : 'Agregar parcela'}</button></div>
        </form>
      </Modal>
    </div>
  )
}
