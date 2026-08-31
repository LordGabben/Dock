import { useState } from 'react';

type Plan = 'Free' | 'Pro' | 'Enterprise';
type Status = 'Activo' | 'Suspendido' | 'Trial';

interface Tenant {
  id: number;
  clinic: string;
  owner: string;
  city: string;
  plan: Plan;
  status: Status;
  mrr: number;
  aiUsed: number;
  aiQuota: number;
  patients: number;
  since: string;
}

const TENANTS: Tenant[] = [
  { id:1,  clinic:'Odontología Pérez',       owner:'Dr. Juan Pérez',       city:'La Paz',        plan:'Enterprise', status:'Activo',     mrr:299, aiUsed:4820, aiQuota:10000, patients:342, since:'Jan 2024' },
  { id:2,  clinic:'Clínica Dental Arce',     owner:'Dra. María Arce',      city:'Cochabamba',    plan:'Pro',        status:'Activo',     mrr:99,  aiUsed:1230, aiQuota:3000,  patients:178, since:'Feb 2024' },
  { id:3,  clinic:'SmileCare Bolivia',       owner:'Dr. Luis Torrico',     city:'Santa Cruz',    plan:'Enterprise', status:'Activo',     mrr:299, aiUsed:8100, aiQuota:10000, patients:519, since:'Nov 2023' },
  { id:4,  clinic:'Centro Oral del Norte',   owner:'Dra. Ana Salinas',     city:'Oruro',         plan:'Free',       status:'Trial',      mrr:0,   aiUsed:89,   aiQuota:200,   patients:24,  since:'Mar 2024' },
  { id:5,  clinic:'Dental Express Sopocachi',owner:'Dr. René Flores',      city:'La Paz',        plan:'Pro',        status:'Activo',     mrr:99,  aiUsed:2450, aiQuota:3000,  patients:211, since:'Dec 2023' },
  { id:6,  clinic:'Clínica Inti Dent',       owner:'Dra. Carmen Quispe',   city:'El Alto',       plan:'Pro',        status:'Suspendido', mrr:0,   aiUsed:0,    aiQuota:3000,  patients:95,  since:'Oct 2023' },
  { id:7,  clinic:'OrtoPlaza Bolivia',       owner:'Dr. Pablo Mendoza',    city:'Santa Cruz',    plan:'Enterprise', status:'Activo',     mrr:299, aiUsed:6340, aiQuota:10000, patients:408, since:'Sep 2023' },
  { id:8,  clinic:'Sonrisa Perfecta',        owner:'Dra. Valeria Luna',    city:'Sucre',         plan:'Free',       status:'Trial',      mrr:0,   aiUsed:142,  aiQuota:200,   patients:31,  since:'Mar 2024' },
  { id:9,  clinic:'Denticenter Andino',      owner:'Dr. Marco Ibáñez',     city:'Tarija',        plan:'Pro',        status:'Activo',     mrr:99,  aiUsed:1880, aiQuota:3000,  patients:156, since:'Jan 2024' },
  { id:10, clinic:'Clinica Oral Beni',       owner:'Dra. Patricia Soliz',  city:'Trinidad',      plan:'Free',       status:'Activo',     mrr:0,   aiUsed:55,   aiQuota:200,   patients:18,  since:'Mar 2024' },
];

const PLAN_CFG: Record<Plan, { color: string; bg: string; border: string }> = {
  Free:       { color: '#64748B', bg: '#F1F5F9', border: '#CBD5E1' },
  Pro:        { color: '#1D4ED8', bg: '#EFF6FF', border: '#BFDBFE' },
  Enterprise: { color: '#6D28D9', bg: '#F5F3FF', border: '#DDD6FE' },
};

const STATUS_CFG: Record<Status, { color: string; bg: string; dot: string }> = {
  Activo:     { color: '#15803D', bg: '#F0FDF4', dot: '#22C55E' },
  Suspendido: { color: '#B91C1C', bg: '#FEF2F2', dot: '#EF4444' },
  Trial:      { color: '#92400E', bg: '#FFFBEB', dot: '#F59E0B' },
};

const fmt = (n: number, prefix = '') => `${prefix}${n.toLocaleString('en-US')}`;

export default function SuperAdminDashboard() {
  const [filter, setFilter] = useState<'all' | Plan | Status>('all');
  const [editModal, setEditModal] = useState<Tenant | null>(null);
  const [disableModal, setDisableModal] = useState<Tenant | null>(null);

  const totalMRR     = TENANTS.reduce((s, t) => s + t.mrr, 0);
  const totalActive  = TENANTS.filter(t => t.status === 'Activo').length;
  const totalMsgs    = TENANTS.reduce((s, t) => s + t.aiUsed, 0);
  const totalBots    = TENANTS.filter(t => t.status === 'Activo' && t.plan !== 'Free').length;
  const totalPatients= TENANTS.reduce((s, t) => s + t.patients, 0);

  const filtered = TENANTS.filter(t => {
    if (filter === 'all') return true;
    return t.plan === filter || t.status === filter;
  });

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ background: '#F0F4F8' }}>
      {/* Super Admin Header */}
      <header className="flex-shrink-0 h-14 flex items-center justify-between px-6 border-b shadow-sm" style={{ background: '#0C1E38', borderColor: 'rgba(255,255,255,0.07)' }}>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: '#3B82F6' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a7 7 0 0 1 7 7c0 5.25-7 13-7 13S5 14.25 5 9a7 7 0 0 1 7-7z" />
                <circle cx="12" cy="9" r="2.5" fill="white" stroke="none" />
              </svg>
            </div>
            <span className="font-serif text-white text-base tracking-wide">DOCK</span>
          </div>
          <div className="w-px h-4 mx-1" style={{ background: 'rgba(255,255,255,0.2)' }} />
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: 'rgba(139,92,246,0.3)', color: '#C4B5FD' }}>
            ⚡ Super Admin Portal
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button className="text-xs font-semibold px-3 py-1.5 rounded-md transition-colors" style={{ background: 'rgba(255,255,255,0.08)', color: '#CBD5E1' }}>
            Documentación API
          </button>
          <button className="text-xs font-semibold px-3 py-1.5 rounded-md transition-colors" style={{ background: 'rgba(255,255,255,0.08)', color: '#CBD5E1' }}>
            Configuración Global
          </button>
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background: 'linear-gradient(135deg, #7C3AED, #4F46E5)' }}>
            SA
          </div>
          <div className="text-right">
            <div className="text-xs font-semibold text-white">SaaS Admin</div>
            <div className="text-xs" style={{ color: '#A78BFA' }}>admin@dock.bo</div>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        {/* Global KPI Cards */}
        <div className="grid grid-cols-5 gap-4">
          {[
            {
              label: 'Clínicas Activas',
              value: fmt(totalActive),
              sub: `de ${TENANTS.length} registradas`,
              icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
                </svg>
              ),
              color: '#1A4F8A', bg: '#EFF6FF', trend: '+2 este mes',
            },
            {
              label: 'MRR',
              value: `$${fmt(totalMRR)}`,
              sub: 'Ingresos recurrentes/mes',
              icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              ),
              color: '#15803D', bg: '#F0FDF4', trend: '+18% vs mes anterior',
            },
            {
              label: 'Mensajes WhatsApp',
              value: fmt(totalMsgs),
              sub: 'Total enviados por IA',
              icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              ),
              color: '#25D366', bg: '#F0FDF4', trend: 'Este mes: +3,241',
            },
            {
              label: 'Bots Activos',
              value: fmt(totalBots),
              sub: 'Asistentes IA en línea',
              icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /><circle cx="12" cy="16" r="1" />
                </svg>
              ),
              color: '#6D28D9', bg: '#F5F3FF', trend: '99.8% uptime',
            },
            {
              label: 'Total Pacientes',
              value: fmt(totalPatients),
              sub: 'En toda la plataforma',
              icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              ),
              color: '#0E7490', bg: '#ECFEFF', trend: '+47 esta semana',
            },
          ].map(kpi => (
            <div key={kpi.label} className="bg-white rounded-xl border p-4 hover:shadow-sm transition-shadow" style={{ borderColor: '#E2E8F0' }}>
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: kpi.bg, color: kpi.color }}>
                  {kpi.icon}
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: '#F0FDF4', color: '#15803D' }}>↑</span>
              </div>
              <div className="text-2xl font-bold font-mono" style={{ color: kpi.color }}>{kpi.value}</div>
              <div className="text-xs text-slate-500 mt-0.5">{kpi.sub}</div>
              <div className="text-xs font-semibold mt-2" style={{ color: '#22C55E' }}>{kpi.trend}</div>
            </div>
          ))}
        </div>

        {/* Revenue breakdown */}
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2 bg-white rounded-xl border overflow-hidden" style={{ borderColor: '#E2E8F0' }}>
            <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: '#EEF2F7', background: '#F8FAFD' }}>
              <h3 className="font-semibold text-slate-800 text-sm">Desglose de Ingresos por Plan</h3>
            </div>
            <div className="p-5 flex items-end gap-6">
              {[
                { label: 'Enterprise', count: TENANTS.filter(t=>t.plan==='Enterprise').length, mrr: TENANTS.filter(t=>t.plan==='Enterprise').reduce((s,t)=>s+t.mrr,0), color: '#6D28D9', pct: 80 },
                { label: 'Pro', count: TENANTS.filter(t=>t.plan==='Pro').length, mrr: TENANTS.filter(t=>t.plan==='Pro').reduce((s,t)=>s+t.mrr,0), color: '#1D4ED8', pct: 50 },
                { label: 'Free / Trial', count: TENANTS.filter(t=>t.plan==='Free').length, mrr: 0, color: '#94A3B8', pct: 20 },
              ].map(p => (
                <div key={p.label} className="flex-1 flex flex-col items-center gap-2">
                  <div className="text-sm font-bold font-mono" style={{ color: p.color }}>${fmt(p.mrr)}/mes</div>
                  <div className="w-full rounded-t-lg" style={{ height: `${p.pct * 1.6}px`, background: p.color, opacity: 0.85 }} />
                  <div className="text-xs font-semibold text-slate-600">{p.label}</div>
                  <div className="text-xs text-slate-400">{p.count} clínicas</div>
                </div>
              ))}
              <div className="flex-1 flex flex-col gap-4 pl-6 border-l" style={{ borderColor: '#E2E8F0' }}>
                <div>
                  <div className="text-xs text-slate-500 mb-1">ARR Proyectado</div>
                  <div className="text-2xl font-bold font-mono" style={{ color: '#1A4F8A' }}>${fmt(totalMRR * 12)}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 mb-1">Churn Rate</div>
                  <div className="text-xl font-bold font-mono text-green-600">1.8%</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 mb-1">LTV Promedio</div>
                  <div className="text-xl font-bold font-mono" style={{ color: '#6D28D9' }}>$2,340</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: '#E2E8F0' }}>
            <div className="px-5 py-4 border-b" style={{ borderColor: '#EEF2F7', background: '#F8FAFD' }}>
              <h3 className="font-semibold text-slate-800 text-sm">Alertas del Sistema</h3>
            </div>
            <div className="divide-y" style={{ '--tw-divide-opacity': 1 } as React.CSSProperties}>
              {[
                { level: 'error',   msg: 'Clínica Inti Dent suspendida por impago', time: '2h' },
                { level: 'warning', msg: 'Centro Oral del Norte: cuota IA al 89%', time: '5h' },
                { level: 'warning', msg: 'SmileCare Bolivia: cuota IA al 81%', time: '1d' },
                { level: 'info',    msg: 'Sonrisa Perfecta: trial expira en 5 días', time: '1d' },
                { level: 'success', msg: 'Pago Enterprise de OrtoPlaza confirmado', time: '2d' },
              ].map((a, i) => {
                const cfg = a.level === 'error' ? { dot: '#EF4444', bg: '#FEF2F2' } :
                            a.level === 'warning' ? { dot: '#F59E0B', bg: '#FFFBEB' } :
                            a.level === 'success' ? { dot: '#22C55E', bg: '#F0FDF4' } :
                            { dot: '#60A5FA', bg: '#EFF6FF' };
                return (
                  <div key={i} className="flex items-start gap-3 px-5 py-3" style={{ background: cfg.bg }}>
                    <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: cfg.dot }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-700 leading-snug">{a.msg}</p>
                      <p className="text-xs text-slate-400 mt-0.5">Hace {a.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Tenant table */}
        <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: '#E2E8F0' }}>
          <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: '#EEF2F7', background: '#F8FAFD' }}>
            <div>
              <h3 className="font-semibold text-slate-800 text-sm">Gestión de Tenants</h3>
              <p className="text-xs text-slate-400 mt-0.5">{TENANTS.length} clínicas registradas en la plataforma</p>
            </div>
            <div className="flex items-center gap-2">
              {/* Filters */}
              <div className="flex rounded-lg overflow-hidden border text-xs" style={{ borderColor: '#E2E8F0' }}>
                {[
                  { id: 'all', label: 'Todas' },
                  { id: 'Enterprise', label: 'Enterprise' },
                  { id: 'Pro', label: 'Pro' },
                  { id: 'Free', label: 'Free' },
                  { id: 'Suspendido', label: 'Suspendidas' },
                ].map(f => (
                  <button
                    key={f.id}
                    onClick={() => setFilter(f.id as typeof filter)}
                    className="px-3 py-1.5 font-semibold transition-all"
                    style={{
                      background: filter === f.id ? '#0C1E38' : '#FFFFFF',
                      color: filter === f.id ? '#FFFFFF' : '#64748B',
                    }}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
              <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white rounded-md transition-opacity hover:opacity-90" style={{ background: '#1A4F8A' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Nueva Clínica
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: '#F8FAFD' }}>
                  {['Clínica / Propietario', 'Ciudad', 'Plan', 'Estado', 'MRR', 'Uso IA', 'Pacientes', 'Desde', 'Acciones'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide" style={{ color: '#64748B' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(t => {
                  const planCfg   = PLAN_CFG[t.plan];
                  const statusCfg = STATUS_CFG[t.status];
                  const aiPct     = Math.round((t.aiUsed / t.aiQuota) * 100);
                  const aiColor   = aiPct > 80 ? '#B91C1C' : aiPct > 60 ? '#D97706' : '#15803D';
                  return (
                    <tr key={t.id} className="border-t hover:bg-slate-50 transition-colors" style={{ borderColor: '#EEF2F7' }}>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ background: '#1A4F8A' }}>
                            {t.clinic.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-800 leading-tight">{t.clinic}</div>
                            <div className="text-xs text-slate-400">{t.owner}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-slate-600">{t.city}</td>
                      <td className="px-4 py-3.5">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold" style={{ background: planCfg.bg, color: planCfg.color, border: `1px solid ${planCfg.border}` }}>
                          {t.plan}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold" style={{ background: statusCfg.bg, color: statusCfg.color }}>
                          <span className="w-1.5 h-1.5 rounded-full" style={{ background: statusCfg.dot }} />
                          {t.status}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 font-bold font-mono text-slate-700">${fmt(t.mrr)}</td>
                      <td className="px-4 py-3.5">
                        <div className="min-w-24">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="font-mono" style={{ color: aiColor }}>{aiPct}%</span>
                            <span className="text-slate-400 font-mono">{fmt(t.aiUsed)}/{fmt(t.aiQuota)}</span>
                          </div>
                          <div className="h-1.5 rounded-full" style={{ background: '#E2E8F0' }}>
                            <div className="h-1.5 rounded-full transition-all" style={{ width: `${Math.min(aiPct, 100)}%`, background: aiColor }} />
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 font-mono text-slate-600">{fmt(t.patients)}</td>
                      <td className="px-4 py-3.5 text-xs text-slate-400 font-mono">{t.since}</td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setEditModal(t)}
                            className="px-2.5 py-1 text-xs font-semibold rounded border hover:bg-blue-50 transition-colors"
                            style={{ borderColor: '#BFDBFE', color: '#1D4ED8' }}
                          >
                            Editar Plan
                          </button>
                          <button
                            onClick={() => setDisableModal(t)}
                            className="px-2.5 py-1 text-xs font-semibold rounded border hover:bg-red-50 transition-colors"
                            style={{ borderColor: '#FECACA', color: '#B91C1C' }}
                          >
                            {t.status === 'Suspendido' ? 'Reactivar' : 'Suspender'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Edit Plan Modal */}
      {editModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
            <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: '#EEF2F7' }}>
              <div>
                <h3 className="font-semibold text-slate-800">Editar Plan de Suscripción</h3>
                <p className="text-xs text-slate-400 mt-0.5">{editModal.clinic}</p>
              </div>
              <button onClick={() => setEditModal(null)} className="text-slate-400 hover:text-slate-600">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Plan</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Free', 'Pro', 'Enterprise'] as Plan[]).map(p => {
                    const cfg = PLAN_CFG[p];
                    const active = editModal.plan === p;
                    return (
                      <button key={p} className="p-3 rounded-lg border-2 text-center transition-all" style={{ borderColor: active ? cfg.color : '#E2E8F0', background: active ? cfg.bg : '#FFFFFF' }}>
                        <div className="text-sm font-bold" style={{ color: active ? cfg.color : '#64748B' }}>{p}</div>
                        <div className="text-xs text-slate-400 mt-0.5">{p === 'Free' ? '$0/mes' : p === 'Pro' ? '$99/mes' : '$299/mes'}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Cuota de Mensajes IA</label>
                <input type="number" defaultValue={editModal.aiQuota} className="w-full px-3 py-2 text-sm rounded border focus:outline-none focus:ring-2 focus:ring-blue-500" style={{ borderColor: '#D1D9E6' }} />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Nota interna</label>
                <textarea rows={2} placeholder="Ej: Descuento especial por volumen..." className="w-full px-3 py-2 text-sm rounded border focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" style={{ borderColor: '#D1D9E6' }} />
              </div>
            </div>
            <div className="px-6 py-4 border-t flex justify-end gap-2" style={{ borderColor: '#EEF2F7', background: '#F8FAFD' }}>
              <button onClick={() => setEditModal(null)} className="px-4 py-2 text-sm font-semibold rounded border hover:bg-slate-50 transition-colors" style={{ borderColor: '#D1D9E6', color: '#475569' }}>
                Cancelar
              </button>
              <button onClick={() => setEditModal(null)} className="px-4 py-2 text-sm font-semibold text-white rounded transition-opacity hover:opacity-90" style={{ background: '#1A4F8A' }}>
                Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Disable/Enable Modal */}
      {disableModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden">
            <div className="px-6 py-5">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: disableModal.status === 'Suspendido' ? '#F0FDF4' : '#FEF2F2' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={disableModal.status === 'Suspendido' ? '#15803D' : '#B91C1C'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  {disableModal.status === 'Suspendido'
                    ? <><polyline points="20 6 9 17 4 12" /></>
                    : <><circle cx="12" cy="12" r="10" /><line x1="4.93" y1="4.93" x2="19.07" y2="19.07" /></>
                  }
                </svg>
              </div>
              <h3 className="font-semibold text-slate-800 text-center text-base">
                {disableModal.status === 'Suspendido' ? 'Reactivar acceso' : 'Suspender acceso'}
              </h3>
              <p className="text-sm text-slate-500 text-center mt-2">
                {disableModal.status === 'Suspendido'
                  ? `¿Reactivar el acceso a ${disableModal.clinic}? Los datos se mantienen intactos.`
                  : `¿Suspender el acceso a ${disableModal.clinic}? El propietario no podrá iniciar sesión.`
                }
              </p>
            </div>
            <div className="px-6 pb-5 flex gap-3">
              <button onClick={() => setDisableModal(null)} className="flex-1 py-2 text-sm font-semibold rounded border hover:bg-slate-50 transition-colors" style={{ borderColor: '#D1D9E6', color: '#475569' }}>
                Cancelar
              </button>
              <button
                onClick={() => setDisableModal(null)}
                className="flex-1 py-2 text-sm font-semibold text-white rounded transition-opacity hover:opacity-90"
                style={{ background: disableModal.status === 'Suspendido' ? '#15803D' : '#B91C1C' }}
              >
                {disableModal.status === 'Suspendido' ? 'Sí, reactivar' : 'Sí, suspender'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
