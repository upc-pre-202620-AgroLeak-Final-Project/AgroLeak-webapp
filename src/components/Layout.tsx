import {
  Bell,
  Bot,
  Building2,
  ChevronDown,
  Droplets,
  Gauge,
  LayoutDashboard,
  LogOut,
  Menu,
  RadioTower,
  Users,
  X,
} from 'lucide-react'
import { useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { initials } from '../lib/format'
import { Badge } from './ui'
import { Logo } from './Logo'

const navigation = [
  { to: '/app', label: 'Resumen', icon: LayoutDashboard, exact: true },
  { to: '/app/riego', label: 'Riego', icon: Droplets },
  { to: '/app/alertas', label: 'Alertas', icon: Bell },
  { to: '/app/fincas', label: 'Fincas', icon: Building2 },
  { to: '/app/dispositivos', label: 'Dispositivos', icon: RadioTower },
  { to: '/app/vision', label: 'Visión IA', icon: Bot },
]

const titles: Record<string, string> = {
  '/app': 'Resumen operativo',
  '/app/riego': 'Control de riego',
  '/app/alertas': 'Centro de alertas',
  '/app/fincas': 'Fincas y parcelas',
  '/app/dispositivos': 'Dispositivos IoT',
  '/app/vision': 'Visión artificial',
  '/app/usuarios': 'Usuarios',
}

export function AppLayout() {
  const { user, isDemo, logout } = useAuth()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const items = user?.role === 'ADMIN'
    ? [...navigation, { to: '/app/usuarios', label: 'Usuarios', icon: Users }]
    : navigation

  const closeMenus = () => {
    setMobileOpen(false)
    setProfileOpen(false)
  }

  return (
    <div className="app-shell">
      {mobileOpen && <button className="sidebar-overlay" aria-label="Cerrar menú" onClick={() => setMobileOpen(false)} />}
      <aside className={`sidebar${mobileOpen ? ' sidebar--open' : ''}`}>
        <div className="sidebar__brand">
          <Logo light />
          <button className="sidebar__close" aria-label="Cerrar menú" onClick={() => setMobileOpen(false)}>
            <X size={21} />
          </button>
        </div>
        <div className="sidebar__context">
          <span>Espacio de trabajo</span>
          <strong>{user?.role === 'ADMIN' ? 'Administración global' : 'Operación agrícola'}</strong>
        </div>
        <nav className="sidebar__nav" aria-label="Navegación principal">
          <span className="sidebar__nav-label">MONITOREO</span>
          {items.map(({ to, label, icon: Icon, exact }) => (
            <NavLink
              key={to}
              to={to}
              end={exact}
              className={({ isActive }) => `sidebar__link${isActive ? ' sidebar__link--active' : ''}`}
              onClick={closeMenus}
            >
              <Icon size={19} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar__health">
          <div className="sidebar__health-icon">
            <Gauge size={21} />
          </div>
          <div>
            <strong>Sistema estable</strong>
            <span>Última sincronización: ahora</span>
          </div>
        </div>
        <div className="sidebar__footer">AgroLeak IoT · v0.1</div>
      </aside>

      <div className="app-main">
        <header className="topbar">
          <div className="topbar__left">
            <button className="mobile-menu-button" aria-label="Abrir menú" onClick={() => setMobileOpen(true)}>
              <Menu size={22} />
            </button>
            <div>
              <span className="topbar__breadcrumb">AgroLeak / Plataforma</span>
              <strong>{titles[location.pathname] ?? 'AgroLeak'}</strong>
            </div>
          </div>
          <div className="topbar__right">
            {isDemo && <Badge tone="amber" dot>Modo demo</Badge>}
            <div className="connection-status">
              <span />
              {isDemo ? 'Demo local' : 'API conectada'}
            </div>
            <div className="profile-menu">
              <button className="profile-menu__trigger" onClick={() => setProfileOpen((open) => !open)}>
                <span className="avatar">{initials(user?.fullName ?? 'AL')}</span>
                <span className="profile-menu__copy">
                  <strong>{user?.fullName}</strong>
                  <small>{user?.role === 'ADMIN' ? 'Administrador' : 'Productor'}</small>
                </span>
                <ChevronDown size={16} />
              </button>
              {profileOpen && (
                <div className="profile-menu__dropdown">
                  <div>
                    <strong>{user?.fullName}</strong>
                    <span>{user?.email}</span>
                  </div>
                  <button type="button" onClick={logout}>
                    <LogOut size={17} /> Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="page-content">
          <Outlet />
        </main>

        <nav className="mobile-bottom-nav" aria-label="Navegación móvil">
          {items.slice(0, 5).map(({ to, label, icon: Icon, exact }) => (
            <NavLink key={to} to={to} end={exact} className={({ isActive }) => (isActive ? 'active' : '')}>
              <Icon size={20} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  )
}
