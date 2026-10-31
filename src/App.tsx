'use client';

import { useState } from 'react';
import Sidebar from './components/Sidebar';
import PatientView from './components/PatientView';
import ChatPanel from './components/ChatPanel';
import Dashboard from './components/Dashboard';
import CalendarView from './components/CalendarView';
import SuperAdminDashboard from './components/SuperAdminDashboard';
import LandingPage from './components/LandingPage';
import ModulesPage from './components/ModulesPage';
import FinanzasView from './components/FinanzasView';
import ReportesView from './components/ReportesView';
import ConfiguracionView from './components/ConfiguracionView';

type View = 'dashboard' | 'pacientes' | 'calendario' | 'finanzas' | 'inventario' | 'reportes' | 'configuracion';
type AppMode = 'landing' | 'clinic' | 'superadmin';

const viewTitles: Record<View, string> = {
  dashboard:     'Dashboard',
  pacientes:     'Mis Pacientes',
  calendario:    'Calendario Clínico',
  finanzas:      'Finanzas',
  inventario:    'Inventario',
  reportes:      'Reportes',
  configuracion: 'Configuración',
};

function Placeholder({ view }: { view: View }) {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: '#EFF6FF' }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1A4F8A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-slate-800 mb-1">{viewTitles[view]}</h2>
        <p className="text-sm text-slate-400">Módulo disponible en la versión completa</p>
      </div>
    </div>
  );
}

export default function App() {
  const [mode, setMode] = useState<AppMode>('landing');
  const [view, setView] = useState<View>('dashboard');
  const [chatCollapsed, setChatCollapsed] = useState(false);
  const [calendarPatient, setCalendarPatient] = useState<{ name: string; isNew: boolean } | null>(null);
  const [calendarNavKey, setCalendarNavKey] = useState(0);

  if (mode === 'landing') {
    return <LandingPage onEnterApp={() => setMode('clinic')} />;
  }

  if (mode === 'superadmin') {
    return (
      <div className="flex flex-col h-full overflow-hidden">
        <SuperAdminDashboard />
        {/* Mode switch fab */}
        <button
          onClick={() => setMode('clinic')}
          className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-2.5 rounded-full shadow-lg text-sm font-semibold transition-all hover:shadow-xl hover:-translate-y-0.5"
          style={{ background: '#0C1E38', color: '#60A5FA', border: '1px solid rgba(96,165,250,0.3)' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Vista Clínica
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-full overflow-hidden" style={{ background: '#F0F4F8' }}>
      <Sidebar activeView={view} onViewChange={setView} />

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="flex-shrink-0 h-12 flex items-center justify-between px-5 border-b" style={{ background: '#FFFFFF', borderColor: '#E2E8F0' }}>
          <div className="flex items-center gap-2">
            <h1 className="font-semibold text-slate-800 text-sm">{viewTitles[view]}</h1>
            <span className="text-slate-300">/</span>
            <span className="text-xs text-slate-400">
              {view === 'pacientes' ? 'Carlos R. Mamani Quispe' : 'Vista general'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Global search */}
            <div className="relative hidden md:block">
              <svg className="absolute left-2.5 top-1.5" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                placeholder="Buscar paciente, cita..."
                className="pl-8 pr-3 py-1.5 text-xs rounded-md border focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{ borderColor: '#E2E8F0', background: '#F8FAFC', width: '200px' }}
              />
            </div>

            {/* Notification bell */}
            <button className="relative w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-100 transition-colors text-slate-500">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 border border-white" />
            </button>

            {/* Toggle chat */}
            <button
              onClick={() => setChatCollapsed(!chatCollapsed)}
              title="WhatsApp Inbox"
              className="relative w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-100 transition-colors text-slate-500"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-green-500 border border-white" />
            </button>

            <div className="w-px h-5 mx-1" style={{ background: '#E2E8F0' }} />

            {/* Back to landing */}
            <button
              onClick={() => setMode('landing')}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors hover:bg-slate-100"
              style={{ color: '#64748B', border: '1px solid #E2E8F0' }}
            >
              ← Inicio
            </button>

            {/* Switch to Super Admin */}
            <button
              onClick={() => setMode('superadmin')}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors hover:bg-purple-50"
              style={{ color: '#6D28D9', border: '1px solid #DDD6FE', background: '#F5F3FF' }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              Super Admin
            </button>

            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background: 'linear-gradient(135deg, #1D5B9E, #3B82F6)' }}>
                JP
              </div>
              <span className="text-xs font-medium text-slate-600 hidden md:block">Dr. Pérez</span>
            </div>
          </div>
        </header>

        {/* Content — horizontal flex: main area fills remaining width, chat panel is fixed in flow */}
        <div className="flex flex-1 min-h-0 overflow-hidden">
          {/* Main content: flex-grow fills all space left by chat panel */}
          <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
            {view === 'dashboard'    && <Dashboard onViewChange={(v) => setView(v)} />}
            {view === 'pacientes'    && <PatientView key={calendarNavKey} calendarPatient={calendarPatient} />}
            {view === 'calendario'   && <CalendarView onOpenPatient={(name, isNew) => { setCalendarPatient({ name, isNew }); setCalendarNavKey(k => k + 1); setView('pacientes'); }} />}
            {view === 'inventario'   && <ModulesPage />}
            {view === 'finanzas'     && <FinanzasView />}
            {view === 'reportes'     && <ReportesView />}
            {view === 'configuracion' && <ConfiguracionView />}
          </div>
          {/* Chat panel: fixed width in normal flow — never overlaps main content */}
          <ChatPanel collapsed={chatCollapsed} onToggle={() => setChatCollapsed(!chatCollapsed)} />
        </div>
      </div>
    </div>
  );
}
