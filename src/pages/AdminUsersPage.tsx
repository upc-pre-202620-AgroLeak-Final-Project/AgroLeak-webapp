import { KeyRound, Mail, Plus, Search, ShieldCheck, UserRound, Users } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
import { Modal } from '../components/Modal'
import { Badge, EmptyState, ErrorBanner, LoadingBlock, PageHeader } from '../components/ui'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import { DEMO_USERS } from '../data/demo'
import { apiRequest, errorMessage } from '../lib/api'
import { formatDate, initials } from '../lib/format'
import type { Role, User } from '../types/api'

export function AdminUsersPage() {
  const { token, isDemo } = useAuth()
  const { showToast } = useToast()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<Role>('PRODUCER')
  const [submitting, setSubmitting] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      setUsers(isDemo ? DEMO_USERS : await apiRequest<User[]>('/admin/users', { token }))
    } catch (requestError) {
      setError(errorMessage(requestError))
    } finally {
      setLoading(false)
    }
  }, [isDemo, token])

  useEffect(() => {
    void load()
  }, [load])

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    return users.filter((user) => !term || user.fullName.toLowerCase().includes(term) || user.email.toLowerCase().includes(term))
  }, [search, users])

  const createUser = async (event: FormEvent) => {
    event.preventDefault()
    setSubmitting(true)
    try {
      const user = isDemo
        ? {
            id: crypto.randomUUID(),
            email: email.trim().toLowerCase(),
            fullName: fullName.trim(),
            role,
            active: true,
            createdAt: new Date().toISOString(),
          }
        : await apiRequest<User>('/admin/users', {
            method: 'POST',
            token,
            body: { email: email.trim(), password, fullName: fullName.trim(), role },
          })
      setUsers((current) => [...current, user])
      setOpen(false)
      setFullName('')
      setEmail('')
      setPassword('')
      setRole('PRODUCER')
      showToast('Cuenta creada correctamente.')
    } catch (requestError) {
      showToast(errorMessage(requestError), 'warning')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="ADMINISTRACIÓN"
        title="Usuarios"
        description="Gestiona quién puede administrar la plataforma y quién opera sus propias fincas."
        action={<button className="button button--primary" type="button" onClick={() => setOpen(true)}><Plus size={18} /> Nuevo usuario</button>}
      />

      <div className="user-stats">
        <article><span><Users size={21} /></span><div><strong>{users.length}</strong><small>Usuarios totales</small></div></article>
        <article><span><UserRound size={21} /></span><div><strong>{users.filter((user) => user.role === 'PRODUCER').length}</strong><small>Productores</small></div></article>
        <article><span><ShieldCheck size={21} /></span><div><strong>{users.filter((user) => user.role === 'ADMIN').length}</strong><small>Administradores</small></div></article>
      </div>

      <label className="search-control user-search"><Search size={18} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por nombre o correo…" /></label>

      {error && <ErrorBanner message={error} retry={() => void load()} />}
      {loading ? <LoadingBlock /> : filtered.length ? (
        <div className="users-grid">
          {filtered.map((user) => (
            <article className="user-card" key={user.id}>
              <div className={`user-card__avatar${user.role === 'ADMIN' ? ' user-card__avatar--admin' : ''}`}>{initials(user.fullName)}</div>
              <div className="user-card__identity"><strong>{user.fullName}</strong><span><Mail size={14} /> {user.email}</span></div>
              <Badge tone={user.role === 'ADMIN' ? 'purple' : 'green'}>{user.role === 'ADMIN' ? 'Administrador' : 'Productor'}</Badge>
              <dl><div><dt>Estado</dt><dd><span className={user.active ? 'online-dot' : 'offline-dot'} /> {user.active ? 'Activo' : 'Inactivo'}</dd></div><div><dt>Creado</dt><dd>{formatDate(user.createdAt)}</dd></div></dl>
            </article>
          ))}
        </div>
      ) : <EmptyState title="No encontramos usuarios" description="Prueba con otra búsqueda o crea una cuenta." />}

      <Modal open={open} onClose={() => setOpen(false)} title="Crear nueva cuenta" description="El usuario recibirá acceso según el rol seleccionado.">
        <form className="modal-form" onSubmit={createUser}>
          <label className="field"><span>Nombre completo <b>*</b></span><div className="field__control"><UserRound size={18} /><input value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder="Nombre y apellido" maxLength={160} required /></div></label>
          <label className="field"><span>Correo electrónico <b>*</b></span><div className="field__control"><Mail size={18} /><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="usuario@empresa.com" required /></div></label>
          <div className="form-grid form-grid--two">
            <label className="field"><span>Contraseña temporal <b>*</b></span><div className="field__control"><KeyRound size={18} /><input type="password" value={password} onChange={(event) => setPassword(event.target.value)} minLength={8} maxLength={72} required /></div></label>
            <label className="field"><span>Rol <b>*</b></span><select value={role} onChange={(event) => setRole(event.target.value as Role)}><option value="PRODUCER">Productor</option><option value="ADMIN">Administrador</option></select></label>
          </div>
          <div className="role-help"><ShieldCheck size={18} /><span><strong>{role === 'ADMIN' ? 'Acceso global' : 'Acceso por propiedad'}</strong>{role === 'ADMIN' ? 'Podrá consultar todas las fincas y administrar usuarios.' : 'Solo podrá consultar y operar sus propias fincas.'}</span></div>
          <div className="modal-form__footer"><button className="button button--ghost" type="button" onClick={() => setOpen(false)}>Cancelar</button><button className="button button--primary" type="submit" disabled={submitting}>{submitting ? 'Creando…' : 'Crear cuenta'}</button></div>
        </form>
      </Modal>
    </div>
  )
}
