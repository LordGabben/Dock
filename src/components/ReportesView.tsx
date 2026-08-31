import { useState } from 'react';

const MONTHS_SHORT = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

const APPT_DATA    = [42, 38, 51, 47, 63, 58, 44, 55, 61, 68, 72, 75];
const REVENUE_DATA = [14200, 12800, 17600, 15900, 21200, 19800, 16400, 20100, 22400, 24100, 23800, 24850];
const NEW_PATIENTS = [6, 4, 9, 7, 11, 8, 5, 10, 8, 13, 9, 12];

const TREATMENTS = [
  { label: 'Ortodoncia',     count: 48, pct: 29, color: '#3B82F6' },
  { label: 'Restauraciones', count: 34, pct: 21, color: '#8B5CF6' },
  { label: 'Limpieza',       count: 29, pct: 18, color: '#22C55E' },
  { label: 'Endodoncia',     count: 21, pct: 13, color: '#F59E0B' },
  { label: 'Cirugía',        count: 16, pct: 10, color: '#EF4444' },
  { label: 'Blanqueamiento', count: 10, pct: 6,  color: '#06B6D4' },
  { label: 'Otros',          count: 5,  pct: 3,  color: '#94A3B8' },
];

const TOP_PATIENTS = [
  { name: 'Carlos R. Mamani',  visitas: 14, gasto: 8400, tratamiento: 'Ortodoncia' },
  { name: 'María E. Condori',  visitas: 11, gasto: 5200, tratamiento: 'Implantes'  },
  { name: 'Roberto Vega',      visitas: 9,  gasto: 6800, tratamiento: 'Endodoncia' },
  { name: 'Patricia Luna',     visitas: 8,  gasto: 3900, tratamiento: 'Corona'     },
  { name: 'Ana S. Ríos',       visitas: 7,  gasto: 4100, tratamiento: 'Ortodoncia' },
];

const maxAppt    = Math.max(...APPT_DATA);
const maxRevenue = Math.max(...REVENUE_DATA);
const BAR_H = 90;

export default function ReportesView() {
  const [dateRange, setDateRange] = useState<'3m' | '6m' | '12m'>('12m');

  const sliceIdx = dateRange === '3m' ? 9 : dateRange === '6m' ? 6 : 0;
  const apptSlice    = APPT_DATA.slice(sliceIdx);
  const revenueSlice = REVENUE_DATA.slice(sliceIdx);
  const monthsSlice  = MONTHS_SHORT.slice(sliceIdx);

  const totalAppts   = apptSlice.reduce((a, b) => a + b, 0);
  const totalRev     = revenueSlice.reduce((a, b) => a + b, 0);
  const totalNew     = NEW_PATIENTS.slice(sliceIdx).reduce((a, b) => a + b, 0);
  const avgTicket    = Math.round(totalRev / totalAppts);

  return (
    <div className="h-full overflow-y-auto p-5 space-y-5">

      {/* Header row */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-800">Reportes de Gestión</h2>
          <p className="text-xs text-slate-400 mt-0.5">Análisis y métricas operativas de la clínica</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Date range */}
          <div className="flex rounded-lg overflow-hidden border text-xs" style={{ borderColor: '#E2E8F0' }}>
            {([['3m', 'Últimos 3 meses'], ['6m', 'Últimos 6 meses'], ['12m', 'Último año']] as const).map(([val, lbl]) => (
              <button key={val} onClick={() => setDateRange(val)}
                className="px-3 py-1.5 font-semibold transition-all whitespace-nowrap"
                style={{ background: dateRange === val ? '#0C1E38' : '#FFF', color: dateRange === val ? '#FFF' : '#64748B' }}>
                {lbl}
              </button>
            ))}
          </div>
          {/* Export */}
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border hover:bg-slate-50 transition-colors" style={{ borderColor: '#E2E8F0', color: '#475569' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Exportar PDF
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border hover:bg-slate-50 transition-colors" style={{ borderColor: '#E2E8F0', color: '#475569' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
            </svg>
            Excel
          </button>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Citas',        value: totalAppts,              suffix: '',   color: '#1A4F8A', bg: '#EFF6FF', icon: '📅', trend: '+14%' },
          { label: 'Ingresos Período',   value: `Bs. ${totalRev.toLocaleString()}`, suffix: '', color: '#15803D', bg: '#F0FDF4', icon: '💰', trend: '+18%' },
          { label: 'Pacientes Nuevos',   value: totalNew,                suffix: '',   color: '#7C3AED', bg: '#F5F3FF', icon: '👤', trend: '+9%'  },
          { label: 'Ticket Promedio',    value: `Bs. ${avgTicket.toLocaleString()}`, suffix: '', color: '#92400E', bg: '#FFFBEB', icon: '🎫', trend: '+3%'  },
        ].map(k => (
          <div key={k.label} className="bg-white rounded-xl border p-4" style={{ borderColor: '#E2E8F0' }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">{k.label}</span>
              <span className="text-xs font-bold px-1.5 py-0.5 rounded-full text-green-600" style={{ background: '#DCFCE7' }}>{k.trend}</span>
            </div>
            <div className="text-xl font-bold font-mono" style={{ color: k.color }}>{k.value}</div>
            <div className="text-xs text-slate-400 mt-1">vs periodo anterior</div>
          </div>
        ))}
      </div>

      {/* Two charts row */}
      <div className="grid grid-cols-2 gap-4">

        {/* Appointments chart */}
        <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: '#E2E8F0' }}>
          <div className="px-5 py-4 border-b" style={{ borderColor: '#EEF2F7', background: '#F8FAFD' }}>
            <h3 className="font-semibold text-slate-800 text-sm">Citas por Mes</h3>
            <p className="text-xs text-slate-400 mt-0.5">Total: {totalAppts} citas en el período</p>
          </div>
          <div className="px-5 py-5">
            <div className="flex items-end gap-1.5" style={{ height: BAR_H + 24 }}>
              {apptSlice.map((val, i) => {
                const h = Math.round((val / maxAppt) * BAR_H);
                const isMax = val === Math.max(...apptSlice);
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-0.5 group cursor-pointer">
                    <div className="w-full rounded-t transition-all group-hover:opacity-75 relative"
                      style={{ height: h, background: isMax ? 'linear-gradient(180deg, #60A5FA, #1A4F8A)' : '#DBEAFE',
                        boxShadow: isMax ? '0 0 10px rgba(59,130,246,0.3)' : undefined }}>
                      {isMax && (
                        <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-xs font-bold text-blue-600 whitespace-nowrap">{val}</div>
                      )}
                    </div>
                    <span style={{ fontSize: 9 }} className="text-slate-400 font-mono">{monthsSlice[i]}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Revenue trend */}
        <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: '#E2E8F0' }}>
          <div className="px-5 py-4 border-b" style={{ borderColor: '#EEF2F7', background: '#F8FAFD' }}>
            <h3 className="font-semibold text-slate-800 text-sm">Tendencia de Ingresos</h3>
            <p className="text-xs text-slate-400 mt-0.5">Total: Bs. {totalRev.toLocaleString()}</p>
          </div>
          <div className="px-5 py-5">
            {/* Line chart using SVG polyline */}
            <svg width="100%" height={BAR_H + 24} viewBox={`0 0 ${revenueSlice.length * 40} ${BAR_H + 24}`} preserveAspectRatio="none">
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
                </linearGradient>
              </defs>
              {/* Area fill */}
              <polyline
                fill="url(#revGrad)"
                stroke="none"
                points={[
                  ...revenueSlice.map((v, i) => `${i * 40 + 20},${BAR_H - Math.round((v / maxRevenue) * (BAR_H - 10))}`),
                  `${(revenueSlice.length - 1) * 40 + 20},${BAR_H}`,
                  `20,${BAR_H}`,
                ].join(' ')}
              />
              {/* Line */}
              <polyline
                fill="none" stroke="#1A4F8A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                points={revenueSlice.map((v, i) => `${i * 40 + 20},${BAR_H - Math.round((v / maxRevenue) * (BAR_H - 10))}`).join(' ')}
              />
              {/* Dots */}
              {revenueSlice.map((v, i) => (
                <circle key={i} cx={i * 40 + 20} cy={BAR_H - Math.round((v / maxRevenue) * (BAR_H - 10))}
                  r="3" fill="#1A4F8A" stroke="white" strokeWidth="1.5" />
              ))}
              {/* Month labels */}
              {monthsSlice.map((m, i) => (
                <text key={i} x={i * 40 + 20} y={BAR_H + 20} textAnchor="middle" style={{ fontSize: 9, fill: '#94A3B8' }}>{m}</text>
              ))}
            </svg>
          </div>
        </div>
      </div>

      {/* Treatment breakdown + Top patients */}
      <div className="grid grid-cols-5 gap-4">

        {/* Treatment horizontal bars */}
        <div className="col-span-2 bg-white rounded-xl border overflow-hidden" style={{ borderColor: '#E2E8F0' }}>
          <div className="px-5 py-4 border-b" style={{ borderColor: '#EEF2F7', background: '#F8FAFD' }}>
            <h3 className="font-semibold text-slate-800 text-sm">Tratamientos Realizados</h3>
            <p className="text-xs text-slate-400 mt-0.5">{TREATMENTS.reduce((a,t)=>a+t.count,0)} procedimientos en el período</p>
          </div>
          <div className="px-5 py-4 space-y-3">
            {TREATMENTS.map(t => (
              <div key={t.label}>
                <div className="flex justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-sm" style={{ background: t.color }} />
                    <span className="text-xs font-semibold text-slate-700">{t.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">{t.count} casos</span>
                    <span className="text-xs font-bold font-mono" style={{ color: t.color }}>{t.pct}%</span>
                  </div>
                </div>
                <div className="h-2 rounded-full" style={{ background: '#F1F5F9' }}>
                  <div className="h-2 rounded-full transition-all" style={{ width: `${t.pct}%`, background: t.color, opacity: 0.85 }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top patients */}
        <div className="col-span-3 bg-white rounded-xl border overflow-hidden" style={{ borderColor: '#E2E8F0' }}>
          <div className="px-5 py-4 border-b" style={{ borderColor: '#EEF2F7', background: '#F8FAFD' }}>
            <h3 className="font-semibold text-slate-800 text-sm">Top Pacientes por Valor</h3>
            <p className="text-xs text-slate-400 mt-0.5">Mayores ingresos generados en el período</p>
          </div>
          <table className="w-full text-xs">
            <thead>
              <tr style={{ borderBottom: '1px solid #F1F5F9', background: '#FAFBFC' }}>
                {['#', 'Paciente', 'Tratamiento Principal', 'Visitas', 'Total Gastado'].map(h => (
                  <th key={h} className="px-5 py-2.5 text-left font-semibold text-slate-500 uppercase tracking-wide" style={{ fontSize: 10 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TOP_PATIENTS.map((p, i) => (
                <tr key={i} className="border-b hover:bg-slate-50 transition-colors" style={{ borderColor: '#F8FAFC' }}>
                  <td className="px-5 py-3">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center text-white font-bold text-xs"
                      style={{ background: ['#1A4F8A','#7C3AED','#059669','#D97706','#DC2626'][i] }}>
                      {i + 1}
                    </div>
                  </td>
                  <td className="px-5 py-3 font-semibold text-slate-800">{p.name}</td>
                  <td className="px-5 py-3">
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: '#EFF6FF', color: '#1D4ED8' }}>{p.tratamiento}</span>
                  </td>
                  <td className="px-5 py-3 font-mono text-slate-600">{p.visitas}</td>
                  <td className="px-5 py-3 font-bold font-mono" style={{ color: '#1A4F8A' }}>Bs. {p.gasto.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-5 py-3 border-t flex items-center justify-between" style={{ borderColor: '#EEF2F7' }}>
            <span className="text-xs text-slate-400">Mostrando 5 de 47 pacientes</span>
            <button className="text-xs font-semibold text-blue-600 hover:underline">Ver reporte completo →</button>
          </div>
        </div>
      </div>

      {/* New patients by month */}
      <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: '#E2E8F0' }}>
        <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: '#EEF2F7', background: '#F8FAFD' }}>
          <div>
            <h3 className="font-semibold text-slate-800 text-sm">Adquisición de Nuevos Pacientes</h3>
            <p className="text-xs text-slate-400 mt-0.5">{totalNew} nuevos pacientes en el período seleccionado</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="w-3 h-3 rounded-sm inline-block" style={{ background: '#7C3AED' }} />
            Nuevos pacientes / mes
          </div>
        </div>
        <div className="px-5 py-5">
          <div className="flex items-end gap-3" style={{ height: 64 }}>
            {NEW_PATIENTS.slice(sliceIdx).map((val, i) => {
              const maxNew = Math.max(...NEW_PATIENTS.slice(sliceIdx));
              const h = Math.round((val / maxNew) * 56) + 8;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                  <span className="text-xs font-bold text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity">{val}</span>
                  <div className="w-full rounded-t" style={{ height: h, background: 'linear-gradient(180deg, #A78BFA, #7C3AED)', borderRadius: '4px 4px 0 0' }} />
                </div>
              );
            })}
          </div>
          <div className="flex gap-3 mt-1">
            {monthsSlice.map(m => (
              <div key={m} className="flex-1 text-center" style={{ fontSize: 9 }}>
                <span className="text-slate-400 font-mono">{m}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
