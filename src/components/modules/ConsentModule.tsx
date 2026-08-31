import { useState, useRef } from 'react';

interface ConsentTemplate {
  id: number;
  title: string;
  category: string;
  risk: 'alto' | 'medio' | 'bajo';
  pages: number;
  icon: React.ReactNode;
}

const TEMPLATES: ConsentTemplate[] = [
  {
    id: 1,
    title: 'Extracción de Tercer Molar',
    category: 'Cirugía Oral',
    risk: 'alto',
    pages: 3,
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2C8 2 5 5 5 9c0 2 1 4 2 5l1 7h8l1-7c1-1 2-3 2-5 0-4-3-7-7-7z" />
      </svg>
    ),
  },
  {
    id: 2,
    title: 'Tratamiento de Endodoncia',
    category: 'Endodoncia',
    risk: 'medio',
    pages: 2,
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="2" x2="12" y2="22" /><path d="M8 6c0 2 2 4 4 4s4-2 4-4" />
      </svg>
    ),
  },
  {
    id: 3,
    title: 'Colocación de Implante',
    category: 'Implantología',
    risk: 'alto',
    pages: 4,
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="2" x2="12" y2="22" /><line x1="6" y1="12" x2="18" y2="12" />
      </svg>
    ),
  },
  {
    id: 4,
    title: 'Blanqueamiento Dental',
    category: 'Estética',
    risk: 'bajo',
    pages: 1,
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      </svg>
    ),
  },
  {
    id: 5,
    title: 'Ortodoncia — Inicio Tratamiento',
    category: 'Ortodoncia',
    risk: 'bajo',
    pages: 2,
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="4 7 4 4 20 4 20 7" /><line x1="9" y1="20" x2="15" y2="20" /><line x1="12" y1="4" x2="12" y2="20" />
      </svg>
    ),
  },
];

const riskCfg = {
  alto:  { label: 'Riesgo Alto',  color: '#B91C1C', bg: '#FEF2F2' },
  medio: { label: 'Riesgo Medio', color: '#92400E', bg: '#FFFBEB' },
  bajo:  { label: 'Riesgo Bajo',  color: '#15803D', bg: '#F0FDF4' },
};

const today = new Date().toLocaleDateString('es-BO', { day: 'numeric', month: 'long', year: 'numeric' });

const CONSENT_TEXT = `FORMULARIO DE CONSENTIMIENTO INFORMADO
EXTRACCIÓN DE TERCER MOLAR (CORDAL)

ESTABLECIMIENTO DE SALUD: Consultorio Odontológico DOCK
CIUDAD: La Paz, Bolivia — Fecha: ${today}

I. DATOS DEL PACIENTE
Nombre completo: Carlos Rodrigo Mamani Quispe
C.I.: 7823456 LP    Edad: 34 años    Teléfono: +591 72345678

II. DESCRIPCIÓN DEL PROCEDIMIENTO
El suscrito paciente, habiendo recibido explicación clara y comprensible por parte del Dr. Juan Pérez Montoya (Odontólogo — Reg. SEDES LP-0892), manifiesta haber sido informado sobre el procedimiento de extracción del tercer molar (diente del juicio) identificado como el diente #18 (superior derecho), el cual presenta impactación parcial con riesgo de infección pericoronaria.

III. NATURALEZA Y OBJETIVOS
El procedimiento consiste en la extracción quirúrgica del tercer molar bajo anestesia local tipo articaína al 4% con epinefrina. Se realizará incisión, levantamiento de colgajo mucoperióstico, osteotomía y odontosección según requiera el caso, seguido de sutura reabsorbible (Vicryl 3-0).

IV. RIESGOS Y COMPLICACIONES POTENCIALES
El paciente declara haber sido informado sobre los siguientes riesgos inherentes al procedimiento:
• Hemorragia post-operatoria inmediata y/o mediata
• Edema facial e inflamación tisular (normal hasta 72h)
• Trismus mandibular transitorio (dificultad para abrir la boca)
• Alveolitis post-extracción ("alveolo seco") — incidencia 5-10%
• Parestesia nerviosa transitoria del nervio alveolar inferior (muy poco frecuente)
• Comunicación bucosinusal en caso de raíces próximas al seno maxilar

V. ALTERNATIVAS DE TRATAMIENTO
Se ha informado al paciente sobre las alternativas: (a) mantenimiento con vigilancia periódica, (b) tratamiento antibiótico paliativo, explicando riesgos y beneficios de cada opción.

VI. DECLARACIÓN DEL PACIENTE
El paciente declara: (a) haber leído y comprendido íntegramente el presente documento, (b) haber tenido la oportunidad de realizar preguntas, (c) que toda la información le fue proporcionada en idioma castellano de forma clara y con el tiempo suficiente para reflexionar sobre su decisión.`;

export default function ConsentModule() {
  const [selectedTemplate, setSelectedTemplate] = useState<number>(1);
  const [signed, setSigned] = useState(false);
  const [cleared, setCleared] = useState(false);
  const [locked, setLocked] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  const template = TEMPLATES.find(t => t.id === selectedTemplate)!;
  const risk = riskCfg[template.risk];

  return (
    <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: '#E2E8F0' }}>
      {/* Header */}
      <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: '#EEF2F7', background: '#F8FAFD' }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#EFF6FF' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1A4F8A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-slate-800 text-sm">Consentimiento Informado Digital</h3>
            <p className="text-xs text-slate-400">Firma electrónica con validez legal · Paciente: Carlos R. Mamani Q.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {locked && (
            <span className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full" style={{ background: '#F0FDF4', color: '#15803D', border: '1px solid #86EFAC' }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              Documento bloqueado
            </span>
          )}
          <button className="px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors hover:bg-slate-50" style={{ borderColor: '#E2E8F0', color: '#64748B' }}>
            Descargar PDF
          </button>
        </div>
      </div>

      <div className="flex" style={{ height: 620 }}>
        {/* LEFT: Template list */}
        <div className="w-56 flex-shrink-0 border-r overflow-y-auto" style={{ borderColor: '#EEF2F7', background: '#FAFBFD' }}>
          <div className="px-3 py-3 border-b" style={{ borderColor: '#F1F5F9' }}>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Plantillas</p>
          </div>
          <div className="py-2">
            {TEMPLATES.map(t => {
              const isActive = t.id === selectedTemplate;
              const r = riskCfg[t.risk];
              return (
                <button
                  key={t.id}
                  onClick={() => { setSelectedTemplate(t.id); setSigned(false); setLocked(false); }}
                  className="w-full text-left px-3 py-3 transition-colors hover:bg-white"
                  style={{
                    background: isActive ? '#FFFFFF' : undefined,
                    borderLeft: isActive ? '3px solid #1A4F8A' : '3px solid transparent',
                  }}
                >
                  <div className="flex items-start gap-2.5">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ background: isActive ? '#EFF6FF' : '#F1F5F9', color: isActive ? '#1A4F8A' : '#94A3B8' }}
                    >
                      {t.icon}
                    </div>
                    <div className="min-w-0">
                      <div className={`text-xs font-semibold leading-tight ${isActive ? 'text-slate-800' : 'text-slate-600'}`}>{t.title}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{t.category}</div>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <span className="text-xs font-semibold px-1.5 py-0.5 rounded-full" style={{ background: r.bg, color: r.color, fontSize: 9 }}>
                          {r.label}
                        </span>
                        <span className="text-slate-400" style={{ fontSize: 9 }}>{t.pages}p</span>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* RIGHT: Document + Signature */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Doc meta bar */}
          <div className="flex-shrink-0 flex items-center gap-3 px-5 py-2.5 border-b" style={{ borderColor: '#F1F5F9', background: '#FAFBFD' }}>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: risk.bg, color: risk.color }}>{risk.label}</span>
            <span className="text-xs text-slate-400">{template.pages} páginas · Actualizado hoy</span>
            <div className="ml-auto flex items-center gap-2">
              <span className="text-xs text-slate-400 font-mono">Exp: HC-2024-0892</span>
            </div>
          </div>

          {/* Document text */}
          <div className="flex-1 overflow-y-auto px-8 py-6" style={{ background: '#FFFFFF' }}>
            {/* Letterhead */}
            <div className="flex items-start justify-between mb-6 pb-4 border-b" style={{ borderColor: '#EEF2F7' }}>
              <div>
                <div className="font-serif text-2xl text-slate-900 leading-none">DOCK</div>
                <div className="text-xs text-slate-400 mt-1 font-mono">Clínica Odontológica · dock.bo</div>
              </div>
              <div className="text-right">
                <div className="text-xs font-semibold text-slate-500">CONSENTIMIENTO INFORMADO</div>
                <div className="text-xs text-slate-400 mt-0.5 font-mono">N° CI-2024-0341</div>
                <div className="text-xs text-slate-400 font-mono">{today}</div>
              </div>
            </div>

            {/* Body text */}
            <pre
              className="text-xs leading-relaxed whitespace-pre-wrap text-slate-700"
              style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}
            >
              {CONSENT_TEXT}
            </pre>
          </div>

          {/* Signature Block */}
          <div className="flex-shrink-0 border-t px-6 py-4" style={{ borderColor: '#EEF2F7', background: '#F8FAFD' }}>
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Firma Digital del Paciente</p>
                <p className="text-xs text-slate-400 mt-0.5">Dibuja tu firma en el recuadro o usa el pad digital</p>
              </div>
              <div className="flex items-center gap-2">
                {signed && !locked && (
                  <span className="text-xs font-semibold text-green-700 flex items-center gap-1">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                    Firma capturada
                  </span>
                )}
              </div>
            </div>

            {/* Signature pad */}
            <div
              ref={canvasRef}
              className="relative rounded-xl overflow-hidden mb-3"
              style={{
                height: 100,
                background: locked ? '#F0FDF4' : '#F8FAFC',
                border: `2px solid ${locked ? '#86EFAC' : signed ? '#93C5FD' : '#E2E8F0'}`,
                cursor: locked ? 'not-allowed' : 'crosshair',
              }}
              onClick={() => { if (!locked) setSigned(true); }}
            >
              {/* Baseline */}
              <div className="absolute bottom-8 left-6 right-6 border-t border-dashed" style={{ borderColor: '#CBD5E1' }} />
              <div className="absolute bottom-4 left-6 text-xs" style={{ color: '#94A3B8', fontSize: 9 }}>Firma del paciente</div>

              {/* Signature SVG — only shows when signed */}
              {signed && (
                <svg
                  className="absolute inset-0 w-full h-full"
                  viewBox="0 0 400 100"
                  preserveAspectRatio="xMidYMid meet"
                >
                  <path
                    d="M 40 65 C 50 45 65 35 80 55 C 88 65 92 70 100 60 C 110 48 120 42 135 58 L 150 68 C 158 72 162 68 170 60 C 180 50 192 46 205 62 C 212 70 218 72 228 65 C 238 58 248 50 265 60 L 280 68 C 290 72 295 68 305 60 C 315 50 325 46 340 62 C 350 72 355 68 365 60"
                    stroke={locked ? '#15803D' : '#1A4F8A'}
                    strokeWidth="2"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M 90 62 C 95 50 100 42 110 55"
                    stroke={locked ? '#15803D' : '#1A4F8A'}
                    strokeWidth="1.5"
                    fill="none"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 200 62 L 220 48 L 210 72"
                    stroke={locked ? '#15803D' : '#1A4F8A'}
                    strokeWidth="1.5"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}

              {!signed && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex flex-col items-center gap-1 opacity-40">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                    </svg>
                    <span className="text-xs text-slate-400">Haz clic para firmar</span>
                  </div>
                </div>
              )}

              {locked && (
                <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-lg" style={{ background: '#F0FDF4', border: '1px solid #86EFAC' }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#15803D" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  <span className="text-xs font-semibold text-green-700">Firmado y bloqueado</span>
                </div>
              )}
            </div>

            {/* Signature metadata row */}
            {signed && (
              <div className="flex items-center gap-4 mb-3 text-xs" style={{ color: '#94A3B8' }}>
                <span className="font-mono">Hash: a7f3c2d9...</span>
                <span>IP: 192.168.1.42</span>
                <span>{new Date().toLocaleTimeString('es-BO')}</span>
              </div>
            )}

            <div className="flex items-center justify-between">
              <button
                onClick={() => { setSigned(false); setLocked(false); }}
                className="text-xs text-slate-400 hover:text-slate-600 underline transition-colors"
                disabled={locked}
              >
                Limpiar Firma
              </button>
              <button
                onClick={() => { if (signed) setLocked(true); else setSigned(true); }}
                disabled={locked}
                className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white rounded-xl transition-all disabled:opacity-50"
                style={{ background: locked ? '#15803D' : '#1A4F8A', boxShadow: '0 4px 14px rgba(26,79,138,0.35)' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  {locked
                    ? <><polyline points="20 6 9 17 4 12" /></>
                    : <><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></>
                  }
                </svg>
                {locked ? 'Documento Guardado' : signed ? 'Guardar y Bloquear Documento' : 'Firmar Documento'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
