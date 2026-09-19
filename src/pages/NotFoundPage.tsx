import { ArrowLeft, Sprout } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Logo } from '../components/Logo'

export function NotFoundPage() {
  return (
    <main className="not-found">
      <Logo />
      <div className="not-found__icon"><Sprout size={34} /></div>
      <span>ERROR 404</span>
      <h1>Esta parcela no existe.</h1>
      <p>La dirección que abriste no forma parte de la plataforma AgroLeak.</p>
      <Link to="/app" className="button button--primary"><ArrowLeft size={18} /> Volver al panel</Link>
    </main>
  )
}
