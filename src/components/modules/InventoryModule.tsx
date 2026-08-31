import { useState } from 'react';

type StockStatus = 'optimo' | 'comprar' | 'agotado';

interface InventoryItem {
  id: number;
  name: string;
  category: string;
  unit: string;
  stock: number;
  minIdeal: number;
  maxIdeal: number;
  costUnit: number;
  expiryDate?: string;
  supplier: string;
}

const INITIAL_ITEMS: InventoryItem[] = [
  { id:1,  name:'Anestesia Articaína 4%',        category:'Anestésicos',      unit:'Carpules',  stock:8,  minIdeal:30, maxIdeal:100, costUnit:12.50, expiryDate:'2024-06-15', supplier:'Dental Depot' },
  { id:2,  name:'Guantes de Látex Talla M',       category:'Protección',       unit:'Cajas',     stock:3,  minIdeal:10, maxIdeal:30,  costUnit:45.00,                          supplier:'MedSupply' },
  { id:3,  name:'Resina Compuesta A2 (Filtek)',   category:'Materiales',        unit:'Jeringas',  stock:22, minIdeal:10, maxIdeal:40,  costUnit:85.00, expiryDate:'2025-03-20', supplier:'3M ESPE' },
  { id:4,  name:'Ácido Ortofosfórico 37%',       category:'Materiales',        unit:'Frascos',   stock:0,  minIdeal:5,  maxIdeal:15,  costUnit:28.00, expiryDate:'2025-01-10', supplier:'Dental Depot' },
  { id:5,  name:'Mascarillas N95',                category:'Protección',       unit:'Cajas',     stock:15, minIdeal:8,  maxIdeal:25,  costUnit:120.00,                         supplier:'MedSupply' },
  { id:6,  name:'Hilo de Sutura Vicryl 3-0',     category:'Cirugía',          unit:'Cajas',     stock:4,  minIdeal:6,  maxIdeal:20,  costUnit:95.00, expiryDate:'2024-08-30', supplier:'Ethicon' },
  { id:7,  name:'Cemento de Ionómero Vítreo',    category:'Materiales',        unit:'Unidades',  stock:12, minIdeal:5,  maxIdeal:20,  costUnit:220.00,expiryDate:'2025-09-01', supplier:'GC Corp' },
  { id:8,  name:'Papel de Articular 40µ',        category:'Diagnóstico',       unit:'Paquetes',  stock:7,  minIdeal:5,  maxIdeal:15,  costUnit:18.50,                          supplier:'Bausch' },
  { id:9,  name:'Limas K-File #15-40',            category:'Endodoncia',       unit:'Cajas',     stock:2,  minIdeal:8,  maxIdeal:20,  costUnit:145.00,                         supplier:'VDW' },
  { id:10, name:'Sellador de Canales AH Plus',    category:'Endodoncia',       unit:'Kits',      stock:5,  minIdeal:4,  maxIdeal:12,  costUnit:280.00,expiryDate:'2025-04-15', supplier:'Dentsply' },
];

const CATEGORIES = ['Todas', 'Anestésicos', 'Protección', 'Materiales', 'Cirugía', 'Endodoncia', 'Diagnóstico'];

function getStatus(item: InventoryItem): StockStatus {
  if (item.stock === 0) return 'agotado';
  if (item.stock < item.minIdeal) return 'comprar';
  return 'optimo';
}

const STATUS_CFG: Record<StockStatus, { label: string; color: string; bg: string; border: string }> = {
  optimo:  { label: 'Óptimo',       color: '#15803D', bg: '#DCFCE7', border: '#86EFAC' },
  comprar: { label: 'Comprar pronto', color: '#92400E', bg: '#FEF3C7', border: '#FCD34D' },
  agotado: { label: 'Agotado',       color: '#B91C1C', bg: '#FEE2E2', border: '#FCA5A5' },
};

const catColors: Record<string, string> = {
  'Anestésicos': '#EFF6FF',
  'Protección':  '#F0FDF4',
  'Materiales':  '#F5F3FF',
  'Cirugía':     '#FFF7ED',
  'Endodoncia':  '#FEF2F2',
  'Diagnóstico': '#ECFEFF',
};

export default function InventoryModule() {
  const [items, setItems] = useState<InventoryItem[]>(INITIAL_ITEMS);
  const [catFilter, setCatFilter] = useState('Todas');
  const [statusFilter, setStatusFilter] = useState<StockStatus | 'all'>('all');
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');

  const updateStock = (id: number, delta: number) => {
    setItems(prev => prev.map(item =>
      item.id === id ? { ...item, stock: Math.max(0, item.stock + delta) } : item
    ));
  };

  const setStockDirect = (id: number, val: string) => {
    const n = parseInt(val);
    if (!isNaN(n) && n >= 0) {
      setItems(prev => prev.map(item => item.id === id ? { ...item, stock: n } : item));
    }
  };

  const filtered = items.filter(item => {
    const statusOk = statusFilter === 'all' || getStatus(item) === statusFilter;
    const catOk = catFilter === 'Todas' || item.category === catFilter;
    const searchOk = item.name.toLowerCase().includes(search.toLowerCase()) || item.category.toLowerCase().includes(search.toLowerCase());
    return statusOk && catOk && searchOk;
  });

  const lowStock  = items.filter(i => getStatus(i) === 'comprar').length;
  const outStock  = items.filter(i => getStatus(i) === 'agotado').length;
  const totalVal  = items.reduce((s, i) => s + i.stock * i.costUnit, 0);
  const expiring  = items.filter(i => {
    if (!i.expiryDate) return false;
    const exp = new Date(i.expiryDate);
    const diff = (exp.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    return diff <= 90;
  }).length;

  return (
    <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: '#E2E8F0' }}>
      {/* Header */}
      <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: '#EEF2F7', background: '#F8FAFD' }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#EFF6FF' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1A4F8A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-slate-800 text-sm">Control de Inventario Clínico</h3>
            <p className="text-xs text-slate-400">{items.length} insumos · Actualización en tiempo real</p>
          </div>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-xl transition-all hover:opacity-90"
          style={{ background: '#1A4F8A', boxShadow: '0 4px 12px rgba(26,79,138,0.3)' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Añadir Insumo
        </button>
      </div>

      {/* Alert metric cards */}
      <div className="grid grid-cols-3 gap-4 px-5 py-4 border-b" style={{ borderColor: '#EEF2F7' }}>
        {/* Card 1 — Low stock */}
        <button
          onClick={() => setStatusFilter(statusFilter === 'comprar' ? 'all' : 'comprar')}
          className="flex items-center gap-4 px-4 py-3.5 rounded-xl border-2 transition-all hover:shadow-sm text-left"
          style={{
            borderColor: statusFilter === 'comprar' ? '#FCA5A5' : '#FEE2E2',
            background: '#FFF5F5',
          }}
        >
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#FEE2E2' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <div>
            <div className="text-2xl font-bold font-mono" style={{ color: '#B91C1C' }}>{lowStock + outStock}</div>
            <div className="text-xs font-semibold text-red-600">Artículos con stock bajo</div>
            <div className="text-xs text-slate-400 mt-0.5">{outStock} agotados · {lowStock} bajos</div>
          </div>
        </button>

        {/* Card 2 — Value */}
        <div className="flex items-center gap-4 px-4 py-3.5 rounded-xl border" style={{ borderColor: '#DBEAFE', background: '#EFF6FF' }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#DBEAFE' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1D4ED8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
          <div>
            <div className="text-2xl font-bold font-mono" style={{ color: '#1D4ED8' }}>Bs. {totalVal.toLocaleString('es-BO', { maximumFractionDigits: 0 })}</div>
            <div className="text-xs font-semibold text-blue-700">Valor del Inventario</div>
            <div className="text-xs text-slate-400 mt-0.5">{items.length} referencias activas</div>
          </div>
        </div>

        {/* Card 3 — Expiring */}
        <button
          onClick={() => setStatusFilter('all')}
          className="flex items-center gap-4 px-4 py-3.5 rounded-xl border transition-all hover:shadow-sm text-left"
          style={{ borderColor: '#FDE68A', background: '#FFFBEB' }}
        >
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#FEF3C7' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <div>
            <div className="text-2xl font-bold font-mono" style={{ color: '#92400E' }}>{expiring}</div>
            <div className="text-xs font-semibold text-amber-700">Próximos a vencer</div>
            <div className="text-xs text-slate-400 mt-0.5">En los próximos 90 días</div>
          </div>
        </button>
      </div>

      {/* Filters row */}
      <div className="flex items-center gap-3 px-5 py-3 border-b" style={{ borderColor: '#F1F5F9' }}>
        {/* Search */}
        <div className="relative flex-shrink-0">
          <svg className="absolute left-2.5 top-2" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar insumo..."
            className="pl-8 pr-3 py-1.5 text-xs rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
            style={{ borderColor: '#E2E8F0', background: '#F8FAFC', width: 180 }}
          />
        </div>

        {/* Category pills */}
        <div className="flex gap-1 overflow-x-auto">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setCatFilter(cat)}
              className="flex-shrink-0 px-3 py-1 text-xs font-semibold rounded-full transition-all"
              style={{
                background: catFilter === cat ? '#1A4F8A' : '#F1F5F9',
                color: catFilter === cat ? '#FFFFFF' : '#64748B',
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-2">
          {/* Status filter */}
          <div className="flex rounded-lg overflow-hidden border text-xs" style={{ borderColor: '#E2E8F0' }}>
            {[
              { id: 'all' as const, label: 'Todos' },
              { id: 'optimo' as const, label: '● Óptimo' },
              { id: 'comprar' as const, label: '● Comprar' },
              { id: 'agotado' as const, label: '● Agotado' },
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setStatusFilter(f.id)}
                className="px-3 py-1.5 font-semibold transition-all"
                style={{
                  background: statusFilter === f.id ? '#0C1E38' : '#FFFFFF',
                  color: statusFilter === f.id ? '#FFFFFF' : '#64748B',
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto overflow-y-auto" style={{ maxHeight: 380 }}>
        <table className="w-full text-sm">
          <thead className="sticky top-0 z-10">
            <tr style={{ background: '#F8FAFD' }}>
              {['Insumo', 'Categoría', 'Stock Actual', 'Mínimo Ideal', 'Estado', 'Acciones'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide border-b" style={{ color: '#64748B', borderColor: '#EEF2F7' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(item => {
              const status = getStatus(item);
              const cfg = STATUS_CFG[status];
              const pct = Math.min((item.stock / item.maxIdeal) * 100, 100);
              const catBg = catColors[item.category] ?? '#F8FAFC';
              return (
                <tr key={item.id} className="border-t hover:bg-slate-50 transition-colors group" style={{ borderColor: '#F1F5F9' }}>
                  {/* Insumo */}
                  <td className="px-4 py-3">
                    <div className="font-semibold text-slate-800 text-sm leading-tight">{item.name}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-slate-400">{item.supplier}</span>
                      {item.expiryDate && (
                        <span className="text-xs font-mono text-amber-600">Vence: {new Date(item.expiryDate).toLocaleDateString('es-BO')}</span>
                      )}
                    </div>
                  </td>

                  {/* Categoría */}
                  <td className="px-4 py-3">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: catBg, color: '#475569' }}>
                      {item.category}
                    </span>
                  </td>

                  {/* Stock actual */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div>
                        <div className="font-bold font-mono text-base" style={{ color: status === 'agotado' ? '#B91C1C' : status === 'comprar' ? '#92400E' : '#1A4F8A' }}>
                          {item.stock}
                          <span className="text-xs font-normal ml-1 text-slate-400">{item.unit}</span>
                        </div>
                        {/* Mini bar */}
                        <div className="w-24 h-1.5 rounded-full mt-1" style={{ background: '#E2E8F0' }}>
                          <div
                            className="h-1.5 rounded-full transition-all"
                            style={{
                              width: `${pct}%`,
                              background: status === 'agotado' ? '#EF4444' : status === 'comprar' ? '#F59E0B' : '#22C55E',
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Mínimo */}
                  <td className="px-4 py-3 text-sm font-mono text-slate-500">{item.minIdeal} {item.unit}</td>

                  {/* Estado */}
                  <td className="px-4 py-3">
                    <span
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold"
                      style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: cfg.color }} />
                      {cfg.label}
                    </span>
                  </td>

                  {/* Acciones */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => updateStock(item.id, -1)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-slate-500 border transition-all hover:bg-red-50 hover:text-red-600 hover:border-red-200 active:scale-95"
                        style={{ borderColor: '#E2E8F0', fontSize: 16 }}
                      >
                        −
                      </button>
                      <input
                        type="number"
                        value={item.stock}
                        onChange={e => setStockDirect(item.id, e.target.value)}
                        className="w-14 text-center font-mono font-semibold text-sm rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 py-1"
                        style={{ borderColor: '#E2E8F0', color: '#1E293B' }}
                        min={0}
                      />
                      <button
                        onClick={() => updateStock(item.id, 1)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-slate-500 border transition-all hover:bg-green-50 hover:text-green-600 hover:border-green-200 active:scale-95"
                        style={{ borderColor: '#E2E8F0', fontSize: 16 }}
                      >
                        +
                      </button>
                      <button
                        className="ml-1 w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 border transition-colors hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200"
                        style={{ borderColor: '#E2E8F0' }}
                        title="Generar orden de compra"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
                          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-12 text-center text-sm text-slate-400">No se encontraron insumos con esos filtros.</div>
        )}
      </div>

      {/* Footer summary */}
      <div className="px-5 py-3 border-t flex items-center justify-between" style={{ borderColor: '#EEF2F7', background: '#F8FAFD' }}>
        <span className="text-xs text-slate-400">Mostrando {filtered.length} de {items.length} insumos</span>
        <button className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:underline">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Exportar a Excel
        </button>
      </div>

      {/* Add item modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
            <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: '#EEF2F7' }}>
              <h3 className="font-semibold text-slate-800">Añadir Nuevo Insumo</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="px-6 py-5 grid grid-cols-2 gap-4">
              {[
                { label: 'Nombre del Insumo', placeholder: 'Ej: Anestesia Lidocaína 2%', col: 2 },
                { label: 'Categoría', placeholder: 'Ej: Anestésicos' },
                { label: 'Unidad de Medida', placeholder: 'Ej: Cajas, Unidades' },
                { label: 'Stock Actual', placeholder: '0', type: 'number' },
                { label: 'Mínimo Ideal', placeholder: '10', type: 'number' },
                { label: 'Costo por Unidad (Bs.)', placeholder: '0.00', type: 'number' },
                { label: 'Fecha de Vencimiento', placeholder: '', type: 'date' },
                { label: 'Proveedor', placeholder: 'Ej: Dental Depot' },
              ].map(f => (
                <div key={f.label} className={`flex flex-col gap-1 ${f.col === 2 ? 'col-span-2' : ''}`}>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{f.label}</label>
                  <input
                    type={f.type ?? 'text'}
                    placeholder={f.placeholder}
                    className="w-full px-3 py-2 text-sm rounded-lg border bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{ borderColor: '#D1D9E6' }}
                  />
                </div>
              ))}
            </div>
            <div className="px-6 py-4 border-t flex justify-end gap-3" style={{ borderColor: '#EEF2F7', background: '#F8FAFD' }}>
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-semibold rounded-lg border hover:bg-slate-50 transition-colors" style={{ borderColor: '#D1D9E6', color: '#475569' }}>
                Cancelar
              </button>
              <button onClick={() => setShowModal(false)} className="px-5 py-2 text-sm font-semibold text-white rounded-lg transition-opacity hover:opacity-90" style={{ background: '#1A4F8A' }}>
                Guardar Insumo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
