import {
  Camera,
  Cpu,
  Droplets,
  Filter,
  Gauge,
  Plus,
  Power,
  RadioTower,
  Search,
  Settings2,
  Wifi,
  WifiOff,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
import { Modal } from '../components/Modal'
import { Badge, EmptyState, ErrorBanner, LoadingBlock, PageHeader } from '../components/ui'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import { DEMO_DEVICES, DEMO_FARMS, DEMO_PLOTS } from '../data/demo'
import { apiRequest, errorMessage } from '../lib/api'
import { timeAgo } from '../lib/format'
import type { Device, DeviceStatus, DeviceType, Farm, FarmBundle, Plot } from '../types/api'

const typeLabels: Record<DeviceType, string> = {
  FLOW_SENSOR_INLET: 'Sensor de entrada',
  FLOW_SENSOR_OUTLET: 'Sensor de salida',
  SHUTOFF_VALVE: 'Electroválvula',
  CAMERA: 'Cámara IA',
  LOCALIZED_ACTUATOR: 'Actuador localizado',
  EDGE_GATEWAY: 'Edge gateway',
}

const statusLabels: Record<DeviceStatus, string> = {
  ONLINE: 'En línea',
  OFFLINE: 'Sin conexión',
  MAINTENANCE: 'Mantenimiento',
  LOCKED: 'Bloqueado',
}

function statusTone(status: DeviceStatus) {
  if (status === 'ONLINE') return 'green' as const
  if (status === 'MAINTENANCE') return 'amber' as const
  return 'red' as const
}

function iconFor(type: DeviceType) {
  if (type === 'CAMERA') return Camera
  if (type === 'EDGE_GATEWAY') return RadioTower
  if (type === 'SHUTOFF_VALVE') return Power
  if (type === 'LOCALIZED_ACTUATOR') return Settings2
  return Droplets
}

interface ListedDevice extends Device {
  plotName: string
  farmName: string
}

export function DevicesPage() {
  const { token, isDemo } = useAuth()
  const { showToast } = useToast()
  const [bundles, setBundles] = useState<FarmBundle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<'ALL' | DeviceStatus>('ALL')
  const [type, setType] = useState<'ALL' | DeviceType>('ALL')
  const [createOpen, setCreateOpen] = useState(false)
  const [plotId, setPlotId] = useState('')
  const [deviceCode, setDeviceCode] = useState('')
  const [deviceName, setDeviceName] = useState('')
  const [deviceType, setDeviceType] = useState<DeviceType>('FLOW_SENSOR_INLET')
  const [submitting, setSubmitting] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      if (isDemo) {
        setBundles(DEMO_FARMS.map((farm) => ({
          farm,
          plots: DEMO_PLOTS.filter((plot) => plot.farmId === farm.id).map((plot) => ({
            ...plot,
            devices: DEMO_DEVICES.filter((device) => device.plotId === plot.id),
          })),
        })))
      } else {
        const farms = await apiRequest<Farm[]>('/farms', { token })
        const result = await Promise.all(farms.map(async (farm) => {
          const plots = await apiRequest<Plot[]>(`/farms/${farm.id}/plots`, { token })
          return {
            farm,
            plots: await Promise.all(plots.map(async (plot) => ({
              ...plot,
              devices: await apiRequest<Device[]>(`/plots/${plot.id}/devices`, { token }),
            }))),
          }
        }))
        setBundles(result)
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

  const devices = useMemo<ListedDevice[]>(() => bundles.flatMap((bundle) => bundle.plots.flatMap((plot) => (
    plot.devices.map((device) => ({ ...device, plotName: plot.name, farmName: bundle.farm.name }))
  ))), [bundles])

  const plots = useMemo(() => bundles.flatMap((bundle) => bundle.plots.map((plot) => ({
    id: plot.id,
    label: `${bundle.farm.name} · ${plot.name}`,
  }))), [bundles])

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    return devices.filter((device) => {
      const matchesTerm = !term || [device.name, device.deviceCode, device.plotName, device.farmName].some((value) => value.toLowerCase().includes(term))
      return matchesTerm && (status === 'ALL' || device.status === status) && (type === 'ALL' || device.type === type)
    })
  }, [devices, search, status, type])

  const createDevice = async (event: FormEvent) => {
    event.preventDefault()
    if (!plotId) return
    setSubmitting(true)
    try {
      const device = isDemo
        ? {
            id: crypto.randomUUID(),
            deviceCode: deviceCode.trim(),
            name: deviceName.trim(),
            type: deviceType,
            status: 'OFFLINE' as const,
            lastSeenAt: null,
            plotId,
          }
        : await apiRequest<Device>(`/plots/${plotId}/devices`, {
            method: 'POST',
            token,
            body: { deviceCode: deviceCode.trim(), name: deviceName.trim(), type: deviceType },
          })
      setBundles((current) => current.map((bundle) => ({
        ...bundle,
        plots: bundle.plots.map((plot) => plot.id === plotId ? { ...plot, devices: [...plot.devices, device] } : plot),
      })))
      setCreateOpen(false)
      setDeviceCode('')
      setDeviceName('')
      showToast('Dispositivo registrado. Quedará en línea al reportarse al Edge.')
    } catch (requestError) {
      showToast(errorMessage(requestError), 'warning')
    } finally {
      setSubmitting(false)
    }
  }

  const openCreate = () => {
    setPlotId(plots[0]?.id ?? '')
    setCreateOpen(true)
  }

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="INVENTARIO IOT"
        title="Dispositivos"
        description="Revisa conectividad, ubicación y función de cada equipo instalado en campo."
        action={<button className="button button--primary" type="button" onClick={openCreate} disabled={!plots.length}><Plus size={18} /> Registrar dispositivo</button>}
      />

      <div className="device-health-grid">
        <article><span className="device-health-grid__icon device-health-grid__icon--green"><Wifi size={20} /></span><div><strong>{devices.filter((device) => device.status === 'ONLINE').length}</strong><small>En línea</small></div></article>
        <article><span className="device-health-grid__icon device-health-grid__icon--red"><WifiOff size={20} /></span><div><strong>{devices.filter((device) => device.status === 'OFFLINE').length}</strong><small>Sin conexión</small></div></article>
        <article><span className="device-health-grid__icon device-health-grid__icon--amber"><Settings2 size={20} /></span><div><strong>{devices.filter((device) => device.status === 'MAINTENANCE').length}</strong><small>En mantenimiento</small></div></article>
        <article><span className="device-health-grid__icon device-health-grid__icon--blue"><Gauge size={20} /></span><div><strong>{devices.filter((device) => device.type.includes('FLOW')).length}</strong><small>Sensores de caudal</small></div></article>
      </div>

      <div className="device-toolbar">
        <label className="search-control"><Search size={18} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por nombre, código o parcela…" /></label>
        <label className="select-control"><Filter size={16} /><select value={status} onChange={(event) => setStatus(event.target.value as typeof status)}><option value="ALL">Todos los estados</option>{Object.entries(statusLabels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label>
        <label className="select-control"><Cpu size={16} /><select value={type} onChange={(event) => setType(event.target.value as typeof type)}><option value="ALL">Todos los tipos</option>{Object.entries(typeLabels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label>
      </div>

      {error && <ErrorBanner message={error} retry={() => void load()} />}
      {loading ? <LoadingBlock label="Consultando inventario IoT…" /> : filtered.length ? (
        <div className="device-table-card table-scroll">
          <table className="device-table">
            <thead><tr><th>Dispositivo</th><th>Tipo</th><th>Ubicación</th><th>Estado</th><th>Último reporte</th></tr></thead>
            <tbody>
              {filtered.map((device) => {
                const Icon = iconFor(device.type)
                return (
                  <tr key={device.id}>
                    <td><div className="device-identity"><span><Icon size={19} /></span><div><strong>{device.name}</strong><small>{device.deviceCode}</small></div></div></td>
                    <td>{typeLabels[device.type]}</td>
                    <td><strong className="table-primary">{device.plotName}</strong><small className="table-secondary">{device.farmName}</small></td>
                    <td><Badge tone={statusTone(device.status)} dot>{statusLabels[device.status]}</Badge></td>
                    <td>{timeAgo(device.lastSeenAt)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : <EmptyState title="No encontramos dispositivos" description="Cambia los filtros o registra un nuevo equipo en una parcela." />}

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Registrar dispositivo IoT" description="El código debe coincidir con el configurado físicamente en el Edge.">
        <form className="modal-form" onSubmit={createDevice}>
          <label className="field"><span>Parcela <b>*</b></span><select value={plotId} onChange={(event) => setPlotId(event.target.value)} required>{plots.map((plot) => <option value={plot.id} key={plot.id}>{plot.label}</option>)}</select></label>
          <div className="form-grid form-grid--two">
            <label className="field"><span>Código del dispositivo <b>*</b></span><input value={deviceCode} onChange={(event) => setDeviceCode(event.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, ''))} placeholder="FLOW-IN-003" maxLength={80} required /></label>
            <label className="field"><span>Tipo <b>*</b></span><select value={deviceType} onChange={(event) => setDeviceType(event.target.value as DeviceType)}>{Object.entries(typeLabels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label>
          </div>
          <label className="field"><span>Nombre descriptivo <b>*</b></span><input value={deviceName} onChange={(event) => setDeviceName(event.target.value)} placeholder="Ejemplo: Sensor de entrada norte" maxLength={140} required /></label>
          <div className="modal-form__footer"><button className="button button--ghost" type="button" onClick={() => setCreateOpen(false)}>Cancelar</button><button className="button button--primary" type="submit" disabled={submitting}>{submitting ? 'Registrando…' : 'Registrar dispositivo'}</button></div>
        </form>
      </Modal>
    </div>
  )
}
