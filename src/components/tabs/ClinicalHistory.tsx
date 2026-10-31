import { useState } from 'react';
import OdontogramModule, {
  createDefaultOdontogramSnapshot,
  createHealthyOdontogramSnapshot,
  type OdontogramSnapshot,
} from '../modules/OdontogramModule';

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

interface ClinicalHistoryProps {
  odontogram: OdontogramSnapshot;
  onOdontogramChange: (snapshot: OdontogramSnapshot) => void;
  odontogramLocked: boolean;
  onLockOdontogram: () => void;
}

export default function ClinicalHistory({
  odontogram,
  onOdontogramChange,
  odontogramLocked,
  onLockOdontogram,
}: ClinicalHistoryProps) {
  const [hemorrhage, setHemorrhage] = useState(false);

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
        <div className={`mb-4 rounded-lg border px-4 py-3 ${odontogramLocked ? 'border-slate-200 bg-slate-50' : 'border-blue-100 bg-blue-50'}`}>
          <div className="flex items-start gap-2.5">
            <svg className="mt-0.5 flex-shrink-0" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={odontogramLocked ? '#64748B' : '#2563EB'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {odontogramLocked
                ? <><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></>
                : <><circle cx="12" cy="12" r="9" /><path d="M12 8v4" /><path d="M12 16h.01" /></>}
            </svg>
            <div>
              <p className={`text-xs font-semibold ${odontogramLocked ? 'text-slate-700' : 'text-blue-800'}`}>
                {odontogramLocked ? 'Registro inicial sellado' : 'Odontograma de ingreso'}
              </p>
              <p className={`mt-0.5 text-xs leading-relaxed ${odontogramLocked ? 'text-slate-500' : 'text-blue-600'}`}>
                {odontogramLocked
                  ? 'Este odontograma conserva el estado en que llegó el paciente. Los cambios posteriores se registran únicamente en Evolución y en la pestaña Odontograma.'
                  : 'Mientras completas la Historia Clínica, cada cambio se replica en la pestaña Odontograma. Al guardar, esta fotografía inicial quedará inalterable.'}
              </p>
            </div>
          </div>
        </div>

        <OdontogramModule
          value={odontogram}
          onChange={onOdontogramChange}
          embedded
          readOnly={odontogramLocked}
        />

        <div className="mt-4 flex justify-end gap-3">
          <button
            onClick={() => onOdontogramChange(createDefaultOdontogramSnapshot())}
            disabled={odontogramLocked}
            className="px-4 py-2 text-sm font-semibold rounded-md border transition-colors hover:bg-slate-50"
            style={{ borderColor: '#D1D9E6', color: '#475569', opacity: odontogramLocked ? 0.45 : 1 }}
          >
            Restaurar
          </button>
          <button
            onClick={() => onOdontogramChange(createHealthyOdontogramSnapshot())}
            disabled={odontogramLocked}
            className="px-4 py-2 text-sm font-semibold rounded-md border transition-colors hover:bg-red-50"
            style={{ borderColor: '#FCA5A5', color: '#B91C1C', opacity: odontogramLocked ? 0.45 : 1 }}
          >
            Limpiar
          </button>
          <button
            onClick={onLockOdontogram}
            disabled={odontogramLocked}
            className="px-4 py-2 text-sm font-semibold rounded-md text-white transition-colors hover:opacity-90 disabled:cursor-default"
            style={{ background: odontogramLocked ? '#64748B' : '#1A4F8A' }}
          >
            {odontogramLocked ? 'Historia clínica registrada' : 'Guardar Historia Clínica'}
          </button>
        </div>
      </CardSection>
    </div>
    </>
  );
}
