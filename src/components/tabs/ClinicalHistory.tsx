import { useState } from 'react';
import { createPortal } from 'react-dom';

const CheckboxGroup = ({ items, cols = 3 }: { items: string[]; cols?: number }) => (
  <div className={`grid gap-x-4 gap-y-2`} style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
    {items.map((item) => (
      <label key={item} className="flex items-center gap-2 cursor-pointer group">
        <input type="checkbox" className="w-3.5 h-3.5 rounded accent-blue-600 cursor-pointer flex-shrink-0" />
        <span className="text-sm text-slate-600 group-hover:text-slate-800 transition-colors">{item}</span>
      </label>
    ))}
  </div>
);

const FormRow = ({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) => (
  <div className="flex flex-col gap-1">
    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
      {label}{required && <span className="text-red-400 ml-0.5">*</span>}
    </label>
    {children}
  </div>
);

const Input = ({ placeholder, defaultValue, type = 'text' }: { placeholder?: string; defaultValue?: string; type?: string }) => (
  <input
    type={type}
    defaultValue={defaultValue}
    placeholder={placeholder}
    className="w-full px-3 py-2 text-sm rounded border bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
    style={{ borderColor: '#D1D9E6', color: '#1E293B' }}
  />
);

const Select = ({ options }: { options: string[] }) => (
  <select
    className="w-full px-3 py-2 text-sm rounded border bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
    style={{ borderColor: '#D1D9E6', color: '#1E293B' }}
  >
    <option value="">Seleccionar...</option>
    {options.map(o => <option key={o} value={o}>{o}</option>)}
  </select>
);

const CardSection = ({ letter, title, children }: { letter: string; title: string; children: React.ReactNode }) => (
  <div className="bg-white rounded-lg border overflow-hidden" style={{ borderColor: '#E2E8F0' }}>
    <div className="px-5 py-3 border-b flex items-center gap-3" style={{ borderColor: '#EEF2F7', background: '#F8FAFD' }}>
      <div className="w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold text-white flex-shrink-0" style={{ background: '#1A4F8A' }}>
        {letter}
      </div>
      <h3 className="font-semibold text-slate-800 text-sm tracking-wide uppercase" style={{ letterSpacing: '0.04em' }}>{title}</h3>
    </div>
    <div className="px-5 py-5">{children}</div>
  </div>
);

const Toggle = ({ label, defaultChecked }: { label: string; defaultChecked?: boolean }) => {
  const [on, setOn] = useState(defaultChecked ?? false);
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-sm text-slate-600">{label}</span>
      <button
        onClick={() => setOn(!on)}
        className="relative flex-shrink-0 rounded-full transition-colors duration-200 focus:outline-none"
        style={{
          width: 40, height: 22,
          background: on ? '#2563EB' : '#CBD5E1',
        }}
        aria-checked={on}
        role="switch"
      >
        <span
          className="absolute bg-white rounded-full shadow-sm transition-transform duration-200"
          style={{
            width: 16, height: 16,
            top: 3, left: 3,
            transform: on ? 'translateX(18px)' : 'translateX(0)',
          }}
        />
      </button>
    </div>
  );
};

const patologicasFamiliares = ['Anemia', 'Asma', 'Hipertensión', 'Diabetes Mel.', 'Cardiopatías', 'Enf. Gástricas', 'Epilepsia', 'Hepatitis', 'Alergias', 'Tuberculosis', 'VIH', 'Embarazo'];

const toothNumbers = [
  ['18','17','16','15','14','13','12','11','21','22','23','24','25','26','27','28'],
  ['48','47','46','45','44','43','42','41','31','32','33','34','35','36','37','38'],
];

type ToothStateKey = 'sano' | 'cariado' | 'obturado' | 'corona' | 'ausente' | 'extraccion';

const STATE_CFG: Record<ToothStateKey, { label: string; bg: string; border: string; dot: string; text: string }> = {
  sano:       { label: 'Sano',               bg: '#F8FAFD', border: '#CBD5E1', dot: '#94A3B8', text: '#475569' },
  cariado:    { label: 'Cariado',            bg: '#FEE2E2', border: '#FCA5A5', dot: '#EF4444', text: '#B91C1C' },
  obturado:   { label: 'Obturado',           bg: '#DCFCE7', border: '#86EFAC', dot: '#22C55E', text: '#15803D' },
  corona:     { label: 'Corona/Prótesis',    bg: '#FEF3C7', border: '#FCD34D', dot: '#F59E0B', text: '#92400E' },
  ausente:    { label: 'Ausente/Perdido',    bg: '#E0E7FF', border: '#A5B4FC', dot: '#6366F1', text: '#3730A3' },
  extraccion: { label: 'Extracción indicada',bg: '#FCE7F3', border: '#F9A8D4', dot: '#EC4899', text: '#9D174D' },
};

const INITIAL_STATES: Record<string, ToothStateKey> = {
  '16': 'cariado', '11': 'cariado', '21': 'cariado',
  '14': 'obturado', '24': 'obturado',
  '26': 'corona',
  '46': 'ausente',
};

export default function ClinicalHistory() {
  const [hemorrhage, setHemorrhage] = useState(false);
  const [toothStates, setToothStates] = useState<Record<string, ToothStateKey>>(INITIAL_STATES);
  const [openTooth, setOpenTooth] = useState<{
    num: string;
    row: number;
    cx: number;   // center x of button in viewport
    top: number;  // button top in viewport
    bottom: number; // button bottom in viewport
  } | null>(null);

  const handleToothClick = (e: React.MouseEvent<HTMLButtonElement>, num: string, ri: number) => {
    e.stopPropagation();
    if (openTooth?.num === num) { setOpenTooth(null); return; }
    const r = e.currentTarget.getBoundingClientRect();
    setOpenTooth({ num, row: ri, cx: r.left + r.width / 2, top: r.top, bottom: r.bottom });
  };

  const setToothState = (num: string, state: ToothStateKey) => {
    setToothStates(prev => ({ ...prev, [num]: state }));
    setOpenTooth(null);
  };

  const allTeeth = toothNumbers.flat();
  const cpod = {
    c: allTeeth.filter(n => toothStates[n] === 'cariado').length,
    p: allTeeth.filter(n => toothStates[n] === 'ausente').length,
    o: allTeeth.filter(n => toothStates[n] === 'obturado').length,
  };

  return (
    <>
    <div className="space-y-4">
      {/* Card A: Filiación */}
      <CardSection letter="A" title="Filiación del Paciente">
        <div className="grid grid-cols-4 gap-x-5 gap-y-4">
          <FormRow label="N° de H.C." required><Input defaultValue="HC-2024-0892" /></FormRow>
          <FormRow label="C.I." required><Input defaultValue="7823456 LP" /></FormRow>
          <FormRow label="Apellido Paterno"><Input defaultValue="Mamani" /></FormRow>
          <FormRow label="Apellido Materno"><Input defaultValue="Quispe" /></FormRow>
          <FormRow label="Nombres"><Input defaultValue="Carlos Rodrigo" /></FormRow>
          <FormRow label="Edad"><Input defaultValue="34" type="number" /></FormRow>
          <FormRow label="Sexo"><Select options={['Masculino', 'Femenino', 'Otro']} /></FormRow>
          <FormRow label="Fecha de Nacimiento"><Input type="date" defaultValue="1990-03-15" /></FormRow>
          <FormRow label="Lugar de Nacimiento"><Input defaultValue="La Paz, Bolivia" /></FormRow>
          <FormRow label="Grado de Instrucción"><Select options={['Primaria', 'Secundaria', 'Técnico', 'Universitario', 'Postgrado']} /></FormRow>
          <FormRow label="Ocupación"><Input defaultValue="Ingeniero Civil" /></FormRow>
          <FormRow label="Estado Civil"><Select options={['Soltero/a', 'Casado/a', 'Divorciado/a', 'Viudo/a', 'Unión Libre']} /></FormRow>
          <div className="col-span-2"><FormRow label="Dirección"><Input defaultValue="Av. Arce N° 2145, Sopocachi, La Paz" /></FormRow></div>
          <FormRow label="Teléfono / Celular"><Input defaultValue="+591 72345678" /></FormRow>
          <FormRow label="Idioma"><Select options={['Español', 'Aymara', 'Quechua', 'Guaraní', 'Bilingüe']} /></FormRow>
          <FormRow label="Naciones Originarias"><Input placeholder="Ninguna" /></FormRow>
          <div className="col-span-3"><FormRow label="Persona que brinda la información"><Input defaultValue="El mismo paciente" /></FormRow></div>
        </div>
      </CardSection>

      {/* Card B: Antecedentes */}
      <CardSection letter="B" title="Antecedentes Patológicos">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Familiares</p>
            <CheckboxGroup items={patologicasFamiliares} cols={2} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Personales</p>
            <CheckboxGroup items={patologicasFamiliares} cols={2} />
          </div>
        </div>
        <div className="mt-5 pt-5 border-t" style={{ borderColor: '#EEF2F7' }}>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Hemorragia Previa</p>
                <button
                  onClick={() => setHemorrhage(!hemorrhage)}
                  className="relative flex-shrink-0 rounded-full transition-colors duration-200 focus:outline-none"
                  style={{ width: 40, height: 22, background: hemorrhage ? '#EF4444' : '#CBD5E1' }}
                  aria-checked={hemorrhage}
                  role="switch"
                >
                  <span
                    className="absolute bg-white rounded-full shadow-sm transition-transform duration-200"
                    style={{ width: 16, height: 16, top: 3, left: 3, transform: hemorrhage ? 'translateX(18px)' : 'translateX(0)' }}
                  />
                </button>
              </div>
              {hemorrhage && (
                <div className="flex gap-4 mt-2">
                  <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                    <input type="radio" name="hemorrhage" className="accent-red-500" /> Inmediata
                  </label>
                  <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                    <input type="radio" name="hemorrhage" className="accent-red-500" /> Mediata
                  </label>
                </div>
              )}
            </div>
            <div>
              <FormRow label="Medicamentos Actuales">
                <textarea
                  placeholder="Ej: Losartán 50mg, Metformina 850mg..."
                  rows={2}
                  className="w-full px-3 py-2 text-sm rounded border bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none transition-all"
                  style={{ borderColor: '#D1D9E6' }}
                />
              </FormRow>
            </div>
          </div>
        </div>
      </CardSection>

      {/* Card C: Examen Físico */}
      <CardSection letter="C" title="Examen Físico">
        <div className="grid grid-cols-2 gap-8">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Examen Extra Oral</p>
            <div className="space-y-3">
              {['ATM (Articulación Temporo-Mandibular)', 'Ganglios Linfáticos', 'Tipo Respirador'].map(field => (
                <FormRow key={field} label={field}>
                  <Input placeholder={field === 'Tipo Respirador' ? 'Nasal / Bucal / Mixto' : 'Normal / Alterado'} />
                </FormRow>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Examen Intra Oral</p>
            <div className="space-y-3">
              {['Labios', 'Lengua', 'Paladar', 'Piso de Boca', 'Mucosa Yugal', 'Encías', 'Prótesis'].map(field => (
                <FormRow key={field} label={field}>
                  <Input placeholder="Descripción clínica..." />
                </FormRow>
              ))}
            </div>
          </div>
        </div>
      </CardSection>

      {/* Card D: Higiene y Hábitos */}
      <CardSection letter="D" title="Higiene Oral y Hábitos">
        <div className="grid grid-cols-3 gap-6">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Hábitos Generales</p>
            <div className="space-y-1">
              <Toggle label="Fuma" />
              <Toggle label="Consume alcohol" />
              <Toggle label="Bruxismo" />
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Higiene Dental</p>
            <div className="space-y-1">
              <Toggle label="Usa cepillo dental" defaultChecked />
              <Toggle label="Usa hilo dental" />
              <Toggle label="Usa enjuague bucal" defaultChecked />
              <Toggle label="Sangrado de encías" />
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Estado de Higiene</p>
            <div className="space-y-2">
              {['Buena', 'Regular', 'Mala'].map(estado => (
                <label key={estado} className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="hygiene" defaultChecked={estado === 'Regular'} className="accent-blue-600" />
                  <span className="text-sm text-slate-600">{estado}</span>
                </label>
              ))}
            </div>
            <div className="mt-4">
              <FormRow label="Frecuencia de cepillado">
                <Select options={['1 vez/día', '2 veces/día', '3 veces/día', 'Irregular']} />
              </FormRow>
            </div>
          </div>
        </div>
      </CardSection>

      {/* Card E: Odontograma */}
      <CardSection letter="E" title="Odontograma y Estado Periodontal">
        <p className="text-xs text-slate-400 mb-4">Haz clic en cualquier diente para asignar su estado clínico.</p>

        <div className="overflow-x-auto pb-2">
          {toothNumbers.map((row, ri) => (
            <div key={ri} className="flex justify-center gap-1 mb-3">
              {row.map(num => {
                const stateKey = toothStates[num] ?? 'sano';
                const cfg = STATE_CFG[stateKey];
                const isOpen = openTooth?.num === num;

                return (
                  <div key={num} className="flex flex-col items-center gap-0.5">
                    <button
                      onClick={e => handleToothClick(e, num, ri)}
                      className="w-10 h-10 rounded border-2 flex items-center justify-center text-xs font-mono font-bold transition-all hover:scale-105"
                      style={{
                        background: cfg.bg,
                        borderColor: isOpen ? '#3B82F6' : cfg.border,
                        color: cfg.text,
                        boxShadow: isOpen ? '0 0 0 2px #BFDBFE' : undefined,
                        transform: isOpen ? 'scale(1.1)' : undefined,
                      }}
                    >
                      {num}
                    </button>
                    <div className="w-2 h-2 rounded-full" style={{
                      background: stateKey !== 'sano' ? cfg.dot : 'transparent',
                    }} />
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="mt-5 pt-4 border-t" style={{ borderColor: '#EEF2F7' }}>
          <div className="flex flex-wrap gap-2.5">
            {(Object.entries(STATE_CFG) as [ToothStateKey, typeof STATE_CFG[ToothStateKey]][]).map(([key, s]) => (
              <div key={key} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ background: s.bg, border: `1px solid ${s.border}` }}>
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: s.dot }} />
                <span className="text-xs font-semibold" style={{ color: s.text }}>{s.label}</span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-4 gap-4 mt-4">
            {[
              { label: 'Cariados (C)', value: cpod.c, color: '#B91C1C' },
              { label: 'Perdidos (P)', value: cpod.p, color: '#3730A3' },
              { label: 'Obturados (O)', value: cpod.o, color: '#15803D' },
              { label: 'CPO-D Total', value: cpod.c + cpod.p + cpod.o, color: '#1A4F8A' },
            ].map(({ label, value, color }) => (
              <div key={label} className="px-3 py-2.5 rounded-lg" style={{ background: '#F0F4F8' }}>
                <div className="text-xs text-slate-500 mb-0.5">{label}</div>
                <div className="text-lg font-bold" style={{ color, fontFamily: "'JetBrains Mono', monospace" }}>{value}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 flex justify-end gap-3">
          <button
            onClick={() => setToothStates(INITIAL_STATES)}
            className="px-4 py-2 text-sm font-semibold rounded-md border transition-colors hover:bg-slate-50"
            style={{ borderColor: '#D1D9E6', color: '#475569' }}
          >
            Restaurar
          </button>
          <button
            onClick={() => setToothStates({})}
            className="px-4 py-2 text-sm font-semibold rounded-md border transition-colors hover:bg-red-50"
            style={{ borderColor: '#FCA5A5', color: '#B91C1C' }}
          >
            Limpiar
          </button>
          <button className="px-4 py-2 text-sm font-semibold rounded-md text-white transition-colors hover:opacity-90" style={{ background: '#1A4F8A' }}>
            Guardar Historia Clínica
          </button>
        </div>
      </CardSection>
    </div>
    {/* Tooth state popover — rendered via portal so it escapes overflow:hidden ancestors */}
    {openTooth && createPortal(
      <>
        {/* backdrop */}
        <div className="fixed inset-0 z-40" onClick={() => setOpenTooth(null)} />

        {/* popover */}
        <div
          className="fixed z-50 rounded-xl overflow-hidden"
          style={{
            width: 176,
            left: Math.max(8, Math.min(openTooth.cx - 88, (typeof window !== 'undefined' ? window.innerWidth : 1200) - 184)),
            ...(openTooth.row === 1
              ? { bottom: (typeof window !== 'undefined' ? window.innerHeight : 800) - openTooth.top + 6 }
              : { top: openTooth.bottom + 6 }),
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            boxShadow: '0 16px 48px rgba(0,0,0,0.18), 0 4px 16px rgba(0,0,0,0.1)',
          }}
          onClick={e => e.stopPropagation()}
        >
          <div className="px-3 py-2 border-b flex items-center justify-between"
            style={{ background: '#F8FAFD', borderColor: '#F1F5F9' }}>
            <span className="text-xs font-bold text-slate-600">Diente #{openTooth.num}</span>
            <button onClick={() => setOpenTooth(null)}
              className="text-slate-400 hover:text-slate-600 text-xs leading-none">✕</button>
          </div>
          <div className="py-1">
            {(Object.entries(STATE_CFG) as [ToothStateKey, typeof STATE_CFG[ToothStateKey]][]).map(([key, s]) => {
              const current = toothStates[openTooth.num] ?? 'sano';
              return (
                <button
                  key={key}
                  onClick={() => setToothState(openTooth.num, key)}
                  className="w-full flex items-center gap-2.5 px-3 py-1.5 text-left hover:bg-blue-50 transition-colors"
                >
                  <div className="w-4 h-4 rounded border-2 flex-shrink-0"
                    style={{ background: s.bg, borderColor: s.border }} />
                  <span className="text-sm text-slate-700 font-medium">{s.label}</span>
                  {current === key && (
                    <svg className="ml-auto flex-shrink-0" width="12" height="12" viewBox="0 0 24 24"
                      fill="none" stroke="#3B82F6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </>,
      document.body
    )}
    </>
  );
}
