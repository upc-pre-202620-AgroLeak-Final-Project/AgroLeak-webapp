import { AlertTriangle, Inbox, LoaderCircle, type LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

export type Tone = 'green' | 'amber' | 'red' | 'blue' | 'gray' | 'purple'

export function Badge({ children, tone = 'gray', dot = false }: { children: ReactNode; tone?: Tone; dot?: boolean }) {
  return (
    <span className={`badge badge--${tone}`}>
      {dot && <span className="badge__dot" />}
      {children}
    </span>
  )
}

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string
  title: string
  description: string
  action?: ReactNode
}) {
  return (
    <header className="page-header">
      <div>
        {eyebrow && <span className="page-header__eyebrow">{eyebrow}</span>}
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {action && <div className="page-header__action">{action}</div>}
    </header>
  )
}

export function SectionCard({
  title,
  subtitle,
  action,
  children,
  className = '',
}: {
  title?: string
  subtitle?: string
  action?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <section className={`section-card ${className}`.trim()}>
      {(title || action) && (
        <header className="section-card__header">
          <div>
            {title && <h2>{title}</h2>}
            {subtitle && <p>{subtitle}</p>}
          </div>
          {action}
        </header>
      )}
      {children}
    </section>
  )
}

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = 'green',
}: {
  label: string
  value: string | number
  hint: string
  icon: LucideIcon
  tone?: Tone
}) {
  return (
    <article className="stat-card">
      <div className={`stat-card__icon stat-card__icon--${tone}`}>
        <Icon size={21} />
      </div>
      <div className="stat-card__value">{value}</div>
      <div className="stat-card__label">{label}</div>
      <div className="stat-card__hint">{hint}</div>
    </article>
  )
}

export function LoadingBlock({ label = 'Cargando información…' }: { label?: string }) {
  return (
    <div className="state-block state-block--loading">
      <LoaderCircle className="spin" size={24} />
      <span>{label}</span>
    </div>
  )
}

export function ErrorBanner({ message, retry }: { message: string; retry?: () => void }) {
  return (
    <div className="error-banner" role="alert">
      <AlertTriangle size={20} />
      <div>
        <strong>No pudimos completar la consulta</strong>
        <span>{message}</span>
      </div>
      {retry && (
        <button className="button button--ghost button--small" type="button" onClick={retry}>
          Reintentar
        </button>
      )}
    </div>
  )
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string
  description: string
  action?: ReactNode
}) {
  return (
    <div className="empty-state">
      <div className="empty-state__icon">
        <Inbox size={23} />
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
      {action}
    </div>
  )
}
