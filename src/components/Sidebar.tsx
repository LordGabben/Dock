import { useEffect, useState } from 'react'

type View =
  | 'dashboard'
  | 'pacientes'
  | 'calendario'
  | 'finanzas'
  | 'inventario'
  | 'reportes'
  | 'conocimiento'
  | 'configuracion'

interface SidebarProps {
  activeView: View
  onViewChange: (v: View) => void
}

const navItems: { id: View; label: string; icon: React.ReactNode }[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    id: 'calendario',
    label: 'Calendario Clínico',
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
  {
    id: 'pacientes',
    label: 'Mis Pacientes',
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    id: 'finanzas',
    label: 'Finanzas',
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
  },
  {
    id: 'inventario',
    label: 'Inventario',
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      </svg>
    ),
  },
  {
    id: 'reportes',
    label: 'Reportes',
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
  },
  {
    id: 'conocimiento',
    label: 'Base de Conocimientos',
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        <path d="M9 7h7M9 11h5" />
      </svg>
    ),
  },
  {
    id: 'configuracion',
    label: 'Configuración',
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
  },
]

export default function Sidebar({ activeView, onViewChange }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    setCollapsed(localStorage.getItem('dock-sidebar-collapsed') === 'true')
  }, [])

  const toggleCollapsed = () => {
    setCollapsed((current) => {
      const next = !current
      localStorage.setItem('dock-sidebar-collapsed', String(next))
      return next
    })
  }

  return (
    <aside
      className="relative flex-shrink-0 flex flex-col h-full transition-[width] duration-300"
      style={{ width: collapsed ? '68px' : '220px', background: '#0C1E38' }}
    >
      {/* Logo */}
      <div
        className={`py-5 border-b ${collapsed ? 'px-4' : 'px-5'}`}
        style={{ borderColor: 'rgba(255,255,255,0.07)' }}
      >
        <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-2.5'}`}>
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: '#3B82F6' }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2a7 7 0 0 1 7 7c0 5.25-7 13-7 13S5 14.25 5 9a7 7 0 0 1 7-7z" />
              <circle cx="12" cy="9" r="2.5" fill="white" stroke="none" />
            </svg>
          </div>
          {!collapsed && (
            <div>
              <div className="font-serif text-white text-lg leading-none tracking-wide">DOCK</div>
              <div
                className="text-xs mt-0.5"
                style={{ color: '#60A5FA', fontFamily: "'JetBrains Mono', monospace" }}
              >
                Clínica Dental
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Nav */}
      <nav className={`flex-1 py-4 space-y-0.5 overflow-y-auto ${collapsed ? 'px-2' : 'px-3'}`}>
        <div className={`px-2 pb-2 ${collapsed ? 'sr-only' : ''}`}>
          <span
            className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: 'rgba(255,255,255,0.25)', fontSize: '10px' }}
          >
            Principal
          </span>
        </div>
        {navItems.slice(0, 3).map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            title={collapsed ? item.label : undefined}
            aria-label={item.label}
            className={`nav-item w-full flex items-center rounded-md text-left text-sm transition-all ${
              collapsed ? 'justify-center px-2 py-2.5' : 'gap-3 px-3 py-2.5'
            } ${activeView === item.id ? 'nav-item-active' : 'text-slate-400'}`}
          >
            <span className={activeView === item.id ? 'text-blue-400' : 'text-slate-500'}>
              {item.icon}
            </span>
            {!collapsed && <span className="font-medium">{item.label}</span>}
            {item.id === 'pacientes' && !collapsed && (
              <span
                className="ml-auto text-xs font-mono rounded-full px-1.5 py-0.5"
                style={{ background: 'rgba(59,130,246,0.2)', color: '#60A5FA' }}
              >
                48
              </span>
            )}
          </button>
        ))}

        <div className={`px-2 pt-4 pb-2 ${collapsed ? 'sr-only' : ''}`}>
          <span
            className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: 'rgba(255,255,255,0.25)', fontSize: '10px' }}
          >
            Gestión
          </span>
        </div>
        {navItems.slice(3).map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            title={collapsed ? item.label : undefined}
            aria-label={item.label}
            className={`nav-item w-full flex items-center rounded-md text-left text-sm transition-all ${
              collapsed ? 'justify-center px-2 py-2.5' : 'gap-3 px-3 py-2.5'
            } ${activeView === item.id ? 'nav-item-active' : 'text-slate-400'}`}
          >
            <span className={activeView === item.id ? 'text-blue-400' : 'text-slate-500'}>
              {item.icon}
            </span>
            {!collapsed && <span className="font-medium">{item.label}</span>}
          </button>
        ))}
      </nav>

      {/* User Profile */}
      <div
        className={`${collapsed ? 'px-2' : 'px-3'} py-4 border-t`}
        style={{ borderColor: 'rgba(255,255,255,0.07)' }}
      >
        <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3 px-2'}`}>
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #1D5B9E, #3B82F6)' }}
          >
            JP
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <div className="text-sm font-semibold text-white truncate">Dr. J. Pérez</div>
              <div className="text-xs" style={{ color: '#60A5FA' }}>
                Admin · Odontólogo
              </div>
            </div>
          )}
          {!collapsed && (
            <button className="ml-auto text-slate-500 hover:text-slate-300 transition-colors flex-shrink-0">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      <button
        onClick={toggleCollapsed}
        title={collapsed ? 'Expandir menú' : 'Contraer menú'}
        aria-label={collapsed ? 'Expandir menú principal' : 'Contraer menú principal'}
        className="absolute -right-3 top-[68px] z-30 w-6 h-6 rounded-full border flex items-center justify-center shadow-sm transition-colors hover:bg-blue-50"
        style={{ background: '#FFFFFF', borderColor: '#CBD5E1', color: '#475569' }}
      >
        <svg
          width="11"
          height="11"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points={collapsed ? '9 18 15 12 9 6' : '15 18 9 12 15 6'} />
        </svg>
      </button>
    </aside>
  )
}
