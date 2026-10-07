export const formatValue = (value, suffix = '', digits = 1) => {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '—';
  return `${Number(value).toFixed(digits)}${suffix}`;
};

export const formatDateTime = (value) => {
  if (!value) return 'Sin registro';
  const date = new Date(value);
  return new Intl.DateTimeFormat('es-PE', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
  }).format(date);
};

export const formatSensor = (type) => ({
  FLOW_IN: 'Caudal de entrada',
  FLOW_OUT: 'Caudal de salida',
  PRESSURE: 'Presión',
  SOIL_MOISTURE: 'Humedad del suelo'
}[type] || type);

export const alertLabel = (type) => ({
  LEAK: 'Posible fuga',
  OBSTRUCTION: 'Posible obstrucción',
  PRESSURE_OUT_OF_RANGE: 'Presión fuera de rango'
}[type] || type);
