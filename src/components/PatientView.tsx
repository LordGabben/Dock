import { useState } from 'react';
import ClinicalHistory from './tabs/ClinicalHistory';
import Gallery from './tabs/Gallery';
import Financial from './tabs/Financial';
import Evolution from './tabs/Evolution';
import OdontogramModule from './modules/OdontogramModule';
import ConsentModule from './modules/ConsentModule';
import Budget from './tabs/Budget';

type Tab = 'historia' | 'galeria' | 'financiero' | 'presupuesto' | 'evolucion' | 'odontograma' | 'consentimiento';

const tabs: { id: Tab; label: string }[] = [
  { id: 'historia',       label: 'Historia Clínica' },
  { id: 'galeria',        label: 'Galería' },
  { id: 'financiero',     label: 'Finanzas' },
  { id: 'presupuesto',    label: 'Presupuesto' },
  { id: 'evolucion',      label: 'Evolución (SOAP)' },
  { id: 'odontograma',    label: 'Odontograma' },
  { id: 'consentimiento', label: 'Consentimiento' },
];

interface Patient {
  name: string;
  ci: string;
  age: number;
  phone: string;
  balance: number;
  photo: string;
  lastVisit: string;
  bloodType: string;
  isNew?: boolean;
}

// Canonical patient detail profiles (keyed by list index)
const PATIENT_PROFILES: Patient[] = [
  { name: 'Carlos Rodrigo Mamani Quispe', ci: '7823456 LP', age: 34, phone: '+591 72345678', balance: 4400, photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&auto=format', lastVisit: '12 Mar 2024', bloodType: 'O+' },
  { name: 'María Elena Condori Villanueva', ci: '5891234 LP', age: 29, phone: '+591 71234567', balance: 0,    photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&auto=format', lastVisit: '08 Mar 2024', bloodType: 'A+' },
  { name: 'Juan Pablo Flores Arce', ci: '9023456 CB', age: 41, phone: '+591 76543210', balance: 1200, photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&auto=format', lastVisit: '01 Mar 2024', bloodType: 'B+' },
  { name: 'Ana Sofía Ríos Méndez', ci: '6712345 OR', age: 26, phone: '+591 79876543', balance: 0,    photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&auto=format', lastVisit: '28 Feb 2024', bloodType: 'AB+' },
  { name: 'Diego Alvarado Soto', ci: '8134567 SC', age: 37, phone: '+591 78901234', balance: 800,  photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop&auto=format', lastVisit: '25 Feb 2024', bloodType: 'O-' },
  { name: 'Patricia Luna Torres', ci: '7456789 LP', age: 44, phone: '+591 77890123', balance: 2200, photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop&auto=format', lastVisit: '20 Feb 2024', bloodType: 'A-' },
];

// Map calendar short name → list index for routing
const NAME_TO_INDEX: Record<string, number> = {
  'Ana S. Ríos':       3,
  'María E. Condori':  1,
  'Carlos R. Mamani':  0,
  'Patricia Luna':     5,
  'Diego Alvarado':    4,
  'Juan P. Flores':    2,
};

const BASE_LIST = [
  { name: 'Carlos R. Mamani Q.', ci: '7823456 LP', lastVisit: '12 Mar 2024', balance: 4400, status: 'Activo', isNew: false },
  { name: 'María Elena Condori V.', ci: '5891234 LP', lastVisit: '08 Mar 2024', balance: 0, status: 'Al día', isNew: false },
  { name: 'Juan Pablo Flores A.', ci: '9023456 CB', lastVisit: '01 Mar 2024', balance: 1200, status: 'Activo', isNew: false },
  { name: 'Ana Sofía Ríos M.', ci: '6712345 OR', lastVisit: '28 Feb 2024', balance: 0, status: 'Al día', isNew: false },
  { name: 'Diego Alvarado S.', ci: '8134567 SC', lastVisit: '25 Feb 2024', balance: 800, status: 'Mora', isNew: false },
  { name: 'Patricia Luna T.', ci: '7456789 LP', lastVisit: '20 Feb 2024', balance: 2200, status: 'Activo', isNew: false },
];

const TAB_EMPTY_HINTS: Record<Tab, { icon: string; title: string; desc: string; action: string }> = {
  historia:       { icon: '📋', title: 'Historia Clínica vacía', desc: 'Registra los datos de filiación, antecedentes y examen físico del paciente.', action: 'Completar Historia Clínica' },
  galeria:        { icon: '🖼️', title: 'Sin imágenes', desc: 'No hay radiografías ni fotografías clínicas registradas para este paciente.', action: 'Subir primera imagen' },
  financiero:     { icon: '💰', title: 'Sin plan de pago', desc: 'Crea el plan de tratamiento y asigna los costos para generar un plan de pagos.', action: 'Crear plan de tratamiento' },
  presupuesto:    { icon: '📑', title: 'Sin presupuesto', desc: 'Crea un presupuesto detallado para que el paciente pueda revisarlo antes de iniciar el tratamiento.', action: 'Crear presupuesto' },
  evolucion:      { icon: '📝', title: 'Sin evoluciones SOAP', desc: 'Las notas clínicas aparecerán aquí después de la primera consulta.', action: 'Registrar primera evolución' },
  odontograma:    { icon: '🦷', title: 'Odontograma en blanco', desc: 'El odontograma se habilitará una vez que inicies la historia clínica.', action: 'Iniciar historia clínica' },
  consentimiento: { icon: '📄', title: 'Sin consentimientos', desc: 'Genera el consentimiento informado antes de iniciar cualquier procedimiento.', action: 'Generar consentimiento' },
};

function NewPatientEmptyState({ tab, patientName }: { tab: Tab; patientName: string }) {
  const hint = TAB_EMPTY_HINTS[tab];
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-6 py-12">
      <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-5 text-4xl"
        style={{ background: '#FFFBEB', border: '2px dashed #FDE68A' }}>
        {hint.icon}
      </div>
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-3" style={{ background: '#FEF3C7', border: '1px solid #FDE68A' }}>
        <span className="text-xs font-bold text-amber-700">★ NUEVO PACIENTE</span>
      </div>
      <h3 className="text-lg font-bold text-slate-800 mb-2">{hint.title}</h3>
      <p className="text-sm text-slate-400 max-w-sm mb-6">{hint.desc}</p>
      <p className="text-xs text-slate-300 mb-4 font-mono">Paciente: {patientName}</p>
      <button className="px-5 py-2.5 text-sm font-semibold text-white rounded-xl transition-opacity hover:opacity-90"
        style={{ background: 'linear-gradient(135deg, #D97706, #B45309)' }}>
        {hint.action}
      </button>
    </div>
  );
}

interface Props {
  calendarPatient?: { name: string; isNew: boolean } | null;
}

function resolveInitialState(calendarPatient: Props['calendarPatient']) {
  if (!calendarPatient) return { initialIdx: 0, initialExtras: [] as typeof BASE_LIST };

  const { name, isNew } = calendarPatient;

  if (!isNew) {
    const idx = NAME_TO_INDEX[name];
    if (idx !== undefined) return { initialIdx: idx, initialExtras: [] as typeof BASE_LIST };
  }

  // New patient — prepend to list, select index 0
  const newEntry = { name, ci: '—', lastVisit: 'Hoy (primera vez)', balance: 0, status: 'Nuevo', isNew: true };
  return { initialIdx: 0, initialExtras: [newEntry] };
}

export default function PatientView({ calendarPatient }: Props) {
  const { initialIdx, initialExtras } = resolveInitialState(calendarPatient);

  const [activeTab, setActiveTab] = useState<Tab>('historia');
  const [selectedPatient, setSelectedPatient] = useState(initialIdx);
  const [search, setSearch] = useState('');
  const [extraPatients] = useState<typeof BASE_LIST>(initialExtras);

  const patientList = [...extraPatients, ...BASE_LIST];

  const filtered = patientList.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.ci.includes(search)
  );

  // Resolve the display profile for the selected patient
  const selectedEntry = patientList[selectedPatient];
  const isSelectedNew = selectedEntry?.isNew ?? false;

  // Resolve the display profile for the selected patient
  const getProfile = (): Patient => {
    if (isSelectedNew) {
      return {
        name: selectedEntry?.name ?? 'Paciente Nuevo',
        ci: '—', age: 0, phone: '—', balance: 0,
        photo: '', lastVisit: 'Primera consulta', bloodType: '—', isNew: true,
      };
    }
    // extraPatients are prepended, so subtract their count to get the PATIENT_PROFILES index
    const profileIdx = selectedPatient - extraPatients.length;
    return PATIENT_PROFILES[Math.max(0, profileIdx)] ?? PATIENT_PROFILES[0];
  };

  const activeProfile = getProfile();

  return (
    <div className="flex h-full gap-0 overflow-hidden">
      {/* Patient list sidebar */}
      <div className="w-64 flex-shrink-0 flex flex-col border-r overflow-hidden" style={{ background: '#FFFFFF', borderColor: '#E2E8F0' }}>
        <div className="px-4 py-4 border-b" style={{ borderColor: '#EEF2F7' }}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-slate-800 text-sm">Pacientes</h2>
            <button className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-blue-50 text-blue-600 transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
          </div>
          <div className="relative">
            <svg className="absolute left-2.5 top-2.5" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar paciente..."
              className="w-full pl-8 pr-3 py-1.5 text-sm rounded-md border focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{ borderColor: '#E2E8F0', background: '#F8FAFC' }}
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filtered.map((p, i) => {
            // find the real index in patientList (not filtered)
            const realIdx = patientList.indexOf(p);
            const initials = p.name.split(' ').slice(0, 2).map(s => s[0]).join('');
            const colors = ['#1A4F8A', '#7C3AED', '#059669', '#D97706', '#B91C1C', '#0369A1'];
            return (
              <button
                key={i}
                onClick={() => { setSelectedPatient(realIdx); setActiveTab('historia'); }}
                className={`w-full px-4 py-3.5 text-left border-b flex items-center gap-3 transition-colors hover:bg-blue-50 ${selectedPatient === realIdx ? 'bg-blue-50 border-l-2' : ''}`}
                style={{ borderBottomColor: '#F1F5F9', borderLeftColor: selectedPatient === realIdx ? '#1A4F8A' : 'transparent' }}
              >
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                  style={{ background: p.isNew ? '#F59E0B' : colors[realIdx % colors.length] }}>
                  {initials}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <div className={`text-sm font-semibold truncate ${selectedPatient === realIdx ? 'text-blue-800' : 'text-slate-700'}`}>{p.name}</div>
                    {p.isNew && (
                      <span className="flex-shrink-0 text-xs font-bold px-1.5 py-0.5 rounded-full" style={{ background: '#FEF3C7', color: '#92400E', fontSize: '9px' }}>NUEVO</span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400 truncate">{p.isNew ? 'Primera consulta' : p.ci}</div>
                </div>
                {p.balance > 0 && !p.isNew && (
                  <div className="flex-shrink-0 text-xs font-mono font-bold text-amber-600">
                    Bs.{p.balance.toLocaleString()}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main patient area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Patient header */}
        <div className="flex-shrink-0 bg-white border-b px-6 py-5" style={{ borderColor: '#E2E8F0' }}>
          {/* New patient banner */}
          {isSelectedNew && (
            <div className="flex items-center gap-3 mb-4 px-4 py-3 rounded-xl" style={{ background: '#FFFBEB', border: '1px solid #FDE68A' }}>
              <span className="text-xl">★</span>
              <div>
                <p className="text-sm font-bold text-amber-800">Paciente Nuevo — Sin historial clínico</p>
                <p className="text-xs text-amber-600 mt-0.5">Este paciente fue agendado pero aún no tiene historia clínica. Completa el formulario de filiación para registrarlo.</p>
              </div>
              <button className="ml-auto flex-shrink-0 px-3 py-1.5 text-xs font-bold text-white rounded-lg" style={{ background: '#D97706' }}>
                Iniciar Historia
              </button>
            </div>
          )}
          <div className="flex items-start gap-5">
            {/* Photo / Avatar */}
            <div className="relative flex-shrink-0">
              {activeProfile.photo ? (
                <img
                  src={activeProfile.photo}
                  alt={activeProfile.name}
                  className="w-16 h-16 rounded-xl object-cover border-2"
                  style={{ borderColor: isSelectedNew ? '#FDE68A' : '#DBEAFE' }}
                />
              ) : (
                <div className="w-16 h-16 rounded-xl flex items-center justify-center text-white text-xl font-bold border-2"
                  style={{ background: '#F59E0B', borderColor: '#FDE68A' }}>
                  {activeProfile.name.split(' ').slice(0, 2).map(s => s[0]).join('')}
                </div>
              )}
              <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white ${isSelectedNew ? 'bg-amber-400' : 'bg-green-500'}`} title={isSelectedNew ? 'Nuevo' : 'Activo'} />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl font-bold text-slate-900 leading-tight">{activeProfile.name}</h1>
                    {isSelectedNew && (
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: '#FEF3C7', color: '#92400E', border: '1px solid #FDE68A' }}>NUEVO PACIENTE</span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5">
                    {!isSelectedNew && (
                      <>
                        <span className="flex items-center gap-1.5 text-sm text-slate-500">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                          </svg>
                          C.I. {activeProfile.ci}
                        </span>
                        <span className="text-slate-300">·</span>
                        <span className="text-sm text-slate-500">{activeProfile.age} años</span>
                        <span className="text-slate-300">·</span>
                        <span className="flex items-center gap-1.5 text-sm text-slate-500">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.15 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.1 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 16.92z" />
                          </svg>
                          {activeProfile.phone}
                        </span>
                        <span className="text-slate-300">·</span>
                        <span className="text-sm text-slate-500">Tipo <strong>{activeProfile.bloodType}</strong></span>
                        <span className="text-slate-300">·</span>
                      </>
                    )}
                    <span className="text-sm text-slate-500">
                      {isSelectedNew ? '📅 Cita programada para hoy' : <>Última visita: <strong>{activeProfile.lastVisit}</strong></>}
                    </span>
                  </div>
                </div>

                {/* Balance + Actions */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  {!isSelectedNew ? (
                  <div className="text-right px-4 py-2.5 rounded-lg" style={{ background: '#FFF7ED', border: '1px solid #FED7AA' }}>
                    <div className="text-xs font-semibold text-orange-500 uppercase tracking-wide">Deuda Pendiente</div>
                    <div className="text-xl font-bold text-orange-700 font-mono mt-0.5">Bs. {activeProfile.balance.toLocaleString()}</div>
                  </div>
                  ) : (
                  <div className="text-right px-4 py-2.5 rounded-lg" style={{ background: '#FFFBEB', border: '1px solid #FDE68A' }}>
                    <div className="text-xs font-semibold text-amber-600 uppercase tracking-wide">Sin historial</div>
                    <div className="text-sm font-bold text-amber-700 mt-0.5">Primera consulta</div>
                  </div>
                  )}
                  <div className="flex flex-col gap-2">
                    <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white rounded-md transition-opacity hover:opacity-90" style={{ background: '#1A4F8A' }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                      Nueva Cita
                    </button>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md border transition-colors hover:bg-green-50 text-green-700" style={{ borderColor: '#86EFAC', background: '#F0FDF4' }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                      </svg>
                      Registrar Pago
                    </button>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md border transition-colors hover:bg-slate-50 text-slate-600" style={{ borderColor: '#E2E8F0', background: '#F8FAFC' }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="6 9 6 2 18 2 18 9" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect x="6" y="14" width="12" height="8" />
                      </svg>
                      Imprimir H.C.
                    </button>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md border transition-colors hover:bg-green-50 text-green-700" style={{ borderColor: '#86EFAC', background: '#F0FDF4' }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                      </svg>
                      WhatsApp
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-0 mt-5 border-b overflow-x-auto" style={{ borderColor: '#E2E8F0', marginLeft: '-24px', marginRight: '-24px', paddingLeft: '24px', scrollbarWidth: 'none' }}>
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-700 text-blue-700'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto p-5">
          {isSelectedNew ? (
            <NewPatientEmptyState tab={activeTab} patientName={activeProfile.name} />
          ) : (
            <>
              {activeTab === 'historia'       && <ClinicalHistory />}
              {activeTab === 'galeria'        && <Gallery />}
              {activeTab === 'financiero'     && <Financial />}
              {activeTab === 'presupuesto'    && <Budget patientName={activeProfile.name} patientCI={activeProfile.ci} />}
              {activeTab === 'evolucion'      && <Evolution />}
              {activeTab === 'odontograma'    && <OdontogramModule />}
              {activeTab === 'consentimiento' && <ConsentModule />}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
