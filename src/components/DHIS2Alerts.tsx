import React, { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { AlertBar } from '@dhis2/ui'

type AlertVariant = 'info' | 'success' | 'warning' | 'critical'

interface AlertMessage {
  id: string
  message: string
  variant: AlertVariant
  permanent?: boolean
}

interface AlertsContextValue {
  info: (message: string, options?: { permanent?: boolean }) => string
  success: (message: string, options?: { permanent?: boolean }) => string
  warning: (message: string, options?: { permanent?: boolean }) => string
  critical: (message: string, options?: { permanent?: boolean }) => string
  remove: (id: string) => void
  clearAll: () => void
}

const AlertsContext = createContext<AlertsContextValue | null>(null)

function generateId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

export function DHIS2AlertProvider({ children }: { children: React.ReactNode }) {
  const [alerts, setAlerts] = useState<AlertMessage[]>([])

  const remove = useCallback((id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id))
  }, [])

  const add = useCallback(
    (variant: AlertVariant, message: string, options?: { permanent?: boolean }) => {
      const id = generateId()
      const alert: AlertMessage = {
        id,
        message,
        variant,
        permanent: options?.permanent,
      }
      setAlerts((prev) => [...prev, alert])
      return id
    },
    []
  )

  const value = useMemo<AlertsContextValue>(
    () => ({
      info: (message, options) => add('info', message, options),
      success: (message, options) => add('success', message, options),
      warning: (message, options) => add('warning', message, options),
      critical: (message, options) => add('critical', message, options),
      remove,
      clearAll: () => setAlerts([]),
    }),
    [add, remove]
  )

  return (
    <AlertsContext.Provider value={value}>
      {children}
      <div style={{ position: 'fixed', right: 16, bottom: 16, display: 'flex', flexDirection: 'column', gap: 8, zIndex: 1000 }}>
        {alerts.map((a) => (
          <AlertBar
            key={a.id}
            onHidden={() => remove(a.id)}
            success={a.variant === 'success'}
            warning={a.variant === 'warning'}
            critical={a.variant === 'critical'}
            permanent={a.permanent}
          >
            {a.message}
          </AlertBar>
        ))}
      </div>
    </AlertsContext.Provider>
  )
}

export function useDHIS2Alerts(): AlertsContextValue {
  const ctx = useContext(AlertsContext)
  if (!ctx) throw new Error('useDHIS2Alerts must be used within DHIS2AlertProvider')
  return ctx
}


