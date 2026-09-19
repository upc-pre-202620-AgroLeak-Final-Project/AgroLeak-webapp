import type { FlowTelemetry } from '../types/api'
import { formatTime } from '../lib/format'

interface FlowChartProps {
  data: FlowTelemetry[]
  compact?: boolean
}

function pathFor(values: number[], width: number, height: number, max: number, min: number) {
  const range = max - min || 1
  return values
    .map((value, index) => {
      const x = values.length === 1 ? width / 2 : (index / (values.length - 1)) * width
      const y = height - ((value - min) / range) * height
      return `${index === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`
    })
    .join(' ')
}

export function FlowChart({ data, compact = false }: FlowChartProps) {
  const readings = [...data].sort(
    (first, second) => new Date(first.recordedAt).getTime() - new Date(second.recordedAt).getTime(),
  )
  if (!readings.length) {
    return (
      <div className={`flow-chart flow-chart--empty${compact ? ' flow-chart--compact' : ''}`}>
        <span>Aún no hay lecturas de caudal.</span>
      </div>
    )
  }

  const width = 760
  const height = compact ? 130 : 210
  const padding = 14
  const values = readings.flatMap((reading) => [
    Number(reading.inletFlowLitersPerMinute),
    Number(reading.outletFlowLitersPerMinute),
  ])
  const maximum = Math.max(...values) + 1
  const minimum = Math.max(0, Math.min(...values) - 1)
  const chartWidth = width - padding * 2
  const chartHeight = height - padding * 2
  const inletPath = pathFor(
    readings.map((reading) => Number(reading.inletFlowLitersPerMinute)),
    chartWidth,
    chartHeight,
    maximum,
    minimum,
  )
  const outletPath = pathFor(
    readings.map((reading) => Number(reading.outletFlowLitersPerMinute)),
    chartWidth,
    chartHeight,
    maximum,
    minimum,
  )
  const areaPath = `${inletPath} L ${chartWidth} ${chartHeight} L 0 ${chartHeight} Z`
  const latest = readings.at(-1)

  return (
    <div className={`flow-chart${compact ? ' flow-chart--compact' : ''}`}>
      {!compact && (
        <div className="flow-chart__metrics">
          <div>
            <span className="legend-dot legend-dot--in" />
            Entrada <strong>{Number(latest?.inletFlowLitersPerMinute).toFixed(1)} L/min</strong>
          </div>
          <div>
            <span className="legend-dot legend-dot--out" />
            Salida <strong>{Number(latest?.outletFlowLitersPerMinute).toFixed(1)} L/min</strong>
          </div>
        </div>
      )}
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Comparación de caudal de entrada y salida">
        <defs>
          <linearGradient id="flowArea" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#7fbd55" stopOpacity="0.24" />
            <stop offset="100%" stopColor="#7fbd55" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0.2, 0.5, 0.8].map((position) => (
          <line
            key={position}
            x1={padding}
            x2={width - padding}
            y1={padding + chartHeight * position}
            y2={padding + chartHeight * position}
            className="flow-chart__grid"
          />
        ))}
        <g transform={`translate(${padding} ${padding})`}>
          <path d={areaPath} fill="url(#flowArea)" />
          <path d={inletPath} className="flow-chart__line flow-chart__line--in" />
          <path d={outletPath} className="flow-chart__line flow-chart__line--out" />
        </g>
      </svg>
      {!compact && (
        <div className="flow-chart__axis">
          <span>{formatTime(readings[0]?.recordedAt)}</span>
          <span>{formatTime(readings[Math.floor(readings.length / 2)]?.recordedAt)}</span>
          <span>{formatTime(readings.at(-1)?.recordedAt)}</span>
        </div>
      )}
    </div>
  )
}
