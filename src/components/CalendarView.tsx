import { useState } from 'react';

type CalMode = 'day' | 'week' | 'month';

interface Appt {
  id: number;
  time: string;
  end: string;
  startH: number; // fractional hour from 08:00
  durationH: number;
  patient: string;
  treatment: string;
  type: keyof typeof TYPE_CFG;
  source: 'bot' | 'manual';
  room: string;
  dayOffset: number; // 0=today, 1=tomorrow, etc. used for week view
  isNew?: boolean;   // true = patient not yet in the system
}

const TYPE_CFG = {
  ortodoncia:     { color: '#1D4ED8', bg: '#EFF6FF', border: '#BFDBFE', label: 'Ortodoncia' },
  cirugia:        { color: '#B91C1C', bg: '#FEF2F2', border: '#FECACA', label: 'Cirugía' },
  limpieza:       { color: '#15803D', bg: '#F0FDF4', border: '#BBF7D0', label: 'Limpieza' },
  endodoncia:     { color: '#92400E', bg: '#FFFBEB', border: '#FDE68A', label: 'Endodoncia' },
  blanqueamiento: { color: '#6D28D9', bg: '#F5F3FF', border: '#DDD6FE', label: 'Blanqueamiento' },
  restauracion:   { color: '#0E7490', bg: '#ECFEFF', border: '#A5F3FC', label: 'Restauración' },
  ortopedia:      { color: '#be185d', bg: '#fdf2f8', border: '#fbcfe8', label: 'Ortopedia' },
} as const;

// Patients already registered in the system
const KNOWN_PATIENTS = new Set([
  'Ana S. Ríos', 'María E. Condori', 'Carlos R. Mamani',
  'Patricia Luna', 'Diego Alvarado', 'Juan P. Flores',
]);

const APPTS: Appt[] = [
  { id:1,  time:'08:00', end:'08:45', startH:0,    durationH:0.75, patient:'Ana S. Ríos',       treatment:'Control de Ortodoncia',         type:'ortodoncia',     source:'bot',    room:'Box 1', dayOffset:0  },
  { id:2,  time:'09:00', end:'10:30', startH:1,    durationH:1.5,  patient:'Roberto Vega',       treatment:'Endodoncia Molar #36',           type:'endodoncia',     source:'manual', room:'Box 2', dayOffset:0,  isNew:true },
  { id:3,  time:'10:00', end:'10:30', startH:2,    durationH:0.5,  patient:'María E. Condori',   treatment:'Limpieza y Detartraje',          type:'limpieza',       source:'bot',    room:'Box 1', dayOffset:0  },
  { id:4,  time:'11:00', end:'11:45', startH:3,    durationH:0.75, patient:'Carlos R. Mamani',   treatment:'Control Post-operatorio',        type:'cirugia',        source:'manual', room:'Box 3', dayOffset:0  },
  { id:5,  time:'12:30', end:'13:30', startH:4.5,  durationH:1,    patient:'Patricia Luna',      treatment:'Blanqueamiento Dental',          type:'blanqueamiento', source:'bot',    room:'Box 2', dayOffset:0  },
  { id:6,  time:'14:00', end:'15:00', startH:6,    durationH:1,    patient:'Diego Alvarado',     treatment:'Obturación Clase II',            type:'restauracion',   source:'bot',    room:'Box 1', dayOffset:0  },
  { id:7,  time:'15:30', end:'17:00', startH:7.5,  durationH:1.5,  patient:'Juan P. Flores',     treatment:'Extracción Molar del Juicio',    type:'cirugia',        source:'manual', room:'Box 3', dayOffset:0  },
  { id:8,  time:'16:30', end:'17:00', startH:8.5,  durationH:0.5,  patient:'Sofía Mendoza',      treatment:'Colocación de Corona',           type:'restauracion',   source:'bot',    room:'Box 2', dayOffset:0,  isNew:true },
  { id:9,  time:'08:30', end:'09:15', startH:0.5,  durationH:0.75, patient:'Rosa Mamani',        treatment:'Revisión de Aparatos',           type:'ortopedia',      source:'bot',    room:'Box 1', dayOffset:1,  isNew:true },
  { id:10, time:'10:00', end:'11:30', startH:2,    durationH:1.5,  patient:'Pedro Gutiérrez',    treatment:'Brackets Metálicos — Inicio',   type:'ortodoncia',     source:'manual', room:'Box 2', dayOffset:1,  isNew:true },
  { id:11, time:'14:00', end:'14:30', startH:6,    durationH:0.5,  patient:'Lucía Vargas',       treatment:'Limpieza Profiláctica',          type:'limpieza',       source:'bot',    room:'Box 1', dayOffset:2,  isNew:true },
  { id:12, time:'09:00', end:'10:00', startH:1,    durationH:1,    patient:'Marco Quispe',       treatment:'Extracción Simple #24',          type:'cirugia',        source:'bot',    room:'Box 3', dayOffset:3,  isNew:true },
  { id:13, time:'11:30', end:'12:00', startH:3.5,  durationH:0.5,  patient:'Valentina Cruz',     treatment:'Urgencia — Dolor Agudo',         type:'endodoncia',     source:'manual', room:'Box 2', dayOffset:4,  isNew:true },
  { id:14, time:'17:00', end:'18:00', startH:9,    durationH:1,    patient:'Fernanda Rojas',     treatment:'Consulta Inicial + Presupuesto', type:'limpieza',       source:'bot',    room:'Box 1', dayOffset:0,  isNew:true },
  { id:15, time:'18:30', end:'19:30', startH:10.5, durationH:1,    patient:'Gonzalo Ibáñez',     treatment:'Ortodoncia — Control Mensual',   type:'ortodoncia',     source:'bot',    room:'Box 2', dayOffset:0,  isNew:true },
];

// Derive isNew from KNOWN_PATIENTS for any entry without an explicit flag
APPTS.forEach(a => {
  if (a.isNew === undefined) a.isNew = !KNOWN_PATIENTS.has(a.patient);
});

const HOURS = Array.from({ length: 13 }, (_, i) => i + 8); // 8..20
const HOUR_PX = 72;
const WEEK_DAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

const today = new Date();

function hourLabel(h: number) {
  return `${String(h).padStart(2, '0')}:00`;
}

function ApptCard({
  appt,
  style,
  compact = false,
  onOpen,
}: {
  appt: Appt;
  style?: React.CSSProperties;
  compact?: boolean;
  onOpen: (name: string, isNew: boolean) => void;
}) {
  const cfg = TYPE_CFG[appt.type];
  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Abrir historia clínica de ${appt.patient}`}
      onClick={() => onOpen(appt.patient, appt.isNew ?? false)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onOpen(appt.patient, appt.isNew ?? false);
        }
      }}
      className="absolute left-1 right-1 rounded-lg overflow-hidden border group cursor-pointer hover:shadow-md transition-all"
      style={{
        background: cfg.bg,
        borderColor: cfg.border,
        borderLeft: `3px solid ${cfg.color}`,
        ...style,
      }}
    >
      <div className="px-2 py-1.5 h-full flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-1 mb-0.5">
            <span className="text-xs font-bold truncate" style={{ color: cfg.color }}>{appt.time}</span>
            <div className="flex items-center gap-1 flex-shrink-0">
              {appt.isNew && (
                <span className="font-bold rounded-full px-1.5 py-0.5"
                  style={{ fontSize: '9px', background: '#FEF3C7', color: '#92400E', border: '1px solid #FDE68A' }}>
                  ★ Nuevo
                </span>
              )}
              <span
                className="font-semibold px-1.5 py-0.5 rounded-full"
                style={{
                  background: appt.source === 'bot' ? '#DBEAFE' : '#F3F4F6',
                  color: appt.source === 'bot' ? '#1D4ED8' : '#6B7280',
                  fontSize: '9px',
                }}
              >
                {appt.source === 'bot' ? '🤖 Bot' : '✍️ Manual'}
              </span>
            </div>
          </div>
          {!compact && (
            <>
              <div className="text-xs font-semibold text-slate-800 truncate leading-tight">{appt.patient}</div>
              <div className="text-xs text-slate-500 truncate leading-tight">{appt.treatment}</div>
            </>
          )}
          {compact && (
            <div className="flex items-center gap-1">
              <div className="text-xs font-semibold text-slate-800 truncate">{appt.patient}</div>
              {appt.isNew && (
                <span className="flex-shrink-0 font-bold rounded-full px-1 leading-none"
                  style={{ fontSize: '8px', background: '#FEF3C7', color: '#92400E', border: '1px solid #FDE68A', padding: '2px 4px' }}>
                  Nuevo
                </span>
              )}
            </div>
          )}
        </div>
        {!compact && (
          <button
            onClick={(e) => { e.stopPropagation(); onOpen(appt.patient, appt.isNew ?? false); }}
            className="mt-1 text-xs font-semibold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ color: cfg.color }}
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
            </svg>
            {appt.isNew ? 'Crear Historial' : 'Abrir H.C.'}
          </button>
        )}
      </div>
    </div>
  );
}

function DayView({ onOpenPatient }: { onOpenPatient: (name: string, isNew: boolean) => void }) {
  const dayAppts = APPTS.filter(a => a.dayOffset === 0);
  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Time gutter */}
      <div className="w-14 flex-shrink-0 border-r" style={{ borderColor: '#E2E8F0' }}>
        <div className="h-10" /> {/* header spacer */}
        {HOURS.map(h => (
          <div key={h} className="flex items-start justify-end pr-3" style={{ height: HOUR_PX }}>
            <span className="text-xs font-mono text-slate-400 -mt-2">{hourLabel(h)}</span>
          </div>
        ))}
      </div>

      {/* Day column */}
      <div className="flex-1 overflow-y-auto" style={{ background: '#FAFBFD' }}>
        {/* Day header */}
        <div className="h-10 sticky top-0 z-10 flex items-center px-4 border-b" style={{ background: '#FFFFFF', borderColor: '#E2E8F0' }}>
          <span className="text-sm font-bold" style={{ color: '#1A4F8A' }}>
            {today.toLocaleDateString('es-BO', { weekday: 'long', day: 'numeric', month: 'long' })}
          </span>
          <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: '#DBEAFE', color: '#1D4ED8' }}>
            {dayAppts.length} citas
          </span>
        </div>

        {/* Grid */}
        <div className="relative" style={{ height: HOURS.length * HOUR_PX }}>
          {/* Hour lines */}
          {HOURS.map((h, i) => (
            <div
              key={h}
              className="absolute left-0 right-0 border-t"
              style={{ top: i * HOUR_PX, borderColor: '#F1F5F9' }}
            />
          ))}
          {/* Half-hour dashes */}
          {HOURS.map((_, i) => (
            <div
              key={`h${i}`}
              className="absolute left-0 right-0 border-t border-dashed"
              style={{ top: i * HOUR_PX + HOUR_PX / 2, borderColor: '#F1F5F9' }}
            />
          ))}

          {/* Appointments */}
          {dayAppts.map(appt => (
            <ApptCard
              key={appt.id}
              appt={appt}
              onOpen={(name, isNew) => onOpenPatient(name, isNew)}
              style={{
                top: appt.startH * HOUR_PX + 2,
                height: Math.max(appt.durationH * HOUR_PX - 4, 32),
              }}
            />
          ))}

          {/* Now line */}
          <div
            className="absolute left-0 right-0 flex items-center gap-1 z-20"
            style={{ top: ((new Date().getHours() - 8) + new Date().getMinutes() / 60) * HOUR_PX }}
          >
            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: '#EF4444' }} />
            <div className="flex-1 border-t-2" style={{ borderColor: '#EF4444' }} />
          </div>
        </div>
      </div>
    </div>
  );
}

function WeekView({ onOpenPatient }: { onOpenPatient: (name: string, isNew: boolean) => void }) {
  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    const diff = i - today.getDay();
    d.setDate(today.getDate() + diff);
    return d;
  });

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Time gutter */}
      <div className="w-14 flex-shrink-0 border-r z-10" style={{ borderColor: '#E2E8F0' }}>
        <div className="h-14" />
        {HOURS.map(h => (
          <div key={h} className="flex items-start justify-end pr-3" style={{ height: HOUR_PX }}>
            <span className="text-xs font-mono text-slate-400 -mt-2">{hourLabel(h)}</span>
          </div>
        ))}
      </div>

      {/* Days */}
      <div className="flex-1 overflow-auto">
        <div className="flex min-w-0" style={{ minWidth: 700 }}>
          {weekDates.map((date, di) => {
            const isToday = date.toDateString() === today.toDateString();
            const dayAppts = APPTS.filter(a => a.dayOffset === di - today.getDay() || (di === today.getDay() && a.dayOffset === 0));
            return (
              <div key={di} className="flex-1 border-r min-w-0" style={{ borderColor: '#E2E8F0' }}>
                {/* Day header */}
                <div
                  className="h-14 sticky top-0 z-10 flex flex-col items-center justify-center border-b"
                  style={{ background: isToday ? '#EFF6FF' : '#FFFFFF', borderColor: '#E2E8F0' }}
                >
                  <span className="text-xs font-semibold text-slate-500">{WEEK_DAYS[date.getDay()]}</span>
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mt-0.5"
                    style={isToday ? { background: '#1A4F8A', color: '#FFFFFF' } : { color: '#374151' }}
                  >
                    {date.getDate()}
                  </div>
                </div>
                {/* Grid */}
                <div className="relative" style={{ height: HOURS.length * HOUR_PX, background: isToday ? '#FAFCFF' : '#FAFBFD' }}>
                  {HOURS.map((_, i) => (
                    <div key={i} className="absolute left-0 right-0 border-t" style={{ top: i * HOUR_PX, borderColor: '#F1F5F9' }} />
                  ))}
                  {APPTS.filter(a => a.dayOffset === (di - today.getDay())).map(appt => (
                    <ApptCard
                      key={appt.id}
                      appt={appt}
                      compact
                      onOpen={(name, isNew) => onOpenPatient(name, isNew)}
                      style={{
                        top: appt.startH * HOUR_PX + 1,
                        height: Math.max(appt.durationH * HOUR_PX - 3, 24),
                      }}
                    />
                  ))}
                  {isToday && (
                    <div
                      className="absolute left-0 right-0 flex items-center gap-1 z-20"
                      style={{ top: ((new Date().getHours() - 8) + new Date().getMinutes() / 60) * HOUR_PX }}
                    >
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#EF4444' }} />
                      <div className="flex-1 border-t" style={{ borderColor: '#EF4444' }} />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function MonthView({ onOpenPatient }: { onOpenPatient: (name: string, isNew: boolean) => void }) {
  const year = today.getFullYear();
  const month = today.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = firstDay + daysInMonth;
  const rows = Math.ceil(cells / 7);

  return (
    <div className="flex-1 overflow-auto p-4">
      <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: '#E2E8F0' }}>
        {/* Day headers */}
        <div className="grid grid-cols-7 border-b" style={{ borderColor: '#E2E8F0' }}>
          {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((d, i) => (
            <div key={i} className="py-2.5 text-center text-xs font-bold uppercase tracking-wide" style={{ color: '#94A3B8' }}>{d}</div>
          ))}
        </div>
        {/* Cells */}
        <div className="grid grid-cols-7" style={{ gridTemplateRows: `repeat(${rows}, minmax(100px, 1fr))` }}>
          {Array.from({ length: rows * 7 }).map((_, idx) => {
            const dayNum = idx - firstDay + 1;
            const valid = dayNum >= 1 && dayNum <= daysInMonth;
            const isToday = valid && dayNum === today.getDate();
            const appts = APPTS.filter(a => {
              if (!valid) return false;
              const targetDate = new Date(year, month, dayNum);
              const apptDate = new Date(today);
              apptDate.setDate(today.getDate() + a.dayOffset);
              return apptDate.toDateString() === targetDate.toDateString();
            });
            return (
              <div
                key={idx}
                className="border-r border-b p-1.5 min-h-24"
                style={{
                  borderColor: '#F1F5F9',
                  background: isToday ? '#F0F6FF' : valid ? '#FFFFFF' : '#F8FAFC',
                }}
              >
                {valid && (
                  <>
                    <div
                      className="w-6 h-6 flex items-center justify-center rounded-full text-xs font-semibold mb-1"
                      style={isToday ? { background: '#1A4F8A', color: '#fff' } : { color: '#374151' }}
                    >
                      {dayNum}
                    </div>
                    <div className="space-y-0.5">
                      {appts.slice(0, 3).map(a => {
                        const cfg = TYPE_CFG[a.type];
                        return (
                          <button
                            key={a.id}
                            onClick={() => onOpenPatient(a.patient, a.isNew ?? false)}
                            className="w-full text-left text-xs px-1.5 py-0.5 rounded truncate font-medium flex items-center gap-1"
                            style={{ background: cfg.bg, color: cfg.color }}
                          >
                            <span className="truncate">{a.time} {a.patient.split(' ')[0]}</span>
                            {a.isNew && <span className="flex-shrink-0 text-amber-600" style={{ fontSize: '8px' }}>★</span>}
                          </button>
                        );
                      })}
                      {appts.length > 3 && (
                        <div className="text-xs text-slate-400 px-1">+{appts.length - 3} más</div>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function CalendarView({ onOpenPatient }: { onOpenPatient: (name: string, isNew: boolean) => void }) {
  const [mode, setMode] = useState<CalMode>('week');

  const monthName = today.toLocaleDateString('es-BO', { month: 'long', year: 'numeric' });

  return (
    <div className="flex flex-col h-full overflow-hidden min-w-0">
      {/* Calendar toolbar */}
      <div className="flex-shrink-0 flex items-center gap-3 px-5 py-3 border-b bg-white min-w-0" style={{ borderColor: '#E2E8F0' }}>
        {/* Left: navigation — can shrink if needed */}
        <div className="flex items-center gap-2 min-w-0 flex-shrink">
          <button className="flex-shrink-0 text-slate-400 hover:text-slate-600 transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
          </button>
          <h2 className="font-semibold text-slate-800 text-sm capitalize text-center truncate" style={{ minWidth: 0 }}>{monthName}</h2>
          <button className="flex-shrink-0 text-slate-400 hover:text-slate-600 transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
          </button>
          <button className="flex-shrink-0 text-xs font-semibold px-3 py-1.5 rounded-md border hover:bg-slate-50 transition-colors" style={{ borderColor: '#E2E8F0', color: '#475569' }}>
            Hoy
          </button>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Right: action buttons — never shrink, always visible */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="w-px h-5" style={{ background: '#E2E8F0' }} />

          {/* Mode toggle */}
          <div className="flex rounded-lg overflow-hidden border" style={{ borderColor: '#E2E8F0' }}>
            {(['day', 'week', 'month'] as CalMode[]).map(m => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className="px-3 py-1.5 text-xs font-semibold capitalize transition-all"
                style={{
                  background: mode === m ? '#1A4F8A' : '#FFFFFF',
                  color: mode === m ? '#FFFFFF' : '#64748B',
                }}
              >
                {m === 'day' ? 'Día' : m === 'week' ? 'Semana' : 'Mes'}
              </button>
            ))}
          </div>

          <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white rounded-md transition-opacity hover:opacity-90" style={{ background: '#1A4F8A' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Nueva Cita
          </button>
        </div>
      </div>

      {/* Info bar: origin + treatment legend */}
      <div className="flex-shrink-0 flex items-center gap-3 px-5 py-2 border-b text-xs min-w-0 overflow-hidden" style={{ background: '#F8FAFD', borderColor: '#E2E8F0' }}>
        <span className="flex-shrink-0 text-slate-400 font-semibold uppercase tracking-wide" style={{ fontSize: '10px' }}>Origen:</span>
        <span className="flex-shrink-0 flex items-center gap-1 font-semibold" style={{ color: '#1D4ED8' }}>
          <span className="px-1.5 py-0.5 rounded-full" style={{ background: '#DBEAFE', fontSize: '10px' }}>🤖 Bot</span>
        </span>
        <span className="flex-shrink-0 flex items-center gap-1 font-semibold text-slate-500">
          <span className="px-1.5 py-0.5 rounded-full" style={{ background: '#F3F4F6', fontSize: '10px' }}>✍️ Manual</span>
        </span>

        <div className="w-px h-3 flex-shrink-0" style={{ background: '#E2E8F0' }} />

        {/* Treatment type legend — scrolls if needed */}
        <div className="flex items-center gap-2 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          {Object.values(TYPE_CFG).map(cfg => (
            <div key={cfg.label} className="flex items-center gap-1 flex-shrink-0">
              <div className="w-2 h-2 rounded-sm flex-shrink-0" style={{ background: cfg.color }} />
              <span className="text-slate-500" style={{ fontSize: '10px' }}>{cfg.label}</span>
            </div>
          ))}
        </div>

        <div className="ml-auto flex-shrink-0 flex items-center gap-1.5 text-slate-400">
          <span className="w-3 h-0.5 inline-block rounded" style={{ background: '#EF4444' }} />
          <span style={{ fontSize: '10px' }}>Ahora</span>
        </div>
      </div>

      {/* Calendar body */}
      <div className="flex flex-1 overflow-hidden">
        {mode === 'day'   && <DayView   onOpenPatient={(n, isNew) => onOpenPatient(n, isNew)} />}
        {mode === 'week'  && <WeekView  onOpenPatient={(n, isNew) => onOpenPatient(n, isNew)} />}
        {mode === 'month' && <MonthView onOpenPatient={(n, isNew) => onOpenPatient(n, isNew)} />}
      </div>
    </div>
  );
}
