import { CheckCircle2, Info, TriangleAlert, X } from 'lucide-react'
import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'

type ToastTone = 'success' | 'info' | 'warning'

interface ToastItem {
  id: number
  message: string
  tone: ToastTone
}

interface ToastContextValue {
  showToast: (message: string, tone?: ToastTone) => void
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const showToast = useCallback(
    (message: string, tone: ToastTone = 'success') => {
      const id = Date.now() + Math.floor(Math.random() * 1000)
      setToasts((current) => [...current, { id, message, tone }])
      window.setTimeout(() => dismiss(id), 4200)
    },
    [dismiss],
  )

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="toast-stack" aria-live="polite">
        {toasts.map((toast) => {
          const Icon = toast.tone === 'success' ? CheckCircle2 : toast.tone === 'warning' ? TriangleAlert : Info
          return (
            <div className={`toast toast--${toast.tone}`} key={toast.id}>
              <Icon size={19} />
              <span>{toast.message}</span>
              <button type="button" aria-label="Cerrar notificación" onClick={() => dismiss(toast.id)}>
                <X size={17} />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast must be used inside ToastProvider')
  return context
}
