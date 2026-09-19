interface LogoProps {
  compact?: boolean
  light?: boolean
}

export function Logo({ compact = false, light = false }: LogoProps) {
  return (
    <div className={`brand-logo${light ? ' brand-logo--light' : ''}`} aria-label="AgroLeak">
      <svg className="brand-logo__mark" viewBox="0 0 48 48" role="img" aria-hidden="true">
        <path d="M24 4C17.5 13.6 10 21.2 10 30.1C10 38 16.3 44 24 44s14-6 14-13.9C38 21.2 30.5 13.6 24 4Z" fill="currentColor" />
        <path d="M18 31.2c5.8-.4 10.2-4.1 12.9-9.4-1 8.2-5 13.5-12.2 15.5" fill="none" stroke="var(--logo-cut, #d9f177)" strokeLinecap="round" strokeWidth="3.4" />
        <path d="M18.5 26.2c2.4.7 4.4 2.1 5.8 4" fill="none" stroke="var(--logo-cut, #d9f177)" strokeLinecap="round" strokeWidth="2.4" />
      </svg>
      {!compact && (
        <span className="brand-logo__word">
          Agro<span>Leak</span>
        </span>
      )}
    </div>
  )
}
