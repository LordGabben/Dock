import { useState } from 'react';

interface Payment {
  id: number;
  tratamiento: string;
  costoTotal: number;
  cuotaInicial: number;
  saldo: number;
  fechas: string;
  estado: 'Pagado' | 'Pendiente' | 'Vencido';
}

const payments: Payment[] = [
  { id: 1, tratamiento: 'Ortodoncia Completa', costoTotal: 4800, cuotaInicial: 1200, saldo: 3600, fechas: '15/04/2024 · 15/05/2024', estado: 'Pendiente' },
  { id: 2, tratamiento: 'Extracción Molar #18', costoTotal: 350, cuotaInicial: 350, saldo: 0, fechas: '12/03/2024', estado: 'Pagado' },
  { id: 3, tratamiento: 'Blanqueamiento Dental', costoTotal: 600, cuotaInicial: 300, saldo: 300, fechas: '20/04/2024', estado: 'Vencido' },
  { id: 4, tratamiento: 'Limpieza Profesional + Fluor', costoTotal: 180, cuotaInicial: 180, saldo: 0, fechas: '12/03/2024', estado: 'Pagado' },
  { id: 5, tratamiento: 'Corona Porcelana #26', costoTotal: 1200, cuotaInicial: 400, saldo: 800, fechas: '30/04/2024 · 30/05/2024', estado: 'Pendiente' },
];

const estadoClass: Record<string, string> = {
  Pagado: 'chip-pagado',
  Pendiente: 'chip-pendiente',
  Vencido: 'chip-vencido',
};

const estadoIcon: Record<string, React.ReactNode> = {
  Pagado: <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>,
  Pendiente: <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>,
  Vencido: <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>,
};

const fmt = (n: number) => `Bs. ${n.toLocaleString('es-BO')}`;

export default function Financial() {
  const [showModal, setShowModal] = useState(false);

  const totalDeuda = payments.reduce((a, p) => a + p.saldo, 0);
  const totalCobrado = payments.reduce((a, p) => a + (p.costoTotal - p.saldo), 0);
  const totalGeneral = payments.reduce((a, p) => a + p.costoTotal, 0);
  const porcentaje = Math.round((totalCobrado / totalGeneral) * 100);

  return (
    <div className="space-y-5">
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Facturado', value: fmt(totalGeneral), color: '#1A4F8A', bg: '#EFF6FF', icon: '💼' },
          { label: 'Total Cobrado', value: fmt(totalCobrado), color: '#15803D', bg: '#F0FDF4', icon: '✓' },
          { label: 'Saldo Pendiente', value: fmt(totalDeuda), color: '#B45309', bg: '#FFFBEB', icon: '⏳' },
        ].map(({ label, value, color, bg, icon }) => (
          <div key={label} className="rounded-lg border p-4" style={{ background: bg, borderColor: '#E2E8F0' }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-slate-500">{label}</span>
              <span className="text-base">{icon}</span>
            </div>
            <div className="text-2xl font-bold" style={{ color, fontFamily: "'JetBrains Mono', monospace" }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="bg-white rounded-lg border p-4" style={{ borderColor: '#E2E8F0' }}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-slate-600">Avance de cobro</span>
          <span className="text-sm font-bold" style={{ color: '#1A4F8A', fontFamily: "'JetBrains Mono', monospace" }}>{porcentaje}%</span>
        </div>
        <div className="w-full h-2.5 rounded-full" style={{ background: '#E2E8F0' }}>
          <div className="h-2.5 rounded-full transition-all" style={{ width: `${porcentaje}%`, background: 'linear-gradient(to right, #1A4F8A, #3B82F6)' }} />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border overflow-hidden" style={{ borderColor: '#E2E8F0' }}>
        <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: '#EEF2F7' }}>
          <h3 className="font-semibold text-slate-800">Plan de Pagos</h3>
          <div className="flex gap-2">
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold rounded-md border transition-colors hover:bg-slate-50"
              style={{ borderColor: '#D1D9E6', color: '#475569' }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Añadir Pago
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-white rounded-md transition-opacity hover:opacity-90" style={{ background: '#1A4F8A' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
              </svg>
              Generar Recibo
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: '#F8FAFD' }}>
                {['Tratamiento', 'Costo Total', 'Cuota Inicial', 'Saldo', 'Fechas de Pago', 'Estado', ''].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: '#64748B' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {payments.map((p, i) => (
                <tr
                  key={p.id}
                  className="border-t hover:bg-slate-50 transition-colors"
                  style={{ borderColor: '#EEF2F7' }}
                >
                  <td className="px-4 py-3.5 font-medium text-slate-800">{p.tratamiento}</td>
                  <td className="px-4 py-3.5 font-mono text-slate-700">{fmt(p.costoTotal)}</td>
                  <td className="px-4 py-3.5 font-mono text-slate-700">{fmt(p.cuotaInicial)}</td>
                  <td className="px-4 py-3.5 font-mono font-semibold" style={{ color: p.saldo === 0 ? '#15803D' : p.estado === 'Vencido' ? '#B91C1C' : '#92400E' }}>
                    {fmt(p.saldo)}
                  </td>
                  <td className="px-4 py-3.5 text-slate-500 font-mono text-xs">{p.fechas}</td>
                  <td className="px-4 py-3.5">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${estadoClass[p.estado]}`}>
                      {estadoIcon[p.estado]}
                      {p.estado}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <button className="text-xs text-blue-600 hover:underline font-medium">Ver detalle</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
            <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: '#EEF2F7' }}>
              <h3 className="font-semibold text-slate-800">Registrar Nuevo Pago</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Tratamiento</label>
                <select className="w-full px-3 py-2 text-sm rounded border bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" style={{ borderColor: '#D1D9E6' }}>
                  <option>Ortodoncia Completa</option>
                  <option>Corona Porcelana #26</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Monto Bs.</label>
                  <input type="number" placeholder="0.00" className="w-full px-3 py-2 text-sm rounded border bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" style={{ borderColor: '#D1D9E6' }} />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Fecha</label>
                  <input type="date" className="w-full px-3 py-2 text-sm rounded border bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" style={{ borderColor: '#D1D9E6' }} />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Método de Pago</label>
                <select className="w-full px-3 py-2 text-sm rounded border bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" style={{ borderColor: '#D1D9E6' }}>
                  <option>Efectivo</option>
                  <option>Tarjeta de Débito</option>
                  <option>Transferencia Bancaria</option>
                  <option>QR Bancario</option>
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Notas</label>
                <textarea rows={2} className="w-full px-3 py-2 text-sm rounded border bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" style={{ borderColor: '#D1D9E6' }} />
              </div>
            </div>
            <div className="px-6 py-4 border-t flex justify-end gap-2" style={{ borderColor: '#EEF2F7', background: '#F8FAFD' }}>
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-semibold rounded border hover:bg-slate-50 transition-colors" style={{ borderColor: '#D1D9E6', color: '#475569' }}>
                Cancelar
              </button>
              <button className="px-4 py-2 text-sm font-semibold text-white rounded transition-opacity hover:opacity-90" style={{ background: '#1A4F8A' }}>
                Registrar Pago
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
