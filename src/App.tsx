import { LoaderCircle } from 'lucide-react'
import type { ReactNode } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { AppLayout } from './components/Layout'
import { useAuth } from './contexts/AuthContext'
import { AdminUsersPage } from './pages/AdminUsersPage'
import { AlertsPage } from './pages/AlertsPage'
import { DashboardPage } from './pages/DashboardPage'
import { DevicesPage } from './pages/DevicesPage'
import { FarmsPage } from './pages/FarmsPage'
import { IrrigationPage } from './pages/IrrigationPage'
import { LoginPage } from './pages/LoginPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { VisionPage } from './pages/VisionPage'

function FullPageLoader() {
  return (
    <div className="full-page-loader">
      <div className="full-page-loader__mark">
        <LoaderCircle className="spin" size={28} />
      </div>
      <strong>Preparando AgroLeak</strong>
      <span>Sincronizando tu espacio de trabajo…</span>
    </div>
  )
}

function RequireAuth({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth()
  const location = useLocation()
  if (isLoading) return <FullPageLoader />
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  return children
}

function RequireAdmin({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  if (user?.role !== 'ADMIN') return <Navigate to="/app" replace />
  return children
}

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/app"
        element={
          <RequireAuth>
            <AppLayout />
          </RequireAuth>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="riego" element={<IrrigationPage />} />
        <Route path="alertas" element={<AlertsPage />} />
        <Route path="fincas" element={<FarmsPage />} />
        <Route path="dispositivos" element={<DevicesPage />} />
        <Route path="vision" element={<VisionPage />} />
        <Route
          path="usuarios"
          element={
            <RequireAdmin>
              <AdminUsersPage />
            </RequireAdmin>
          }
        />
      </Route>
      <Route path="/" element={<Navigate to="/app" replace />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
