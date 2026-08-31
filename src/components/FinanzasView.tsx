import { useState } from 'react';

const MONTHS = ['Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic', 'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'];

const INGRESOS  = [14200, 16800, 15400, 18900, 21200, 19800, 17600, 22400, 20100, 23800, 21500, 24850];
const EGRESOS   = [6800,  7200,  6500,  8100,  9400,  8600,  7800,  9200,  8500,  9800,  9100,  10200];

const TRANSACTIONS = [
  { id:1,  date:'12 Jun', patient:'Ana S. Ríos',       concept:'Ortodoncia — Cuota 3/12',          amount:400,  type:'ingreso',  method:'QR Bancario',   status:'cobrado' },
  { id:2,  date:'12 Jun', patient:'Carlos R. Mamani',  concept:'Blanqueamiento Dental',             amount:600,  type:'ingreso',  method:'Efectivo',      status:'cobrado' },
  { id:3,  date:'11 Jun', patient:'',                  concept:'Compra: Resina 3M A2 (x5)',         amount:425,  type:'egreso',   method:'Transferencia', status:'pagado'  },
  { id:4,  date:'11 Jun', patient:'Roberto Vega',       concept:'Endodoncia — Saldo pendiente',      amount:850,  type:'ingreso',  method:'Tarjeta',       status:'cobrado' },
  { id:5,  date:'10 Jun', patient:'',                   concept:'Alquiler consultorio — Junio',      amount:3200, type:'egreso',   method:'Transferencia', status:'pagado'  },
  { id:6,  date:'10 Jun', patient:'Patricia Luna',      concept:'Corona Porcelana — Cuota 2/3',     amount:400,  type:'ingreso',  method:'QR Bancario',   status:'cobrado' },
  { id:7,  date:'09 Jun', patient:'Diego Alvarado',     concept:'Limpieza + Detartraje',             amount:180,  type:'ingreso',  method:'Efectivo',      status:'cobrado' },
  { id:8,  date:'09 Jun', patient:'',                   concept:'Renovación: Software Rx Digital',  amount:890,  type:'egreso',   method:'Tarjeta',       status:'pagado'  },
  { id:9,  date:'08 Jun', patient:'María E. Condori',  concept:'Control Ortodoncia',                amount:200,  type:'ingreso',  method:'Efectivo',      status:'cobrado' },
  { id:10, date:'07 Jun', patient:'Juan P. Flores',     concept:'Extracción Molar — Urgencia',       amount:350,  type:'ingreso',  method:'Efectivo',      status:'cobrado' },
  { id:11, date:'06 Jun', patient:'Valentina Cruz',     concept:'Consulta + Presupuesto',            amount:80,   type:'ingreso',  method:'Efectivo',      status:'cobrado' },
  { id:12, date:'05 Jun', patient:'',                   concept:'Compra: Guantes látex (x10 cajas)', amount:450,  type:'egreso',   method:'Efectivo',      status:'pagado'  },
];

const DEUDAS = [
  { patient:'Carlos R. Mamani', tratamiento:'Ortodoncia Completa',   deuda:3600, cuotas:'3/12', vence:'15 Jul' },
  { patient:'Diego Alvarado',   tratamiento:'Blanqueamiento',         deuda:300,  cuotas:'1/2',  vence:'20 Jun' },
  { patient:'Patricia Luna',    tratamiento:'Corona Porcelana #26',  deuda:800,  cuotas:'1/3',  vence:'30 Jun' },
  { patient:'Roberto Vega',     tratamiento:'Implante Dental',        deuda:2400, cuotas:'2/6',  vence:'05 Jul' },
  { patient:'Ana S. Ríos',      tratamiento:'Ortodoncia — Brackets', deuda:4000, cuotas:'4/10', vence:'15 Jul' },
];

const TREAT_BREAKDOWN = [
  { label: 'Ortodoncia',    pct: 34, amount: 8450, color: '#3B82F6' },
  { label: 'Endodoncia',    pct: 18, amount: 4470, color: '#F59E0B' },
  { label: 'Cirugía',       pct: 15, amount: 3730, color: '#EF4444' },
  { label: 'Restauraciones',pct: 20, amount: 4970, color: '#8B5CF6' },
  { label: 'Limpiezas',     pct: 8,  amount: 1990, color: '#22C55E' },
  { label: 'Otros',         pct: 5,  amount: 1240, color: '#94A3B8' },
];

const fmt = (n: number) => `Bs. ${n.toLocaleString('es-BO')}`;

const maxBar = Math.max(...INGRESOS);
const BAR_H = 100;

export default function FinanzasView() {
  const [period, setPeriod] = useState<'mes' | 'trimestre' | 'año'>('año');
  const [txFilter, setTxFilter] = useState<'todos' | 'ingreso' | 'egreso'>('todos');

  const ingresosMes  = INGRESOS[INGRESOS.length - 1];
  const egresosMes   = EGRESOS[EGRESOS.length - 1];
  const utilidad     = ingresosMes - egresosMes;
  const totalDeuda   = DEUDAS.reduce((s, d) => s + d.deuda, 0);

  const filteredTx = TRANSACTIONS.filter(t => txFilter === 'todos' || t.type === txFilter);

  return (
    <div className="h-full overflow-y-auto p-5 space-y-5">

      {/* KPI row */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Ingresos del Mes',   value: fmt(ingresosMes),  sub: '+12% vs mayo',         color: '#1A4F8A', bg: '#EFF6FF', icon: '↑' },
          { label: 'Egresos del Mes',    value: fmt(egresosMes),   sub: 'Costos operativos',     color: '#B91C1C', bg: '#FEF2F2', icon: '↓' },
          { label: 'Utilidad Neta',      value: fmt(utilidad),     sub: 'Margen: 58.9%',         color: '#15803D', bg: '#F0FDF4', icon: '◎' },
          { label: 'Cuentas por Cobrar', value: fmt(totalDeuda),   sub: `${DEUDAS.length} pacientes`, color: '#92400E', bg: '#FFFBEB', icon: '⏳' },
        ].map(k => (
          <div key={k.label} className="bg-white rounded-xl border p-4 hover:shadow-sm transition-shadow" style={{ borderColor: '#E2E8F0' }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">{k.label}</span>
              <span className="text-sm font-bold w-7 h-7 flex items-center justify-center rounded-lg" style={{ background: k.bg, color: k.color }}>{k.icon}</span>
            </div>
            <div className="text-xl font-bold font-mono" style={{ color: k.color }}>{k.value}</div>
            <div className="text-xs text-slate-400 mt-1">{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Revenue chart + breakdown */}
      <div className="grid grid-cols-3 gap-4">

        {/* Bar chart */}
        <div className="col-span-2 bg-white rounded-xl border overflow-hidden" style={{ borderColor: '#E2E8F0' }}>
          <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: '#EEF2F7', background: '#F8FAFD' }}>
            <div>
              <h3 className="font-semibold text-slate-800 text-sm">Ingresos vs Egresos</h3>
              <p className="text-xs text-slate-400 mt-0.5">Últimos 12 meses · Bs.</p>
            </div>
            <div className="flex rounded-lg overflow-hidden border text-xs" style={{ borderColor: '#E2E8F0' }}>
              {(['mes', 'trimestre', 'año'] as const).map(p => (
                <button key={p} onClick={() => setPeriod(p)}
                  className="px-3 py-1.5 capitalize font-semibold transition-all"
                  style={{ background: period === p ? '#1A4F8A' : '#FFFFFF', color: period === p ? '#FFF' : '#64748B' }}>
                  {p === 'mes' ? 'Mes' : p === 'trimestre' ? 'Trimestre' : 'Año'}
                </button>
              ))}
            </div>
          </div>
          <div className="px-5 py-5">
            {/* Legend */}
            <div className="flex gap-4 mb-4">
              {[{ color: '#1A4F8A', label: 'Ingresos' }, { color: '#E2E8F0', label: 'Egresos' }].map(l => (
                <div key={l.label} className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-sm" style={{ background: l.color }} />
                  <span className="text-xs text-slate-500">{l.label}</span>
                </div>
              ))}
            </div>
            {/* Bars */}
            <div className="flex items-end gap-2" style={{ height: BAR_H + 28 }}>
              {MONTHS.map((m, i) => {
                const ingH = Math.round((INGRESOS[i] / maxBar) * BAR_H);
                const egH  = Math.round((EGRESOS[i]  / maxBar) * BAR_H);
                const isLast = i === MONTHS.length - 1;
                return (
                  <div key={m} className="flex-1 flex flex-col items-center gap-0.5 group cursor-pointer">
                    <div className="flex items-end gap-0.5 w-full" style={{ height: BAR_H }}>
                      <div className="flex-1 rounded-t transition-all group-hover:opacity-80"
                        style={{ height: ingH, background: isLast ? 'linear-gradient(180deg, #3B82F6, #1A4F8A)' : '#DBEAFE',
                          boxShadow: isLast ? '0 0 8px rgba(59,130,246,0.35)' : undefined }} />
                      <div className="flex-1 rounded-t transition-all group-hover:opacity-80"
                        style={{ height: egH, background: isLast ? '#CBD5E1' : '#F1F5F9' }} />
                    </div>
                    <span className="text-xs font-mono text-slate-400" style={{ fontSize: 9 }}>{m}</span>
                  </div>
                );
              })}
            </div>
            {/* Current month callout */}
            <div className="mt-4 flex gap-4 p-3 rounded-xl" style={{ background: '#F0F6FF', border: '1px solid #DBEAFE' }}>
              <div>
                <div className="text-xs text-slate-500 mb-0.5">Mejor mes: Mayo</div>
                <div className="font-bold font-mono text-blue-700">Bs. 24,850</div>
              </div>
              <div className="w-px" style={{ background: '#BFDBFE' }} />
              <div>
                <div className="text-xs text-slate-500 mb-0.5">Promedio mensual</div>
                <div className="font-bold font-mono text-slate-700">Bs. {Math.round(INGRESOS.reduce((a,b)=>a+b)/INGRESOS.length).toLocaleString()}</div>
              </div>
              <div className="w-px" style={{ background: '#BFDBFE' }} />
              <div>
                <div className="text-xs text-slate-500 mb-0.5">Total anual</div>
                <div className="font-bold font-mono text-slate-700">Bs. {INGRESOS.reduce((a,b)=>a+b).toLocaleString()}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Donut / treatment breakdown */}
        <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: '#E2E8F0' }}>
          <div className="px-5 py-4 border-b" style={{ borderColor: '#EEF2F7', background: '#F8FAFD' }}>
            <h3 className="font-semibold text-slate-800 text-sm">Por Tratamiento</h3>
            <p className="text-xs text-slate-400 mt-0.5">Ingresos · Junio 2024</p>
          </div>
          <div className="px-5 py-4">
            {/* Visual donut via stacked segments */}
            <div className="flex justify-center mb-5">
              <div className="relative w-28 h-28">
                <svg width="112" height="112" viewBox="0 0 112 112">
                  {(() => {
                    let offset = 0;
                    const r = 42, cx = 56, cy = 56;
                    const circ = 2 * Math.PI * r;
                    return TREAT_BREAKDOWN.map((t, i) => {
                      const dash = (t.pct / 100) * circ;
                      const gap  = circ - dash;
                      const rot  = (offset / 100) * 360 - 90;
                      offset += t.pct;
                      return (
                        <circle key={i} cx={cx} cy={cy} r={r}
                          fill="none" stroke={t.color} strokeWidth="18"
                          strokeDasharray={`${dash} ${gap}`}
                          strokeDashoffset={0}
                          transform={`rotate(${rot} ${cx} ${cy})`}
                          opacity={0.9}
                        />
                      );
                    });
                  })()}
                  <circle cx="56" cy="56" r="28" fill="white" />
                  <text x="56" y="52" textAnchor="middle" className="font-mono font-bold" style={{ fontSize: 13, fill: '#1A4F8A' }}>58.9%</text>
                  <text x="56" y="66" textAnchor="middle" style={{ fontSize: 9, fill: '#94A3B8' }}>margen</text>
                </svg>
              </div>
            </div>
            <div className="space-y-2">
              {TREAT_BREAKDOWN.map(t => (
                <div key={t.label} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: t.color }} />
                  <span className="text-xs text-slate-600 flex-1">{t.label}</span>
                  <span className="text-xs font-semibold text-slate-500 font-mono">{t.pct}%</span>
                  <span className="text-xs font-bold font-mono" style={{ color: t.color, minWidth: 72, textAlign: 'right' }}>
                    Bs. {t.amount.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Transactions + Receivables */}
      <div className="grid grid-cols-5 gap-4">

        {/* Transactions */}
        <div className="col-span-3 bg-white rounded-xl border overflow-hidden" style={{ borderColor: '#E2E8F0' }}>
          <div className="px-5 py-3.5 border-b flex items-center justify-between" style={{ borderColor: '#EEF2F7', background: '#F8FAFD' }}>
            <h3 className="font-semibold text-slate-800 text-sm">Movimientos Recientes</h3>
            <div className="flex rounded-lg overflow-hidden border text-xs" style={{ borderColor: '#E2E8F0' }}>
              {(['todos', 'ingreso', 'egreso'] as const).map(f => (
                <button key={f} onClick={() => setTxFilter(f)}
                  className="px-2.5 py-1 capitalize font-semibold transition-all"
                  style={{ background: txFilter === f ? '#0C1E38' : '#FFF', color: txFilter === f ? '#FFF' : '#64748B' }}>
                  {f === 'todos' ? 'Todos' : f === 'ingreso' ? '↑ Ingresos' : '↓ Egresos'}
                </button>
              ))}
            </div>
          </div>
          <div className="overflow-y-auto" style={{ maxHeight: 340 }}>
            {filteredTx.map(tx => (
              <div key={tx.id} className="flex items-center gap-3 px-5 py-3 border-b hover:bg-slate-50 transition-colors" style={{ borderColor: '#F8FAFC' }}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm ${tx.type === 'ingreso' ? 'text-green-600' : 'text-red-500'}`}
                  style={{ background: tx.type === 'ingreso' ? '#F0FDF4' : '#FEF2F2' }}>
                  {tx.type === 'ingreso' ? '↑' : '↓'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-slate-800 truncate">{tx.concept}</div>
                  <div className="flex items-center gap-2 mt-0.5">
                    {tx.patient && <span className="text-xs text-slate-400">{tx.patient}</span>}
                    {tx.patient && <span className="text-slate-200">·</span>}
                    <span className="text-xs text-slate-400">{tx.method}</span>
                    <span className="text-slate-200">·</span>
                    <span className="text-xs text-slate-400 font-mono">{tx.date}</span>
                  </div>
                </div>
                <div className={`text-sm font-bold font-mono flex-shrink-0 ${tx.type === 'ingreso' ? 'text-green-600' : 'text-red-500'}`}>
                  {tx.type === 'ingreso' ? '+' : '-'}Bs. {tx.amount.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Accounts receivable */}
        <div className="col-span-2 bg-white rounded-xl border overflow-hidden" style={{ borderColor: '#E2E8F0' }}>
          <div className="px-5 py-3.5 border-b flex items-center justify-between" style={{ borderColor: '#EEF2F7', background: '#F8FAFD' }}>
            <div>
              <h3 className="font-semibold text-slate-800 text-sm">Cuentas por Cobrar</h3>
              <p className="text-xs text-slate-400 mt-0.5">{fmt(totalDeuda)} pendiente</p>
            </div>
            <button className="text-xs font-semibold text-blue-600 hover:underline">Ver todo</button>
          </div>
          <div className="divide-y" style={{ '--tw-divide-opacity': 1 } as React.CSSProperties}>
            {DEUDAS.map((d, i) => {
              const urgent = parseInt(d.vence.split(' ')[0]) <= 15 && d.vence.includes('Jun');
              return (
                <div key={i} className="px-5 py-3 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-slate-800 truncate">{d.patient}</div>
                      <div className="text-xs text-slate-400 truncate mt-0.5">{d.tratamiento}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-mono text-slate-400">Cuotas: {d.cuotas}</span>
                        <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${urgent ? 'text-red-600 bg-red-50' : 'text-amber-600 bg-amber-50'}`}>
                          Vence {d.vence}
                        </span>
                      </div>
                    </div>
                    <div className="text-sm font-bold font-mono flex-shrink-0" style={{ color: '#92400E' }}>
                      Bs. {d.deuda.toLocaleString()}
                    </div>
                  </div>
                  {/* Mini progress */}
                  <div className="mt-2 h-1 rounded-full" style={{ background: '#F1F5F9' }}>
                    <div className="h-1 rounded-full" style={{ width: `${100 - (d.deuda / 5000) * 100}%`, background: '#1A4F8A' }} />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="px-5 py-3 border-t" style={{ borderColor: '#EEF2F7' }}>
            <button className="w-full py-2 text-xs font-semibold rounded-lg border hover:bg-slate-50 transition-colors" style={{ borderColor: '#E2E8F0', color: '#475569' }}>
              Generar Recordatorios de Cobro
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
