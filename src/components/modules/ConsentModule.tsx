import { useState, useRef, useEffect } from 'react';

interface ConsentTemplate {
  id: number;
  title: string;
  category: string;
  risk: 'alto' | 'medio' | 'bajo';
  pages: number;
  icon: React.ReactNode;
  isPediatric?: boolean;
}

const iconTooth = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2C8 2 5 5 5 9c0 2 1 4 2 5l1 7h8l1-7c1-1 2-3 2-5 0-4-3-7-7-7z" />
  </svg>
);
const iconRoot = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="2" x2="12" y2="22" /><path d="M8 6c0 2 2 4 4 4s4-2 4-4" />
  </svg>
);
const iconImplant = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="2" x2="12" y2="22" /><line x1="6" y1="12" x2="18" y2="12" />
  </svg>
);
const iconSun = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
  </svg>
);
const iconBrace = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="4 7 4 4 20 4 20 7" /><line x1="9" y1="20" x2="15" y2="20" /><line x1="12" y1="4" x2="12" y2="20" />
  </svg>
);
const iconStar = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);
const iconGum = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12 Q6 6 12 6 Q18 6 21 12" /><line x1="12" y1="6" x2="12" y2="20" />
  </svg>
);
const iconChild = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4" /><path d="M6 20v-2a6 6 0 0 1 12 0v2" />
  </svg>
);

const TEMPLATES: ConsentTemplate[] = [
  { id: 1, title: 'Extracción de Tercer Molar', category: 'Cirugía Oral', risk: 'alto', pages: 3, icon: iconTooth },
  { id: 2, title: 'Tratamiento de Endodoncia', category: 'Endodoncia', risk: 'medio', pages: 2, icon: iconRoot },
  { id: 3, title: 'Colocación de Implante', category: 'Implantología', risk: 'alto', pages: 4, icon: iconImplant },
  { id: 4, title: 'Blanqueamiento Dental', category: 'Estética', risk: 'bajo', pages: 1, icon: iconSun },
  { id: 5, title: 'Ortodoncia — Inicio Tratamiento', category: 'Ortodoncia', risk: 'bajo', pages: 2, icon: iconBrace },
  { id: 6, title: 'Restauración Estética y Funcional', category: 'Rehabilitación Oral', risk: 'medio', pages: 2, icon: iconStar },
  { id: 7, title: 'Intervención Periodontal', category: 'Periodoncia', risk: 'medio', pages: 2, icon: iconGum },
  { id: 8, title: 'Atención en Niños', category: 'Odontopediatría', risk: 'bajo', pages: 2, icon: iconChild, isPediatric: true },
];

const riskCfg = {
  alto:  { label: 'Riesgo Alto',  color: '#B91C1C', bg: '#FEF2F2' },
  medio: { label: 'Riesgo Medio', color: '#92400E', bg: '#FFFBEB' },
  bajo:  { label: 'Riesgo Bajo',  color: '#15803D', bg: '#F0FDF4' },
};

const PATIENT_NAME = 'Carlos Rodrigo Mamani Quispe';
const today = new Date().toLocaleDateString('es-BO', { day: 'numeric', month: 'long', year: 'numeric' });

const CONSENT_TEXTS: Record<number, string> = {
  1: `FORMULARIO DE CONSENTIMIENTO INFORMADO
EXTRACCIÓN DE TERCER MOLAR (CORDAL)

ESTABLECIMIENTO DE SALUD: Consultorio Odontológico DOCK
CIUDAD: La Paz, Bolivia — Fecha: ${today}

I. DATOS DEL PACIENTE
Nombre completo: ${PATIENT_NAME}
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
El paciente declara: (a) haber leído y comprendido íntegramente el presente documento, (b) haber tenido la oportunidad de realizar preguntas, (c) que toda la información le fue proporcionada en idioma castellano de forma clara y con el tiempo suficiente para reflexionar sobre su decisión.`,

  2: `FORMULARIO DE CONSENTIMIENTO INFORMADO
TRATAMIENTO DE ENDODONCIA (TRATAMIENTO DE CONDUCTOS)

ESTABLECIMIENTO DE SALUD: Consultorio Odontológico DOCK
CIUDAD: La Paz, Bolivia — Fecha: ${today}

I. DATOS DEL PACIENTE
Nombre completo: ${PATIENT_NAME}
C.I.: 7823456 LP    Edad: 34 años    Teléfono: +591 72345678

II. DESCRIPCIÓN DEL PROCEDIMIENTO
El Dr. Juan Pérez Montoya ha informado al paciente sobre el tratamiento endodóntico a realizarse en el diente #[Número de Diente], cuyo diagnóstico indica necrosis pulpar / pulpitis irreversible que requiere tratamiento de conductos radiculares.

III. NATURALEZA Y OBJETIVOS
El tratamiento consiste en la instrumentación y conformación de los conductos radiculares, irrigación con hipoclorito de sodio al 5.25%, medicación intraconducto (hidróxido de calcio) y obturación definitiva con gutapercha termoplastificada. Posteriormente se indicará restauración coronal (obturación o corona, según evaluación).

IV. RIESGOS Y COMPLICACIONES POTENCIALES
• Sensibilidad post-operatoria transitoria (3-5 días)
• Fractura de instrumento endodóntico en el conducto (poco frecuente)
• Sobre-extensión del material de obturación al hueso
• Perforación radicular (infrecuente, por anatomía radicular compleja)
• Fractura radicular vertical (compromiso estructural previo)
• Necesidad de re-tratamiento o cirugía apical en casos de fracaso

V. ALTERNATIVAS DE TRATAMIENTO
(a) Extracción del diente afectado con posterior rehabilitación protésica, (b) mantenimiento paliativo con antibióticos, explicando que el tratamiento definitivo es la endodoncia o la exodoncia.

VI. DECLARACIÓN DEL PACIENTE
El paciente declara haber comprendido la naturaleza del tratamiento, sus riesgos, beneficios y alternativas, autorizando al profesional a proceder con el tratamiento endodóntico descrito.`,

  3: `FORMULARIO DE CONSENTIMIENTO INFORMADO
COLOCACIÓN DE IMPLANTE DENTAL OSEOINTEGRADO

ESTABLECIMIENTO DE SALUD: Consultorio Odontológico DOCK
CIUDAD: La Paz, Bolivia — Fecha: ${today}

I. DATOS DEL PACIENTE
Nombre completo: ${PATIENT_NAME}
C.I.: 7823456 LP    Edad: 34 años    Teléfono: +591 72345678

II. DESCRIPCIÓN DEL PROCEDIMIENTO
El Dr. Juan Pérez Montoya informa al paciente sobre la cirugía de colocación de implante dental en la zona del diente #[Número de Diente]. El implante es un tornillo de titanio de grado médico (Straumann® BL Ø 4.1mm × 10mm) que se insertará en el hueso alveolar bajo anestesia local.

III. NATURALEZA Y OBJETIVOS
Fase quirúrgica: incisión, levantamiento de colgajo, fresado de lecho implantario, colocación del implante y sutura. Período de oseointegración: 3-6 meses. Fase protésica: destape del implante, colocación de pilar y corona definitiva de zirconia o porcelana.

IV. RIESGOS Y COMPLICACIONES POTENCIALES
• Infección peri-implantaria (peri-implantitis)
• Fracaso de oseointegración y pérdida del implante (2-5%)
• Lesión de nervio dentario inferior (zona mandibular)
• Perforación de seno maxilar (zona posterior superior)
• Fractura del implante o del pilar protésico
• Necesidad de injertos óseos adicionales si hay insuficiencia ósea

V. CONDICIONES PREVIAS NECESARIAS
Higiene oral adecuada, control glucémico en diabéticos, cese de tabaquismo 2 semanas antes, niveles adecuados de vitamina D y calcio.

VI. DECLARACIÓN DEL PACIENTE
El paciente autoriza expresamente la cirugía implantológica, habiendo comprendido que el éxito a largo plazo depende en gran medida del mantenimiento y la higiene post-operatoria.`,

  4: `FORMULARIO DE CONSENTIMIENTO INFORMADO
BLANQUEAMIENTO DENTAL EN CONSULTORIO

ESTABLECIMIENTO DE SALUD: Consultorio Odontológico DOCK
CIUDAD: La Paz, Bolivia — Fecha: ${today}

I. DATOS DEL PACIENTE
Nombre completo: ${PATIENT_NAME}
C.I.: 7823456 LP    Edad: 34 años    Teléfono: +591 72345678

II. DESCRIPCIÓN DEL PROCEDIMIENTO
El Dr. Juan Pérez Montoya informa al paciente sobre el procedimiento de blanqueamiento dental en consultorio mediante la aplicación de peróxido de hidrógeno al 35% activado con lámpara LED, protocolo de 3 sesiones de 15 minutos cada una, en una sola cita.

III. NATURALEZA Y OBJETIVOS
El blanqueamiento busca aclarar el tono natural de los dientes en promedio 6-8 tonos en la escala Vita. El procedimiento incluye: aislamiento con dique de goma, aplicación del gel blanqueador, activación lumínica y aplicación de flúor al finalizar.

IV. RIESGOS Y COMPLICACIONES POTENCIALES
• Sensibilidad dental transitoria (24-72 horas post-tratamiento)
• Irritación gingival transitoria por contacto del gel
• Regresión del color a los 6-18 meses (resultados no permanentes)
• Resultado limitado en dientes con coloración intrínseca por tetraciclinas o fluorosis
• No afecta el color de restauraciones, coronas o carillas existentes

V. CUIDADOS POST-OPERATORIOS
Evitar alimentos con colorantes (café, vino, berries) por 72 horas. Usar pasta desensibilizante durante 1 semana. Cepillado suave. Mantenimiento cada 6-12 meses según indicación.

VI. DECLARACIÓN DEL PACIENTE
El paciente entiende que los resultados varían según la coloración original de sus dientes y sus hábitos alimentarios, y consiente voluntariamente en la realización del procedimiento.`,

  5: `FORMULARIO DE CONSENTIMIENTO INFORMADO
INICIO DE TRATAMIENTO DE ORTODONCIA

ESTABLECIMIENTO DE SALUD: Consultorio Odontológico DOCK
CIUDAD: La Paz, Bolivia — Fecha: ${today}

I. DATOS DEL PACIENTE
Nombre completo: ${PATIENT_NAME}
C.I.: 7823456 LP    Edad: 34 años    Teléfono: +591 72345678

II. DESCRIPCIÓN DEL PROCEDIMIENTO
El Dr. Juan Pérez Montoya informa al paciente sobre el inicio de tratamiento de ortodoncia correctiva con brackets metálicos / cerámicos, con duración estimada de 18 a 24 meses, incluyendo el uso de contención fija y removible al finalizar.

III. NATURALEZA Y OBJETIVOS
Corrección de maloclusión clase [I/II/III] con alineación de dientes, mejora de la oclusión, función masticatoria y estética dental. Incluye: colocación de brackets, arcos de NiTi progresivos, elásticos intermaxilares y controles mensuales.

IV. RIESGOS Y COMPLICACIONES POTENCIALES
• Descalcificación y manchas blancas por higiene deficiente
• Reabsorción radicular leve (radiológicamente observable, clínicamente poco relevante)
• Recidiva si no se usa la contención según indicaciones
• Incomodidad inicial con cada cambio de arco
• Fractura o despegue de brackets por alimentación inadecuada
• Prolongación del tratamiento por falta de cooperación

V. COMPROMISOS DEL PACIENTE
Asistir puntualmente a todos los controles, mantener higiene oral estricta, evitar alimentos duros o pegajosos, y usar los elásticos según indicaciones del especialista.

VI. DECLARACIÓN DEL PACIENTE
El paciente comprende que el éxito del tratamiento depende en gran medida de su cooperación y cumplimiento de las indicaciones, y consiente el inicio del tratamiento de ortodoncia.`,

  6: `FORMULARIO DE CONSENTIMIENTO INFORMADO
RESTAURACIÓN ESTÉTICA Y FUNCIONAL — REHABILITACIÓN ORAL

ESTABLECIMIENTO DE SALUD: Consultorio Odontológico DOCK
CIUDAD: La Paz, Bolivia — Fecha: ${today}

I. DATOS DEL PACIENTE
Nombre completo: ${PATIENT_NAME}
C.I.: 7823456 LP    Edad: 34 años    Teléfono: +591 72345678

II. DESCRIPCIÓN DEL PROCEDIMIENTO
El Dr. Juan Pérez Montoya informa al paciente sobre el plan de Restauración Estética y Funcional que incluye [Nombre del Procedimiento], orientado a recuperar la estética, la función masticatoria y la salud estructural de las piezas dentales afectadas mediante el uso de materiales de última generación (composite de nanorrelleno, cerámica E.max, zirconia monolítica).

III. NATURALEZA Y OBJETIVOS
El tratamiento comprende: (a) preparación de las piezas dentarias a restaurar, (b) toma de impresiones digitales con escáner intraoral, (c) fabricación en laboratorio certificado, (d) cementado definitivo con cemento de resina dual. Objetivo: devolver forma, función y estética acorde a los parámetros de la sonrisa natural del paciente.

IV. RIESGOS Y COMPLICACIONES POTENCIALES
• Sensibilidad post-preparación (1-2 semanas)
• Fractura de la restauración por carga excesiva o bruxismo
• Descementado del material por humedad o carga lateral
• Cambio de coloración con el tiempo (composite: 5-7 años; cerámica: 10-15 años)
• Necesidad de tratamiento endodóntico si la preparación compromete la pulpa

V. MANTENIMIENTO Y GARANTÍA
El profesional garantiza la calidad del material y técnica por 1 año. La garantía queda sin efecto ante ausencia de controles, traumatismos, parafunciones no tratadas o higiene deficiente.

VI. DECLARACIÓN DEL PACIENTE
El paciente autoriza el tratamiento de rehabilitación oral, habiendo recibido información completa sobre materiales, técnica y compromisos de mantenimiento.`,

  7: `FORMULARIO DE CONSENTIMIENTO INFORMADO
INTERVENCIÓN PERIODONTAL

ESTABLECIMIENTO DE SALUD: Consultorio Odontológico DOCK
CIUDAD: La Paz, Bolivia — Fecha: ${today}

I. DATOS DEL PACIENTE
Nombre completo: ${PATIENT_NAME}
C.I.: 7823456 LP    Edad: 34 años    Teléfono: +591 72345678

II. DESCRIPCIÓN DEL PROCEDIMIENTO
El Dr. Juan Pérez Montoya informa al paciente sobre la necesidad de realizar [Nombre del Procedimiento] para tratar la patología periodontal diagnosticada (periodontitis estadio [II/III/IV], grado [A/B/C]), la cual compromete el soporte óseo y tisular de las piezas dentales.

III. NATURALEZA Y OBJETIVOS
El tratamiento periodontal comprende: fase sistémica (instrucción de higiene, control de factores de riesgo), fase higiénica (raspado y alisado radicular bajo anestesia local por cuadrantes), fase quirúrgica si fuera necesario (colgajo de Widman modificado, injertos óseos o de tejido blando), y fase de mantenimiento cada 3 meses.

IV. RIESGOS Y COMPLICACIONES POTENCIALES
• Sensibilidad dental post-tratamiento (2-4 semanas)
• Retracción gingival (esperada y parte del tratamiento)
• Exposición de superficies radiculares con aumento de sensibilidad al frío
• Absceso periodontal si hay focos bacterianos residuales
• Pérdida progresiva de piezas en casos de enfermedad avanzada no tratada
• Recidiva sin mantenimiento periodontal continuo

V. PRONÓSTICO Y MANTENIMIENTO
La enfermedad periodontal es crónica y requiere control indefinido. El mantenimiento periodontal cada 3 meses es fundamental para el éxito a largo plazo. Sin tratamiento, la pérdida de las piezas afectadas es inevitable.

VI. DECLARACIÓN DEL PACIENTE
El paciente comprende la naturaleza crónica de la enfermedad periodontal y consiente en seguir el plan de tratamiento indicado, comprometiéndose con el mantenimiento a largo plazo.`,

  8: `FORMULARIO DE CONSENTIMIENTO INFORMADO
ATENCIÓN ODONTOLÓGICA EN NIÑOS

ESTABLECIMIENTO DE SALUD: Consultorio Odontológico DOCK
CIUDAD: La Paz, Bolivia — Fecha: ${today}

I. DATOS DEL PACIENTE (MENOR DE EDAD)
Nombre del niño/a: [Nombre del Paciente]
Fecha de Nacimiento: ___/___/______   Edad: ___ años
Nombre del Padre/Madre/Tutor: _________________________________
C.I. del Tutor Legal: _________________________________

II. DESCRIPCIÓN DEL PROCEDIMIENTO
El Dr. Juan Pérez Montoya ha informado al Padre, Madre o Tutor Legal sobre el procedimiento de [Nombre del Procedimiento] a realizar en el menor de edad antes mencionado, adaptando la técnica y los materiales a las necesidades específicas de la dentición infantil (primaria/mixta).

III. NATURALEZA Y OBJETIVOS
Los procedimientos en odontopediatría pueden incluir: sellantes de fosas y fisuras, restauraciones con ionómero de vidrio o composite, pulpotomías en dientes temporales, coronas de acero inoxidable, extracciones de dientes primarios, o mantenedores de espacio. El objetivo es preservar la salud dental del menor y asegurar el correcto desarrollo de su dentición permanente.

IV. RIESGOS Y COMPLICACIONES POTENCIALES
• Incomodidad o llanto durante el procedimiento (normal en niños pequeños)
• Reacción al anestésico local (muy infrecuente; se aplicará dosis pediátrica)
• Necesidad de sedación consciente en casos de alta ansiedad
• En pulpotomías: posibilidad de reabsorción radicular acelerada
• Fractura de dientes temporales con caries extensa

V. MANEJO DE LA CONDUCTA
Se utilizarán técnicas de manejo conductual basadas en la guía de la Academia Americana de Odontopediatría (AAPD): decir-mostrar-hacer, refuerzo positivo, distracción y/o sedación con óxido nitroso si el padre/tutor lo consiente explícitamente.

VI. DECLARACIÓN DEL PADRE, MADRE O TUTOR LEGAL
El Padre, Madre o Tutor Legal declara: (a) tener la custodia legal del menor, (b) haber comprendido los procedimientos, riesgos y beneficios descritos, (c) autorizar al Dr. Juan Pérez Montoya a realizar el tratamiento indicado.`,
};

export default function ConsentModule() {
  const [selectedTemplate, setSelectedTemplate] = useState<number>(1);
  const [hasDrawing, setHasDrawing] = useState(false);
  const [locked, setLocked] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });

  const template = TEMPLATES.find(t => t.id === selectedTemplate)!;
  const risk = riskCfg[template.risk];

  // Size the canvas to its CSS dimensions honoring devicePixelRatio
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    const ctx = canvas.getContext('2d')!;
    ctx.scale(dpr, dpr);
  }, []);

  // Clear canvas whenever the user picks a different template
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawing(false);
    setLocked(false);
  }, [selectedTemplate]);

  const getPos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const startDraw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (locked) return;
    isDrawing.current = true;
    lastPos.current = getPos(e);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current || locked) return;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = '#1A4F8A';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
    lastPos.current = pos;
    if (!hasDrawing) setHasDrawing(true);
  };

  const stopDraw = () => { isDrawing.current = false; };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawing(false);
    setLocked(false);
  };

  const consentText = CONSENT_TEXTS[selectedTemplate] ?? CONSENT_TEXTS[1];
  const signatureLabel = template.isPediatric
    ? 'Firma del Padre, Madre o Tutor Legal'
    : 'Firma Digital del Paciente';
  const signatureHint = template.isPediatric
    ? 'Firma del responsable legal del menor'
    : 'Dibuja tu firma con el mouse en el recuadro';

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
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors hover:bg-slate-50" style={{ borderColor: '#E2E8F0', color: '#64748B' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 6 2 18 2 18 9" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect x="6" y="14" width="12" height="8" />
            </svg>
            Imprimir
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors hover:bg-slate-50" style={{ borderColor: '#E2E8F0', color: '#64748B' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
            </svg>
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
                  onClick={() => setSelectedTemplate(t.id)}
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
            <span className="text-xs text-slate-500 font-semibold">{template.title}</span>
            <span className="text-xs text-slate-400">{template.pages} páginas · {template.category}</span>
            <div className="ml-auto flex items-center gap-2">
              <span className="text-xs text-slate-400 font-mono">Exp: HC-2024-0892</span>
            </div>
          </div>

          {/* Document text */}
          <div className="flex-1 overflow-y-auto px-8 py-6" style={{ background: '#FFFFFF' }}>
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
            <pre
              className="text-xs leading-relaxed whitespace-pre-wrap text-slate-700"
              style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}
            >
              {consentText}
            </pre>
          </div>

          {/* Signature block */}
          <div className="flex-shrink-0 border-t px-6 py-4" style={{ borderColor: '#EEF2F7', background: '#F8FAFD' }}>
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{signatureLabel}</p>
                <p className="text-xs text-slate-400 mt-0.5">{signatureHint}</p>
              </div>
              {hasDrawing && !locked && (
                <span className="text-xs font-semibold text-green-700 flex items-center gap-1">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Firma capturada
                </span>
              )}
            </div>

            {/* Canvas signature pad */}
            <div
              className="relative rounded-xl overflow-hidden mb-3"
              style={{
                height: 100,
                border: `2px solid ${locked ? '#86EFAC' : hasDrawing ? '#93C5FD' : '#E2E8F0'}`,
                background: locked ? '#F0FDF4' : '#F8FAFC',
              }}
            >
              {/* Decorative baseline */}
              <div className="absolute bottom-8 left-6 right-6 border-t border-dashed pointer-events-none" style={{ borderColor: '#E2E8F0' }} />
              <div className="absolute bottom-4 left-6 pointer-events-none select-none" style={{ color: '#CBD5E1', fontSize: 9 }}>
                {signatureLabel}
              </div>

              {/* Drawing canvas */}
              <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full"
                style={{ cursor: locked ? 'not-allowed' : 'crosshair', touchAction: 'none' }}
                onMouseDown={startDraw}
                onMouseMove={draw}
                onMouseUp={stopDraw}
                onMouseLeave={stopDraw}
              />

              {/* Placeholder */}
              {!hasDrawing && !locked && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="flex flex-col items-center gap-1 opacity-40 select-none">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                    </svg>
                    <span className="text-xs text-slate-400">Dibuja la firma aquí</span>
                  </div>
                </div>
              )}

              {/* Locked badge */}
              {locked && (
                <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-lg pointer-events-none" style={{ background: '#F0FDF4', border: '1px solid #86EFAC' }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#15803D" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  <span className="text-xs font-semibold text-green-700">Firmado y bloqueado</span>
                </div>
              )}
            </div>

            {/* Metadata shown after signing */}
            {hasDrawing && (
              <div className="flex items-center gap-4 mb-3 text-xs" style={{ color: '#94A3B8' }}>
                <span className="font-mono">Hash: a7f3c2d9...</span>
                <span>IP: 192.168.1.42</span>
                <span>{new Date().toLocaleTimeString('es-BO')}</span>
              </div>
            )}

            <div className="flex items-center justify-between">
              <button
                onClick={clearSignature}
                disabled={locked}
                className="text-xs text-slate-400 hover:text-slate-600 underline transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Limpiar Firma
              </button>
              <button
                onClick={() => { if (hasDrawing && !locked) setLocked(true); }}
                disabled={locked || !hasDrawing}
                className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: locked ? '#15803D' : '#1A4F8A', boxShadow: '0 4px 14px rgba(26,79,138,0.35)' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  {locked
                    ? <polyline points="20 6 9 17 4 12" />
                    : <><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></>
                  }
                </svg>
                {locked ? 'Documento Guardado' : hasDrawing ? 'Guardar y Bloquear Documento' : 'Firma para continuar'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
