const shortDate = new Intl.DateTimeFormat('es-PE', {
  day: '2-digit',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
})

const completeDate = new Intl.DateTimeFormat('es-PE', {
  day: '2-digit',
  month: 'long',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

export function formatDate(value?: string | null, complete = false): string {
  if (!value) return 'Sin registro'
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return 'Sin registro'
  return complete ? completeDate.format(parsed) : shortDate.format(parsed)
}

export function formatTime(value?: string | null): string {
  if (!value) return '--:--'
  return new Intl.DateTimeFormat('es-PE', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

export function timeAgo(value?: string | null): string {
  if (!value) return 'sin conexión'
  const difference = Date.now() - new Date(value).getTime()
  const minutes = Math.max(0, Math.floor(difference / 60_000))
  if (minutes < 1) return 'ahora mismo'
  if (minutes < 60) return `hace ${minutes} min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `hace ${hours} h`
  const days = Math.floor(hours / 24)
  return `hace ${days} d`
}

export function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}

export function percent(value?: number | null, digits = 1): string {
  if (value === null || value === undefined) return '—'
  return `${Number(value).toFixed(digits)}%`
}
