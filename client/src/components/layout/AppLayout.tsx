import { createContext, useContext } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { AppNavbar } from './AppNavbar'
import { useSettings } from '@/hooks/useSettings'

interface DarkModeCtx {
  dark: boolean
  toggleDark: () => void
}

export const DarkModeContext = createContext<DarkModeCtx>({ dark: false, toggleDark: () => {} })
export const useDarkMode = () => useContext(DarkModeContext)

export function AppLayout() {
  const location = useLocation()
  const { settings, updateSettings } = useSettings()
  const dark = settings.darkMode
  const toggleDark = () => updateSettings({ darkMode: !dark })

  // Active conversation runtimes get a slimmed nav (no link bar).
  // /practice/custom is the setup screen, NOT a conversation, so keep full nav.
  const path = location.pathname
  const fullBleed =
    (/^\/practice\/[^/]+$/.test(path) && path !== '/practice/custom') ||
    /^\/lessons\/[^/]+$/.test(path)

  return (
    <DarkModeContext.Provider value={{ dark, toggleDark }}>
      <div style={{ minHeight: '100vh', background: 'var(--sem-surface)' }}>
        <AppNavbar minimal={fullBleed} />
        <main style={{
          paddingTop: 64,
          minHeight: '100vh',
        }}>
          <Outlet />
        </main>
      </div>
    </DarkModeContext.Provider>
  )
}
