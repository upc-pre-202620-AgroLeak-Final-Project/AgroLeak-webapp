const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

async function request(path, options = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    ...options
  });

  if (!response.ok) {
    let detail = `HTTP ${response.status}`;
    try {
      const body = await response.json();
      detail = body.message || body.detail || body.error || detail;
    } catch {
      // Keep generic HTTP message.
    }
    throw new Error(detail);
  }

  if (response.status === 204) return null;
  return response.json();
}

export const api = {
  baseUrl: BASE_URL,
  getDevices: () => request('/devices'),
  getDashboard: (deviceId) => request(`/dashboard/${deviceId}`),
  getAlerts: (deviceId, status) => {
    const query = new URLSearchParams({ deviceId });
    if (status) query.set('status', status);
    return request(`/alerts?${query}`);
  },
  resolveAlert: (alertId) => request(`/alerts/${alertId}/resolve`, { method: 'PATCH' }),
  getReadings: (deviceId, limit = 30) => request(`/readings/device/${deviceId}?limit=${limit}`),
  getLatestReadings: (deviceId) => request(`/readings/device/${deviceId}/latest`),
  getLatestValve: (deviceId) => request(`/valves/${deviceId}/latest`),
  createValveCommand: (deviceId, action) => request(`/valves/${deviceId}/commands`, {
    method: 'POST',
    body: JSON.stringify({ action })
  }),
  confirmValveCommand: (commandId, success = true) => request(`/valves/commands/${commandId}/confirm`, {
    method: 'PATCH',
    body: JSON.stringify({ success })
  }),
  getPestObservations: (deviceId, limit = 20) => request(`/pest-observations/device/${deviceId}?limit=${limit}`),
  createDemoScenario: (deviceId, scenario) => request(`/demo/scenarios/${scenario}/${deviceId}`, { method: 'POST' })
};
