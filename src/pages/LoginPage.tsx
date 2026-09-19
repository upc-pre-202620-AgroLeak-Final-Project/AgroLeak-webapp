import { ArrowRight, Eye, EyeOff, Leaf, LockKeyhole, Mail, Radar, ShieldCheck, Sparkles } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Logo } from '../components/Logo'
import { useAuth } from '../contexts/AuthContext'
import { errorMessage } from '../lib/api'
import type { Role } from '../types/api'

export function LoginPage() {
  const { user, login, enterDemo } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('producer@agroleak.local')
  const [password, setPassword] = useState('ChangeMe123!')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (user) navigate('/app', { replace: true })
  }, [user, navigate])

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email.trim(), password)
      const state = location.state as { from?: string } | null
      navigate(state?.from || '/app', { replace: true })
    } catch (requestError) {
      setError(errorMessage(requestError))
    } finally {
      setLoading(false)
    }
  }

  const demo = (role: Role) => {
    enterDemo(role)
    navigate('/app', { replace: true })
  }

  return (
    <main className="login-page">
      <section className="login-panel">
        <div className="login-panel__content">
          <Logo />
          <div className="login-copy">
            <span className="login-copy__eyebrow"><Sparkles size={15} /> Plataforma IoT agrícola</span>
            <h1>Tu cultivo, protegido en cada gota.</h1>
            <p>Monitorea el riego, responde ante anomalías y cuida tus plantas desde un solo lugar.</p>
          </div>

          <form className="login-form" onSubmit={submit}>
            <label className="field">
              <span>Correo electrónico</span>
              <div className="field__control">
                <Mail size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="nombre@empresa.com"
                  autoComplete="email"
                  required
                />
              </div>
            </label>
            <label className="field">
              <span>Contraseña</span>
              <div className="field__control">
                <LockKeyhole size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Tu contraseña"
                  autoComplete="current-password"
                  required
                />
                <button type="button" aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'} onClick={() => setShowPassword((visible) => !visible)}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </label>

            {error && <div className="login-form__error">{error}</div>}

            <button className="button button--primary button--large button--full" type="submit" disabled={loading}>
              {loading ? 'Conectando…' : 'Ingresar a AgroLeak'}
              {!loading && <ArrowRight size={19} />}
            </button>
          </form>

          <div className="demo-access">
            <span>¿Solo quieres revisar la interfaz?</span>
            <div>
              <button type="button" onClick={() => demo('PRODUCER')}>Demo productor</button>
              <span>·</span>
              <button type="button" onClick={() => demo('ADMIN')}>Demo administrador</button>
            </div>
          </div>

          <div className="login-security"><ShieldCheck size={16} /> Acceso cifrado y acciones auditables</div>
        </div>
      </section>

      <section className="login-visual" aria-label="Resumen visual de la plataforma">
        <div className="login-visual__orb login-visual__orb--one" />
        <div className="login-visual__orb login-visual__orb--two" />
        <div className="login-visual__top">
          <span className="live-pill"><span /> Monitoreo activo</span>
          <span>Fundo Santa Elena</span>
        </div>

        <div className="field-map">
          <svg viewBox="0 0 780 560" aria-hidden="true">
            <defs>
              <linearGradient id="land" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#2a664b" />
                <stop offset="100%" stopColor="#143f2f" />
              </linearGradient>
              <pattern id="rows" width="28" height="28" patternUnits="userSpaceOnUse" patternTransform="rotate(24)">
                <line x1="0" x2="0" y1="0" y2="28" stroke="#93bc65" strokeOpacity="0.16" strokeWidth="8" />
              </pattern>
            </defs>
            <path d="M56 178 414 34l304 172-40 272-392 46L48 414Z" fill="url(#land)" />
            <path d="M56 178 414 34l304 172-40 272-392 46L48 414Z" fill="url(#rows)" />
            <path d="M126 390c104-26 88-155 182-190s137 58 230 8c42-23 72-63 104-96" fill="none" stroke="#8fd2bf" strokeOpacity="0.88" strokeWidth="7" strokeLinecap="round" />
            <path d="M126 390c104-26 88-155 182-190s137 58 230 8c42-23 72-63 104-96" fill="none" stroke="#d9f177" strokeOpacity="0.8" strokeWidth="2" strokeDasharray="8 13" strokeLinecap="round" />
            <circle cx="304" cy="203" r="12" fill="#d9f177" />
            <circle cx="304" cy="203" r="24" fill="none" stroke="#d9f177" strokeOpacity="0.4" />
            <circle cx="535" cy="209" r="12" fill="#8fd2bf" />
            <circle cx="535" cy="209" r="24" fill="none" stroke="#8fd2bf" strokeOpacity="0.4" />
          </svg>
          <div className="map-label map-label--flow"><Radar size={15} /> Flujo estable</div>
          <div className="map-label map-label--crop"><Leaf size={15} /> Cultivo protegido</div>
        </div>

        <div className="visual-card visual-card--flow">
          <span>Caudal actual</span>
          <strong>28.4 <small>L/min</small></strong>
          <div className="mini-bars">
            {[42, 56, 48, 67, 73, 61, 78, 72, 84, 76].map((value, index) => (
              <i key={index} style={{ height: `${value}%` }} />
            ))}
          </div>
          <small className="positive">● Dentro del rango</small>
        </div>

        <div className="visual-card visual-card--ai">
          <span className="visual-card__icon"><Leaf size={20} /></span>
          <div>
            <strong>Visión IA</strong>
            <small>Sin plagas críticas</small>
          </div>
          <b>94%</b>
        </div>

        <div className="login-visual__caption">
          <strong>Decisiones claras. Respuestas rápidas.</strong>
          <span>Información útil para productores que necesitan actuar, no interpretar gráficos complejos.</span>
        </div>
      </section>
    </main>
  )
}
