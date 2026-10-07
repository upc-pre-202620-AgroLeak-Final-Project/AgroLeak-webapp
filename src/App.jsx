import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { api } from './services/api.js';
import { alertLabel, formatDateTime, formatSensor, formatValue } from './utils/format.js';
import Icon from './components/Icon.jsx';
import MetricCard from './components/MetricCard.jsx';
import StatusBadge from './components/StatusBadge.jsx';
import EmptyState from './components/EmptyState.jsx';
import logo from './assets/agroleak-logo.png';

const views = [
  { id: 'dashboard', label: 'Resumen', icon: 'dashboard' },
  { id: 'telemetry', label: 'Telemetría', icon: 'activity' },
  { id: 'alerts', label: 'Alertas', icon: 'alert' },
  { id: 'valve', label: 'Válvula', icon: 'valve' },
  { id: 'pests', label: 'Plagas', icon: 'bug' }
];

function App() {
  const [view, setView] = useState('dashboard');
  const [devices, setDevices] = useState([]);
  const [deviceId, setDeviceId] = useState('');
  const [dashboard, setDashboard] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [readings, setReadings] = useState([]);
  const [pests, setPests] = useState([]);
  const [valve, setValve] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState('');
  const [error, setError] = useState('');
  const [lastRefresh, setLastRefresh] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const currentDevice = useMemo(() => devices.find((d) => d.id === deviceId), [devices, deviceId]);

  const loadDevices = useCallback(async () => {
    try {
      setError('');
      const result = await api.getDevices();
      setDevices(result || []);
      if (!deviceId && result?.length) setDeviceId(result[0].id);
    } catch (err) {
      setError(`No se pudo conectar con el backend: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [deviceId]);

  const loadDeviceData = useCallback(async (id) => {
    if (!id) return;
    setLoading(true);
    try {
      setError('');
      const results = await Promise.allSettled([
        api.getDashboard(id),
        api.getAlerts(id),
        api.getReadings(id, 40),
        api.getPestObservations(id, 10),
        api.getLatestValve(id)
      ]);
      const [dashResult, alertsResult, readingsResult, pestsResult, valveResult] = results;
      if (dashResult.status === 'fulfilled') setDashboard(dashResult.value);
      if (alertsResult.status === 'fulfilled') setAlerts(alertsResult.value || []);
      if (readingsResult.status === 'fulfilled') setReadings(readingsResult.value || []);
      if (pestsResult.status === 'fulfilled') setPests(pestsResult.value || []);
      if (valveResult.status === 'fulfilled') setValve(valveResult.value);
      setLastRefresh(new Date());
      if (dashResult.status === 'rejected') throw dashResult.reason;
    } catch (err) {
      setError(`No se pudo actualizar AgroLeak: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadDevices(); }, [loadDevices]);
  useEffect(() => { if (deviceId) loadDeviceData(deviceId); }, [deviceId, loadDeviceData]);

  const refresh = () => loadDeviceData(deviceId);

  const runScenario = async (scenario) => {
    setActionLoading(`scenario-${scenario}`);
    try {
      await api.createDemoScenario(deviceId, scenario);
      await refresh();
    } catch (err) { setError(`Escenario no ejecutado: ${err.message}`); }
    finally { setActionLoading(''); }
  };

  const sendValve = async (action) => {
    setActionLoading(`valve-${action}`);
    try {
      const command = await api.createValveCommand(deviceId, action);
      setValve(command);
      await refresh();
    } catch (err) { setError(`No se pudo enviar el comando: ${err.message}`); }
    finally { setActionLoading(''); }
  };

  const confirmValve = async () => {
    if (!valve?.id) return;
    setActionLoading('confirm');
    try {
      await api.confirmValveCommand(valve.id, true);
      await refresh();
    } catch (err) { setError(`No se pudo confirmar el comando: ${err.message}`); }
    finally { setActionLoading(''); }
  };

  const resolveAlert = async (id) => {
    setActionLoading(`alert-${id}`);
    try {
      await api.resolveAlert(id);
      await refresh();
    } catch (err) { setError(`No se pudo resolver la alerta: ${err.message}`); }
    finally { setActionLoading(''); }
  };

  const content = {
    dashboard: <Dashboard dashboard={dashboard} alerts={alerts} readings={readings} pests={pests} valve={valve} onScenario={runScenario} actionLoading={actionLoading} />,
    telemetry: <Telemetry readings={readings} dashboard={dashboard} />,
    alerts: <Alerts alerts={alerts} onResolve={resolveAlert} actionLoading={actionLoading} />,
    valve: <Valve valve={valve} onSend={sendValve} onConfirm={confirmValve} actionLoading={actionLoading} />,
    pests: <Pests observations={pests} />
  }[view];

  return (
    <div className="app-shell">
      <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="brand">
          <img src={logo} alt="AgroLeak" />
          <div><strong>AgroLeak</strong><span>IoT Monitoring</span></div>
        </div>
        <nav className="nav-list">
          {views.map((item) => (
            <button key={item.id} className={view === item.id ? 'nav-item active' : 'nav-item'} onClick={() => { setView(item.id); setSidebarOpen(false); }}>
              <Icon name={item.icon} size={19} /><span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="api-status"><span className={error ? 'dot dot-error' : 'dot'} />{error ? 'API sin conexión' : 'API conectada'}</div>
          <small>{api.baseUrl}</small>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <button className="mobile-menu" onClick={() => setSidebarOpen((v) => !v)} aria-label="Abrir menú">☰</button>
          <div className="page-title">
            <p>AgroLeak / {views.find((x) => x.id === view)?.label}</p>
            <h1>{view === 'dashboard' ? 'Centro de monitoreo' : views.find((x) => x.id === view)?.label}</h1>
          </div>
          <div className="top-actions">
            <select value={deviceId} onChange={(e) => setDeviceId(e.target.value)} disabled={!devices.length}>
              {!devices.length && <option>Sin dispositivos</option>}
              {devices.map((device) => <option value={device.id} key={device.id}>{device.name} · {device.location}</option>)}
            </select>
            <button className="icon-button" onClick={refresh} disabled={!deviceId || loading} title="Actualizar"><Icon name="refresh" size={19} /></button>
          </div>
        </header>

        {error && (
          <div className="error-banner">
            <Icon name="alert" size={18} />
            <div><strong>Backend no disponible</strong><span>{error}</span></div>
            <button onClick={loadDevices}>Reintentar</button>
          </div>
        )}

        <section className="context-strip">
          <div className="context-device">
            <div className="context-icon"><Icon name="device" /></div>
            <div>
              <span>Dispositivo activo</span>
              <strong>{currentDevice?.name || dashboard?.deviceName || 'Esperando gateway'}</strong>
            </div>
          </div>
          <div className="context-meta">
            <StatusBadge status={dashboard?.deviceStatus || currentDevice?.status || 'OFFLINE'} />
            <span><Icon name="clock" size={15} /> Última actualización: {lastRefresh ? formatDateTime(lastRefresh) : '—'}</span>
          </div>
        </section>

        <div className={loading && !dashboard ? 'content content-loading' : 'content'}>
          {!deviceId && !loading ? <EmptyState icon="device" title="No hay dispositivos registrados" text="Inicia el backend con los datos demo o registra un gateway desde Swagger." /> : content}
        </div>
      </main>
    </div>
  );
}

function Dashboard({ dashboard, alerts, readings, pests, valve, onScenario, actionLoading }) {
  const activeAlerts = alerts.filter((a) => a.status === 'ACTIVE');
  const loss = dashboard?.estimatedLossPercent;
  const lossClass = loss > 20 ? 'danger' : loss > 10 ? 'warning' : 'healthy';
  const latest = readings.slice(0, 6);
  return (
    <>
      <div className="metric-grid">
        <MetricCard icon="droplet" label="Caudal entrada" value={formatValue(dashboard?.flowIn, ' L/min')} helper="Sensor FLOW_IN" />
        <MetricCard icon="droplet" label="Caudal salida" value={formatValue(dashboard?.flowOut, ' L/min')} helper="Sensor FLOW_OUT" tone="blue" />
        <MetricCard icon="activity" label="Presión" value={formatValue(dashboard?.pressure, ' bar')} helper="Línea principal" tone="purple" />
        <MetricCard icon="leaf" label="Humedad suelo" value={formatValue(dashboard?.soilMoisture, '%')} helper="Zona radicular" tone="amber" />
      </div>

      <div className="dashboard-grid">
        <section className="panel span-2">
          <div className="panel-header"><div><span className="eyebrow">BALANCE HÍDRICO</span><h2>Estado del flujo</h2></div><span className={`health-pill ${lossClass}`}>{loss === null || loss === undefined ? 'Sin datos' : `${formatValue(loss, '%')} pérdida estimada`}</span></div>
          <div className="water-balance">
            <div className="water-side"><span>Entrada</span><strong>{formatValue(dashboard?.flowIn, ' L/min')}</strong></div>
            <div className="pipe-visual"><div className="pipe-line"><span className="water-flow" /></div><div className={`loss-marker ${lossClass}`}><Icon name={loss > 20 ? 'alert' : 'check'} size={18} /></div></div>
            <div className="water-side align-right"><span>Salida</span><strong>{formatValue(dashboard?.flowOut, ' L/min')}</strong></div>
          </div>
          <div className="threshold-note"><Icon name="activity" size={17}/><span>La v0.1 genera una alerta de fuga cuando la diferencia entrada/salida supera el umbral configurado en el backend.</span></div>
        </section>

        <section className="panel">
          <div className="panel-header"><div><span className="eyebrow">CONTROL</span><h2>Válvula</h2></div><Icon name="valve" /></div>
          <div className="valve-summary">
            <div className={`valve-state ${valve?.action === 'CLOSE' ? 'closed' : 'open'}`}><span className="valve-ring"><Icon name="valve" size={30}/></span><strong>{valve?.action === 'CLOSE' ? 'Cierre solicitado' : valve?.action === 'OPEN' ? 'Apertura solicitada' : 'Sin comandos'}</strong><small>Estado: {valve?.status || '—'}</small></div>
          </div>
        </section>

        <section className="panel">
          <div className="panel-header"><div><span className="eyebrow">SEGURIDAD</span><h2>Alertas activas</h2></div><span className="count-badge">{activeAlerts.length}</span></div>
          <div className="compact-list">
            {activeAlerts.length ? activeAlerts.slice(0, 3).map((alert) => <div className="compact-alert" key={alert.id}><span className={`severity-dot severity-${alert.severity?.toLowerCase()}`} /><div><strong>{alertLabel(alert.type)}</strong><small>{alert.message}</small></div></div>) : <EmptyState icon="check" title="Sin alertas activas" text="El sistema no reporta eventos pendientes." />}
          </div>
        </section>

        <section className="panel">
          <div className="panel-header"><div><span className="eyebrow">VISIÓN</span><h2>Último monitoreo de plagas</h2></div><Icon name="bug" /></div>
          {pests.length ? <div className="pest-highlight"><strong>{pests[0].pestCount}</strong><span>detecciones registradas</span><div className="confidence"><span>Confianza del modelo externo</span><b>{formatValue((pests[0].confidence || 0) * 100, '%', 0)}</b></div><small>{formatDateTime(pests[0].recordedAt)}</small></div> : <EmptyState icon="bug" title="Sin observaciones" text="Aún no se han registrado resultados de visión." />}
        </section>

        <section className="panel span-2">
          <div className="panel-header"><div><span className="eyebrow">TELEMETRÍA</span><h2>Lecturas recientes</h2></div><span className="muted">Últimos registros</span></div>
          <ReadingsTable readings={latest} />
        </section>

        <section className="panel demo-panel span-3">
          <div><span className="eyebrow">MODO EXPOSICIÓN</span><h2>Simular comportamiento del sistema</h2><p>Los escenarios generan telemetría en el backend y permiten demostrar detección y respuesta sin esperar a los sensores físicos.</p></div>
          <div className="scenario-actions">
            <button className="scenario normal" disabled={!!actionLoading} onClick={() => onScenario('normal')}><Icon name="check"/> Normal</button>
            <button className="scenario leak" disabled={!!actionLoading} onClick={() => onScenario('leak')}><Icon name="droplet"/> Simular fuga</button>
            <button className="scenario obstruction" disabled={!!actionLoading} onClick={() => onScenario('obstruction')}><Icon name="alert"/> Obstrucción</button>
          </div>
        </section>
      </div>
    </>
  );
}

function Telemetry({ readings, dashboard }) {
  const data = [...readings].reverse();
  return (
    <div className="page-grid">
      <section className="panel span-2">
        <div className="panel-header"><div><span className="eyebrow">HISTÓRICO</span><h2>Telemetría del dispositivo</h2></div><span className="muted">{readings.length} lecturas</span></div>
        <ReadingsTable readings={readings} showMore />
      </section>
      <section className="panel">
        <div className="panel-header"><div><span className="eyebrow">TENDENCIA</span><h2>Caudal reciente</h2></div></div>
        <SimpleChart readings={data.filter((r) => r.sensorType === 'FLOW_IN' || r.sensorType === 'FLOW_OUT')} />
      </section>
      <section className="panel span-3">
        <div className="panel-header"><div><span className="eyebrow">SNAPSHOT</span><h2>Último estado consolidado</h2></div></div>
        <div className="snapshot-row"><span>Entrada <b>{formatValue(dashboard?.flowIn, ' L/min')}</b></span><span>Salida <b>{formatValue(dashboard?.flowOut, ' L/min')}</b></span><span>Presión <b>{formatValue(dashboard?.pressure, ' bar')}</b></span><span>Humedad <b>{formatValue(dashboard?.soilMoisture, '%')}</b></span></div>
      </section>
    </div>
  );
}

function Alerts({ alerts, onResolve, actionLoading }) {
  const active = alerts.filter((a) => a.status === 'ACTIVE');
  const history = alerts.filter((a) => a.status !== 'ACTIVE');
  return (
    <div className="page-grid">
      <section className="panel span-2">
        <div className="panel-header"><div><span className="eyebrow">ATENCIÓN REQUERIDA</span><h2>Alertas activas</h2></div><span className="count-badge">{active.length}</span></div>
        <div className="alert-list">
          {active.length ? active.map((alert) => <AlertRow key={alert.id} alert={alert} action={<button disabled={!!actionLoading} onClick={() => onResolve(alert.id)}>Marcar resuelta</button>} />) : <EmptyState icon="check" title="Todo en orden" text="No existen alertas activas para este dispositivo." />}
        </div>
      </section>
      <section className="panel">
        <div className="panel-header"><div><span className="eyebrow">RESUMEN</span><h2>Prioridades</h2></div></div>
        <div className="severity-summary"><div><span className="severity-dot severity-high"/><b>{active.filter((a) => a.severity === 'HIGH').length}</b><small>Alta</small></div><div><span className="severity-dot severity-medium"/><b>{active.filter((a) => a.severity === 'MEDIUM').length}</b><small>Media</small></div><div><span className="severity-dot severity-low"/><b>{active.filter((a) => a.severity === 'LOW').length}</b><small>Baja</small></div></div>
      </section>
      <section className="panel span-3"><div className="panel-header"><div><span className="eyebrow">HISTORIAL</span><h2>Alertas resueltas</h2></div></div><div className="alert-list compact">{history.length ? history.map((alert) => <AlertRow key={alert.id} alert={alert}/>) : <EmptyState icon="clock" title="Sin historial" text="Las alertas resueltas aparecerán aquí."/>}</div></section>
    </div>
  );
}

function Valve({ valve, onSend, onConfirm, actionLoading }) {
  const pending = valve?.status === 'PENDING';
  return (
    <div className="page-grid">
      <section className="panel span-2 valve-control-panel">
        <div className="panel-header"><div><span className="eyebrow">ACTUADOR</span><h2>Control manual de válvula</h2></div><StatusBadge status={valve?.status || 'IDLE'} /></div>
        <div className="big-valve"><div className={`valve-illustration ${valve?.action === 'CLOSE' ? 'is-closed' : ''}`}><div className="valve-handle"/><div className="valve-body"><Icon name="valve" size={54}/></div></div><div><span>Última acción</span><strong>{valve?.action || 'SIN COMANDO'}</strong><small>{valve?.requestedAt ? formatDateTime(valve.requestedAt) : 'No se han enviado comandos'}</small></div></div>
        <div className="valve-buttons"><button className="primary-action" disabled={!!actionLoading} onClick={() => onSend('OPEN')}>Abrir válvula</button><button className="danger-action" disabled={!!actionLoading} onClick={() => onSend('CLOSE')}>Cerrar válvula</button></div>
      </section>
      <section className="panel">
        <div className="panel-header"><div><span className="eyebrow">FEEDBACK</span><h2>Confirmación ESP32</h2></div></div>
        {pending ? <div className="confirm-box"><div className="pulse-circle"><Icon name="wifi"/></div><strong>Comando pendiente</strong><p>En hardware real el gateway confirmará la ejecución. Para la demo puedes simularla aquí.</p><button className="secondary-action" disabled={!!actionLoading} onClick={onConfirm}>Simular confirmación</button></div> : <div className="confirm-box success"><div className="pulse-circle"><Icon name="check"/></div><strong>{valve?.status === 'CONFIRMED' ? 'Comando confirmado' : 'Esperando comando'}</strong><p>{valve?.confirmedAt ? `Confirmado ${formatDateTime(valve.confirmedAt)}` : 'Envía una acción para iniciar el flujo.'}</p></div>}
      </section>
    </div>
  );
}

function Pests({ observations }) {
  return (
    <div className="page-grid">
      <section className="panel span-2"><div className="panel-header"><div><span className="eyebrow">OBSERVACIONES</span><h2>Registro de plagas</h2></div><span className="muted">Resultado de servicio externo / demo</span></div>{observations.length ? <div className="pest-list">{observations.map((item) => <div className="pest-row" key={item.id}><div className="pest-thumb"><Icon name="bug" size={28}/></div><div><strong>{item.pestCount} detecciones</strong><span>{formatDateTime(item.recordedAt)}</span></div><div className="pest-confidence"><span>Confianza</span><b>{formatValue(item.confidence * 100, '%', 0)}</b></div></div>)}</div> : <EmptyState icon="bug" title="Sin observaciones" text="El backend todavía no tiene registros de plagas."/>}</section>
      <section className="panel"><div className="panel-header"><div><span className="eyebrow">ALCANCE V0.1</span><h2>Visión artificial</h2></div></div><div className="scope-note"><Icon name="server" size={26}/><p>En esta entrega el backend <strong>registra el resultado</strong> de una detección simulada o externa. El modelo de Computer Vision real queda planificado para una siguiente versión.</p></div></section>
    </div>
  );
}

function ReadingsTable({ readings, showMore = false }) {
  const rows = showMore ? readings : readings.slice(0, 6);
  if (!rows.length) return <EmptyState icon="activity" title="Sin telemetría" text="Ejecuta un escenario demo o envía lecturas desde Swagger."/>;
  return <div className="table-wrap"><table><thead><tr><th>Sensor</th><th>Valor</th><th>Unidad</th><th>Registrado</th></tr></thead><tbody>{rows.map((r) => <tr key={r.id}><td><span className="sensor-name"><span className={`sensor-dot sensor-${String(r.sensorType).toLowerCase()}`} />{formatSensor(r.sensorType)}</span></td><td><strong>{formatValue(r.value, '', 2)}</strong></td><td>{r.unit}</td><td>{formatDateTime(r.recordedAt)}</td></tr>)}</tbody></table></div>;
}

function AlertRow({ alert, action }) {
  return <div className="alert-row"><div className={`alert-icon severity-bg-${alert.severity?.toLowerCase()}`}><Icon name="alert" size={20}/></div><div className="alert-copy"><div><strong>{alertLabel(alert.type)}</strong><span className={`severity-tag severity-tag-${alert.severity?.toLowerCase()}`}>{alert.severity}</span></div><p>{alert.message}</p><small>{formatDateTime(alert.createdAt)} · {alert.status}</small></div>{action && <div className="alert-action">{action}</div>}</div>;
}

function SimpleChart({ readings }) {
  if (readings.length < 2) return <EmptyState icon="activity" title="Datos insuficientes" text="Genera más telemetría para visualizar una tendencia."/>;
  const points = readings.slice(-18);
  const max = Math.max(...points.map((x) => x.value), 1);
  return <div className="mini-chart"><div className="chart-bars">{points.map((r) => <div key={r.id} className={`chart-bar chart-${r.sensorType === 'FLOW_IN' ? 'in' : 'out'}`} style={{ height: `${Math.max(8, (r.value / max) * 100)}%` }} title={`${formatSensor(r.sensorType)}: ${r.value} ${r.unit}`}/>)}</div><div className="chart-legend"><span><i className="legend-in"/>Entrada</span><span><i className="legend-out"/>Salida</span></div></div>;
}

export default App;
