import { useState } from 'react';

interface SOAPEntry {
  id: number;
  fecha: string;
  hora: string;
  edad: string;
  subjetivo: string;
  objetivo: string;
  analisis: string;
  plan: string;
  pa: string;
  fc: string;
  fr: string;
  temp: string;
  peso: string;
  doctor: string;
  signed: boolean;
}

const entries: SOAPEntry[] = [
  {
    id: 1,
    fecha: '12 Mar 2024', hora: '10:30', edad: '34 años',
    subjetivo: 'Paciente refiere dolor leve en zona de incisivos superiores al masticar. Menciona que comenzó hace 3 días. No refiere fiebre ni inflamación visible.',
    objetivo: 'Al examen clínico se observa ligera inflamación gingival en zona 11-21. Sondaje: 4mm en mesial del 11. Placa visible en tercio gingival. Radiografía periapical sin signos de patología periapical.',
    analisis: 'Gingivitis localizada asociada a placa. Posible inicio de periodontitis leve. Índice de placa: 35%.',
    plan: 'Detartraje supragingival y subgingival en zona anterior. Instrucción de higiene oral intensiva. Control en 3 semanas. Prescripción: Clorhexidina 0.12% enjuague por 14 días.',
    pa: '120/80', fc: '72 bpm', fr: '16 rpm', temp: '36.5°C', peso: '78 kg',
    doctor: 'Dr. J. Pérez Montoya', signed: true,
  },
  {
    id: 2,
    fecha: '15 Ene 2024', hora: '14:00', edad: '34 años',
    subjetivo: 'Primera consulta. Paciente acude para revisión general y blanqueamiento. Refiere no haber visitado dentista en 2 años. Sin dolor actual.',
    objetivo: 'Examen completo. Caries cavitada en 1.6 (oclusal), caries incipiente en 2.4 (interproximal). Placa generalizada. Cálculo subgingival moderado en sector posterior.',
    analisis: 'Diagnóstico: Caries activa múltiple + Gingivitis crónica generalizada. CPOD: 8.3',
    plan: 'Plan de tratamiento aprobado por paciente: 1) Limpieza profesional, 2) Obturación 1.6, 3) Sellante 2.4, 4) Blanqueamiento en consultorio. Presupuesto entregado.',
    pa: '118/76', fc: '68 bpm', fr: '14 rpm', temp: '36.2°C', peso: '77 kg',
    doctor: 'Dr. J. Pérez Montoya', signed: true,
  },
];

const VitalBadge = ({ label, value }: { label: string; value: string }) => (
  <div className="flex flex-col gap-0.5">
    <span className="text-xs text-slate-400 font-semibold uppercase tracking-wide">{label}</span>
    <span className="text-sm font-semibold" style={{ color: '#1A4F8A', fontFamily: "'JetBrains Mono', monospace" }}>{value}</span>
  </div>
);

export default function Evolution() {
  const [expanded, setExpanded] = useState<number>(1);
  const [showNew, setShowNew] = useState(false);

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="font-semibold text-slate-800">Evolución Clínica (SOAP)</h3>
          <p className="text-sm text-slate-500 mt-0.5">{entries.length} registros · Historial completo de consultas</p>
        </div>
        <button
          onClick={() => setShowNew(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-md transition-opacity hover:opacity-90"
          style={{ background: '#1A4F8A' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Nueva Evolución
        </button>
      </div>

      <div className="space-y-4">
        {entries.map((entry) => (
          <div key={entry.id} className="bg-white rounded-lg border overflow-hidden" style={{ borderColor: '#E2E8F0' }}>
            {/* Header */}
            <button
              className="w-full px-5 py-4 flex items-center gap-4 hover:bg-slate-50 transition-colors text-left"
              onClick={() => setExpanded(expanded === entry.id ? 0 : entry.id)}
            >
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0" style={{ background: 'linear-gradient(135deg, #1A4F8A, #3B82F6)' }}>
                {entry.id.toString().padStart(2, '0')}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-slate-800">{entry.fecha}</span>
                  <span className="text-slate-400">·</span>
                  <span className="text-sm text-slate-500 font-mono">{entry.hora}</span>
                  <span className="text-slate-400">·</span>
                  <span className="text-sm text-slate-500">{entry.edad}</span>
                </div>
                <p className="text-sm text-slate-400 mt-0.5 truncate">{entry.subjetivo.slice(0, 80)}…</p>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                {entry.signed && (
                  <span className="flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                    Firmado
                  </span>
                )}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform ${expanded === entry.id ? 'rotate-180' : ''}`}>
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>
            </button>

            {/* Expanded content */}
            {expanded === entry.id && (
              <div className="border-t" style={{ borderColor: '#EEF2F7' }}>
                {/* Vitals */}
                <div className="px-5 py-3 flex gap-6 border-b" style={{ background: '#F0F6FF', borderColor: '#DBEAFE' }}>
                  <VitalBadge label="P.A." value={entry.pa} />
                  <div className="w-px" style={{ background: '#BFDBFE' }} />
                  <VitalBadge label="F.C." value={entry.fc} />
                  <div className="w-px" style={{ background: '#BFDBFE' }} />
                  <VitalBadge label="F.R." value={entry.fr} />
                  <div className="w-px" style={{ background: '#BFDBFE' }} />
                  <VitalBadge label="Temp." value={entry.temp} />
                  <div className="w-px" style={{ background: '#BFDBFE' }} />
                  <VitalBadge label="Peso" value={entry.peso} />
                </div>

                {/* SOAP */}
                <div className="px-5 py-5 grid grid-cols-2 gap-5">
                  {[
                    { label: 'S — Subjetivo', value: entry.subjetivo, color: '#3B82F6', bg: '#EFF6FF' },
                    { label: 'O — Objetivo', value: entry.objetivo, color: '#7C3AED', bg: '#F5F3FF' },
                    { label: 'A — Análisis', value: entry.analisis, color: '#059669', bg: '#ECFDF5' },
                    { label: 'P — Plan de Acción', value: entry.plan, color: '#D97706', bg: '#FFFBEB' },
                  ].map(({ label, value, color, bg }) => (
                    <div key={label} className="rounded-lg p-4" style={{ background: bg }}>
                      <div className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color }}>{label}</div>
                      <p className="text-sm text-slate-700 leading-relaxed">{value}</p>
                    </div>
                  ))}
                </div>

                {/* Signature block */}
                <div className="px-5 py-4 border-t flex items-center justify-between" style={{ borderColor: '#EEF2F7', background: '#F8FAFD' }}>
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background: '#1A4F8A' }}>
                      JP
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-slate-700">{entry.doctor}</div>
                      <div className="text-xs text-slate-400">Odontólogo · Reg. SEDES LP-0892</div>
                    </div>
                    {entry.signed && (
                      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold" style={{ background: '#DCFCE7', color: '#15803D' }}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                        Firma Digital Válida
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button className="px-3 py-1.5 text-xs font-semibold rounded border hover:bg-slate-50 transition-colors" style={{ borderColor: '#D1D9E6', color: '#475569' }}>
                      Imprimir
                    </button>
                    <button className="px-3 py-1.5 text-xs font-semibold rounded border hover:bg-slate-50 transition-colors" style={{ borderColor: '#D1D9E6', color: '#475569' }}>
                      Editar
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* New Evolution Modal */}
      {showNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: '#EEF2F7' }}>
              <h3 className="font-semibold text-slate-800">Nueva Nota de Evolución (SOAP)</h3>
              <button onClick={() => setShowNew(false)} className="text-slate-400 hover:text-slate-600">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="overflow-y-auto px-6 py-5 space-y-4 flex-1">
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'Fecha', type: 'date' },
                  { label: 'Hora', type: 'time' },
                  { label: 'Edad', type: 'text', placeholder: '34 años' },
                ].map(f => (
                  <div key={f.label} className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{f.label}</label>
                    <input type={f.type} placeholder={f.placeholder} className="w-full px-3 py-2 text-sm rounded border bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" style={{ borderColor: '#D1D9E6' }} />
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-5 gap-3 p-3 rounded-lg" style={{ background: '#F0F6FF' }}>
                {[
                  { label: 'P.A.', placeholder: '120/80' },
                  { label: 'F.C.', placeholder: '72 bpm' },
                  { label: 'F.R.', placeholder: '16 rpm' },
                  { label: 'Temp.', placeholder: '36.5°C' },
                  { label: 'Peso', placeholder: '78 kg' },
                ].map(f => (
                  <div key={f.label} className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-blue-600 uppercase tracking-wide">{f.label}</label>
                    <input placeholder={f.placeholder} className="w-full px-2 py-1.5 text-sm rounded border bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono" style={{ borderColor: '#BFDBFE' }} />
                  </div>
                ))}
              </div>
              {[
                { label: 'S — Subjetivo', placeholder: 'Descripción del motivo de consulta según el paciente...' },
                { label: 'O — Objetivo', placeholder: 'Hallazgos clínicos, examen físico, resultados de pruebas...' },
                { label: 'A — Análisis / Diagnóstico', placeholder: 'Diagnóstico diferencial y conclusión clínica...' },
                { label: 'P — Plan de Acción', placeholder: 'Procedimientos realizados, prescripciones, instrucciones, citas de control...' },
              ].map(f => (
                <div key={f.label} className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{f.label}</label>
                  <textarea rows={3} placeholder={f.placeholder} className="w-full px-3 py-2 text-sm rounded border bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" style={{ borderColor: '#D1D9E6' }} />
                </div>
              ))}
            </div>
            <div className="px-6 py-4 border-t flex justify-end gap-2" style={{ borderColor: '#EEF2F7', background: '#F8FAFD' }}>
              <button onClick={() => setShowNew(false)} className="px-4 py-2 text-sm font-semibold rounded border hover:bg-slate-50 transition-colors" style={{ borderColor: '#D1D9E6', color: '#475569' }}>
                Cancelar
              </button>
              <button className="px-4 py-2 text-sm font-semibold text-white rounded transition-opacity hover:opacity-90" style={{ background: '#1A4F8A' }}>
                Guardar y Firmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
