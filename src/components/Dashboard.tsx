interface Appointment {
  time: string;
  patient: string;
  treatment: string;
  type: 'ortodoncia' | 'cirugia' | 'limpieza' | 'endodoncia' | 'blanqueamiento' | 'restauracion';
  room: string;
  isNew?: boolean;
}

const typeConfig = {
  ortodoncia: { color: '#1D4ED8', bg: '#EFF6FF', border: '#BFDBFE', label: 'Ortodoncia' },
  cirugia: { color: '#B91C1C', bg: '#FEF2F2', border: '#FECACA', label: 'Cirugía' },
  limpieza: { color: '#15803D', bg: '#F0FDF4', border: '#BBF7D0', label: 'Limpieza' },
  endodoncia: { color: '#92400E', bg: '#FFFBEB', border: '#FDE68A', label: 'Endodoncia' },
  blanqueamiento: { color: '#6D28D9', bg: '#F5F3FF', border: '#DDD6FE', label: 'Blanqueamiento' },
  restauracion: { color: '#0E7490', bg: '#ECFEFF', border: '#A5F3FC', label: 'Restauración' },
};

const appointments: Appointment[] = [
  { time: '08:00', patient: 'Ana Sofía Ríos', treatment: 'Control de Ortodoncia', type: 'ortodoncia', room: 'Box 1' },
  { time: '09:00', patient: 'Roberto Vega', treatment: 'Endodoncia Molar #36', type: 'endodoncia', room: 'Box 2', isNew: true },
  { time: '10:00', patient: 'María Elena Condori', treatment: 'Limpieza y Detartraje', type: 'limpieza', room: 'Box 1' },
  { time: '11:00', patient: 'Carlos R. Mamani', treatment: 'Control Post-operatorio', type: 'cirugia', room: 'Box 3' },
  { time: '12:30', patient: 'Patricia Luna', treatment: 'Blanqueamiento Dental', type: 'blanqueamiento', room: 'Box 2' },
  { time: '14:00', patient: 'Diego Alvarado', treatment: 'Obturación y Restauración', type: 'restauracion', room: 'Box 1' },
  { time: '15:30', patient: 'Juan Pablo Flores', treatment: 'Extracción Molar Juicio', type: 'cirugia', room: 'Box 3' },
  { time: '16:30', patient: 'Sofía Mendoza', treatment: 'Colocación de Corona', type: 'restauracion', room: 'Box 2', isNew: true },
];

const today = new Date();
const monthDays = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).getDay();
const monthName = today.toLocaleDateString('es-BO', { month: 'long', year: 'numeric' });

const kpis = [
  { label: 'Citas Hoy', value: '8', sub: '2 sin confirmar', color: '#1A4F8A', bg: '#EFF6FF' },
  { label: 'Nuevos Pacientes', value: '3', sub: 'Este mes: 24', color: '#059669', bg: '#F0FDF4' },
  { label: 'Ingresos del Mes', value: 'Bs. 18,400', sub: '+12% vs mes anterior', color: '#7C3AED', bg: '#F5F3FF' },
  { label: 'Pendiente Cobrar', value: 'Bs. 6,800', sub: '5 pacientes en mora', color: '#D97706', bg: '#FFFBEB' },
];

export default function Dashboard({ onOpenPatient }: { onOpenPatient: (name: string, isNew: boolean) => void }) {
  return (
    <div className="h-full overflow-y-auto p-6">
      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {kpis.map(kpi => (
          <div key={kpi.label} className="bg-white rounded-xl border p-4 hover:shadow-sm transition-shadow" style={{ borderColor: '#E2E8F0' }}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">{kpi.label}</p>
                <p className="text-2xl font-bold" style={{ color: kpi.color, fontFamily: "'JetBrains Mono', monospace" }}>{kpi.value}</p>
                <p className="text-xs text-slate-400 mt-1">{kpi.sub}</p>
              </div>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: kpi.bg }}>
                <div className="w-3 h-3 rounded-full" style={{ background: kpi.color }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Calendar */}
        <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: '#E2E8F0' }}>
          <div className="px-4 py-3 border-b" style={{ borderColor: '#EEF2F7', background: '#F8FAFD' }}>
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-800 text-sm capitalize">{monthName}</h3>
              <div className="flex gap-1">
                <button className="w-6 h-6 rounded flex items-center justify-center hover:bg-slate-100 transition-colors text-slate-400">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6" /></svg>
                </button>
                <button className="w-6 h-6 rounded flex items-center justify-center hover:bg-slate-100 transition-colors text-slate-400">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6" /></svg>
                </button>
              </div>
            </div>
          </div>
          <div className="p-3">
            <div className="grid grid-cols-7 mb-1">
              {['D','L','M','M','J','V','S'].map((d, i) => (
                <div key={i} className="text-center text-xs font-bold text-slate-400 py-1">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-0.5">
              {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
              {Array.from({ length: monthDays }).map((_, i) => {
                const day = i + 1;
                const isToday = day === today.getDate();
                const hasAppt = [5, 8, 12, 15, 18, 22, 25, 26, 29].includes(day);
                return (
                  <div key={day} className={`relative aspect-square flex items-center justify-center rounded-lg text-xs cursor-pointer transition-all hover:bg-blue-50 ${isToday ? 'text-white font-bold' : 'text-slate-600'}`}
                    style={{ background: isToday ? '#1A4F8A' : undefined }}>
                    {day}
                    {hasAppt && !isToday && (
                      <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-blue-500" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          <div className="px-4 py-3 border-t" style={{ borderColor: '#EEF2F7', background: '#F8FAFD' }}>
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(typeConfig).map(([, conf]) => (
                <div key={conf.label} className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-sm" style={{ background: conf.color }} />
                  <span className="text-xs text-slate-400">{conf.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Today's Appointments */}
        <div className="col-span-2 bg-white rounded-xl border overflow-hidden flex flex-col" style={{ borderColor: '#E2E8F0' }}>
          <div className="px-5 py-3 border-b flex items-center justify-between" style={{ borderColor: '#EEF2F7', background: '#F8FAFD' }}>
            <div>
              <h3 className="font-semibold text-slate-800 text-sm">Citas de Hoy</h3>
              <p className="text-xs text-slate-400">
                {today.toLocaleDateString('es-BO', { weekday: 'long', day: 'numeric', month: 'long' })}
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: '#EFF6FF', color: '#1D4ED8' }}>
              {appointments.length} citas
            </span>
          </div>
          <div className="overflow-y-auto flex-1">
            {appointments.map((appt, i) => {
              const conf = typeConfig[appt.type];
              return (
                <div
                  key={i}
                  role="button"
                  tabIndex={0}
                  aria-label={`Abrir historia clínica de ${appt.patient}`}
                  onClick={() => onOpenPatient(appt.patient, appt.isNew ?? false)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      onOpenPatient(appt.patient, appt.isNew ?? false);
                    }
                  }}
                  className="px-5 py-3 border-b flex items-center gap-4 hover:bg-slate-50 transition-colors group cursor-pointer focus:outline-none focus:bg-blue-50"
                  style={{ borderColor: '#F1F5F9' }}
                >
                  <div className="text-center flex-shrink-0 w-12">
                    <div className="text-sm font-bold font-mono" style={{ color: '#1A4F8A' }}>{appt.time}</div>
                    <div className="text-xs text-slate-400">{appt.room}</div>
                  </div>
                  <div className="w-px h-10 flex-shrink-0" style={{ background: conf.border }} />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-slate-800 text-sm truncate">{appt.patient}</div>
                    <div className="text-xs text-slate-500 mt-0.5 truncate">{appt.treatment}</div>
                  </div>
                  <span className="flex-shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: conf.bg, color: conf.color, border: `1px solid ${conf.border}` }}>
                    {conf.label}
                  </span>
                  <button
                    onClick={(event) => {
                      event.stopPropagation();
                      onOpenPatient(appt.patient, appt.isNew ?? false);
                    }}
                    className="flex-shrink-0 opacity-0 group-hover:opacity-100 flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white rounded-md transition-all"
                    style={{ background: '#1A4F8A' }}
                  >
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
                    </svg>
                    Abrir H.C.
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quick stats bottom row */}
      <div className="grid grid-cols-3 gap-4 mt-4">
        <div className="bg-white rounded-xl border p-4" style={{ borderColor: '#E2E8F0' }}>
          <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Tratamientos del Mes</h4>
          <div className="space-y-2">
            {[
              { label: 'Ortodoncia', count: 12, pct: 30 },
              { label: 'Restauraciones', count: 18, pct: 45 },
              { label: 'Cirugías', count: 5, pct: 12 },
              { label: 'Limpiezas', count: 22, pct: 55 },
            ].map(t => (
              <div key={t.label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-600">{t.label}</span>
                  <span className="font-semibold font-mono text-slate-700">{t.count}</span>
                </div>
                <div className="h-1.5 rounded-full" style={{ background: '#E2E8F0' }}>
                  <div className="h-1.5 rounded-full" style={{ width: `${t.pct}%`, background: 'linear-gradient(to right, #1A4F8A, #3B82F6)' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border p-4" style={{ borderColor: '#E2E8F0' }}>
          <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Estado del Inventario</h4>
          <div className="space-y-2.5">
            {[
              { item: 'Anestesia Lidocaína', stock: 'Crítico', pct: 15, color: '#B91C1C' },
              { item: 'Guantes Latex L', stock: 'Bajo', pct: 35, color: '#D97706' },
              { item: 'Mascarillas', stock: 'Normal', pct: 80, color: '#15803D' },
              { item: 'Cemento Dental', stock: 'Normal', pct: 65, color: '#15803D' },
            ].map(s => (
              <div key={s.item}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-600">{s.item}</span>
                  <span className="font-semibold" style={{ color: s.color }}>{s.stock}</span>
                </div>
                <div className="h-1.5 rounded-full" style={{ background: '#E2E8F0' }}>
                  <div className="h-1.5 rounded-full transition-all" style={{ width: `${s.pct}%`, background: s.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border p-4" style={{ borderColor: '#E2E8F0' }}>
          <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Próximas Citas</h4>
          <div className="space-y-2.5">
            {[
              { patient: 'Rosa Mamani', date: 'Mañana 09:00', type: 'Endodoncia' },
              { patient: 'Pedro Gutiérrez', date: 'Mañana 11:00', type: 'Ortodoncia' },
              { patient: 'Lucía Vargas', date: 'Jue 15:00', type: 'Limpieza' },
              { patient: 'Marco Quispe', date: 'Vie 10:30', type: 'Extracción' },
            ].map(c => (
              <div key={c.patient} className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ background: '#1A4F8A' }}>
                  {c.patient.split(' ').map(s => s[0]).join('').slice(0, 2)}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-slate-700 truncate">{c.patient}</div>
                  <div className="text-xs text-slate-400 truncate">{c.date} · {c.type}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
