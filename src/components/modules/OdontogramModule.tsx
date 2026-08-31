import { useState } from 'react';

type ToothType = 'molar' | 'premolar' | 'canine' | 'incisor';
type ToothState = 'healthy' | 'caries' | 'filled' | 'missing' | 'crown' | 'fracture' | 'bridge';
type ToothRow = 'upper' | 'lower';

interface ToothData {
  number: number;
  type: ToothType;
  state: ToothState;
  surfaces?: Partial<Record<'mesial' | 'distal' | 'occlusal' | 'buccal' | 'lingual', ToothState>>;
  notes?: string;
}

const STATE_CFG: Record<ToothState, { fill: string; border: string; label: string; dotColor?: string }> = {
  healthy:  { fill: '#FFFFFF', border: '#CBD5E1', label: 'Sano' },
  caries:   { fill: '#FEF2F2', border: '#FCA5A5', label: 'Caries', dotColor: '#EF4444' },
  filled:   { fill: '#EFF6FF', border: '#93C5FD', label: 'Obturado', dotColor: '#3B82F6' },
  missing:  { fill: '#F8FAFC', border: '#CBD5E1', label: 'Ausente' },
  crown:    { fill: '#FFFBEB', border: '#FCD34D', label: 'Corona', dotColor: '#F59E0B' },
  fracture: { fill: '#FFF7ED', border: '#FDBA74', label: 'Fractura', dotColor: '#EA580C' },
  bridge:   { fill: '#F0FDF4', border: '#86EFAC', label: 'Puente', dotColor: '#22C55E' },
};

const mkTeeth = (numbers: number[], types: ToothType[], states: ToothState[]): ToothData[] =>
  numbers.map((n, i) => ({ number: n, type: types[i], state: states[i] }));

const MOLAR_T:    ToothType = 'molar';
const PREMOLAR_T: ToothType = 'premolar';
const CANINE_T:   ToothType = 'canine';
const INCISOR_T:  ToothType = 'incisor';

const UPPER_TEETH: ToothData[] = mkTeeth(
  [18,17,16,15,14,13,12,11, 21,22,23,24,25,26,27,28],
  [MOLAR_T,MOLAR_T,MOLAR_T,PREMOLAR_T,PREMOLAR_T,CANINE_T,INCISOR_T,INCISOR_T,
   INCISOR_T,INCISOR_T,CANINE_T,PREMOLAR_T,PREMOLAR_T,MOLAR_T,MOLAR_T,MOLAR_T],
  ['missing','healthy','caries','healthy','healthy','healthy','healthy','healthy',
   'healthy','healthy','healthy','filled','healthy','healthy','crown','missing'],
);

const LOWER_TEETH: ToothData[] = mkTeeth(
  [48,47,46,45,44,43,42,41, 31,32,33,34,35,36,37,38],
  [MOLAR_T,MOLAR_T,MOLAR_T,PREMOLAR_T,PREMOLAR_T,CANINE_T,INCISOR_T,INCISOR_T,
   INCISOR_T,INCISOR_T,CANINE_T,PREMOLAR_T,PREMOLAR_T,MOLAR_T,MOLAR_T,MOLAR_T],
  ['healthy','healthy','filled','healthy','fracture','healthy','healthy','healthy',
   'healthy','healthy','healthy','healthy','healthy','caries','healthy','missing'],
);

const toothDims: Record<ToothType, { crownW: number; crownH: number; rootH: number; rootCount: number; rx: number }> = {
  molar:    { crownW: 34, crownH: 28, rootH: 22, rootCount: 2, rx: 6 },
  premolar: { crownW: 24, crownH: 25, rootH: 20, rootCount: 1, rx: 5 },
  canine:   { crownW: 18, crownH: 30, rootH: 26, rootCount: 1, rx: 4 },
  incisor:  { crownW: 14, crownH: 24, rootH: 20, rootCount: 1, rx: 3 },
};

function ToothSVG({ tooth, row, isHovered }: { tooth: ToothData; row: ToothRow; isHovered: boolean }) {
  const d = toothDims[tooth.type];
  const cfg = STATE_CFG[tooth.state];
  const isMissing = tooth.state === 'missing';
  const totalH = d.crownH + d.rootH + 8;
  const mid = d.crownW / 2;

  const roots = Array.from({ length: d.rootCount }, (_, i) => {
    const offset = d.rootCount === 1 ? 0 : (i === 0 ? -d.crownW / 4.5 : d.crownW / 4.5);
    return offset;
  });

  const upperChain = row === 'upper';

  return (
    <svg
      width={d.crownW + 4}
      height={totalH + 4}
      viewBox={`0 0 ${d.crownW + 4} ${totalH + 4}`}
      style={{ overflow: 'visible' }}
    >
      {/* Roots */}
      {!isMissing && roots.map((offset, ri) => {
        const rx = mid + offset;
        if (upperChain) {
          return (
            <path
              key={ri}
              d={`M ${rx - 5} ${d.crownH + 2} Q ${rx - 3} ${d.crownH + d.rootH / 2 + 2} ${rx} ${d.crownH + d.rootH + 2}`}
              stroke={isHovered ? '#93C5FD' : '#CBD5E1'}
              strokeWidth="6"
              strokeLinecap="round"
              fill="none"
            />
          );
        } else {
          return (
            <path
              key={ri}
              d={`M ${rx} ${2} Q ${rx - 2} ${d.rootH / 2 + 2} ${rx} ${d.rootH + 2}`}
              stroke={isHovered ? '#93C5FD' : '#CBD5E1'}
              strokeWidth="6"
              strokeLinecap="round"
              fill="none"
            />
          );
        }
      })}

      {/* Crown */}
      {!isMissing ? (
        <>
          <rect
            x={2}
            y={upperChain ? 2 : d.rootH + 2}
            width={d.crownW}
            height={d.crownH}
            rx={d.rx}
            fill={isHovered ? '#EFF6FF' : cfg.fill}
            stroke={isHovered ? '#3B82F6' : cfg.border}
            strokeWidth={isHovered ? 2 : 1.5}
            style={{ filter: isHovered ? 'drop-shadow(0 0 6px rgba(59,130,246,0.3))' : undefined }}
          />

          {/* Crown indicator */}
          {tooth.state === 'crown' && (
            <rect
              x={2} y={upperChain ? 2 : d.rootH + 2}
              width={d.crownW} height={d.crownH} rx={d.rx}
              fill="none"
              stroke="#F59E0B" strokeWidth="2.5"
            />
          )}

          {/* Occlusal dot for caries / filled */}
          {(tooth.state === 'caries' || tooth.state === 'filled' || tooth.state === 'fracture') && cfg.dotColor && (
            <circle
              cx={mid + 2}
              cy={(upperChain ? 2 : d.rootH + 2) + d.crownH / 2}
              r={tooth.type === 'molar' ? 7 : tooth.type === 'premolar' ? 5 : 4}
              fill={cfg.dotColor}
              opacity={0.85}
            />
          )}

          {/* Fracture line */}
          {tooth.state === 'fracture' && (
            <line
              x1={mid - 4 + 2} y1={(upperChain ? 2 : d.rootH + 2) + 4}
              x2={mid + 6 + 2} y2={(upperChain ? 2 : d.rootH + 2) + d.crownH - 4}
              stroke="#EA580C" strokeWidth="1.5"
            />
          )}

          {/* Filled surface */}
          {tooth.state === 'filled' && (
            <rect
              x={2 + d.crownW * 0.25}
              y={(upperChain ? 2 : d.rootH + 2) + d.crownH * 0.25}
              width={d.crownW * 0.5}
              height={d.crownH * 0.5}
              rx={2}
              fill="#3B82F6"
              opacity={0.55}
            />
          )}

          {/* Bridge bar */}
          {tooth.state === 'bridge' && (
            <line
              x1={2} y1={(upperChain ? 2 : d.rootH + 2) + d.crownH / 2}
              x2={d.crownW + 2} y2={(upperChain ? 2 : d.rootH + 2) + d.crownH / 2}
              stroke="#22C55E" strokeWidth="3"
            />
          )}
        </>
      ) : (
        /* Missing tooth — X mark */
        <>
          <line
            x1={6} y1={upperChain ? 6 : d.rootH + 6}
            x2={d.crownW} y2={upperChain ? d.crownH - 2 : d.rootH + d.crownH - 2}
            stroke="#94A3B8" strokeWidth="2" strokeLinecap="round"
          />
          <line
            x1={d.crownW} y1={upperChain ? 6 : d.rootH + 6}
            x2={6} y2={upperChain ? d.crownH - 2 : d.rootH + d.crownH - 2}
            stroke="#94A3B8" strokeWidth="2" strokeLinecap="round"
          />
        </>
      )}
    </svg>
  );
}

interface PopoverProps {
  tooth: ToothData;
  onSelect: (state: ToothState) => void;
  onClose: () => void;
}

function ToothPopover({ tooth, onSelect, onClose }: PopoverProps) {
  const options: { state: ToothState; label: string; color: string; icon: string }[] = [
    { state: 'healthy',  label: 'Sano',         color: '#15803D', icon: '✓' },
    { state: 'caries',   label: 'Caries',        color: '#EF4444', icon: '●' },
    { state: 'filled',   label: 'Obturado',      color: '#3B82F6', icon: '■' },
    { state: 'crown',    label: 'Corona',         color: '#F59E0B', icon: '♦' },
    { state: 'missing',  label: 'Extracción',     color: '#6B7280', icon: '✕' },
    { state: 'fracture', label: 'Fractura',       color: '#EA580C', icon: '⚡' },
    { state: 'bridge',   label: 'Puente',         color: '#22C55E', icon: '—' },
  ];
  return (
    <div
      className="absolute z-30 rounded-xl shadow-2xl overflow-hidden"
      style={{
        bottom: 'calc(100% + 8px)',
        left: '50%',
        transform: 'translateX(-50%)',
        background: '#FFFFFF',
        border: '1px solid #E2E8F0',
        width: 170,
        boxShadow: '0 16px 48px rgba(0,0,0,0.18), 0 4px 12px rgba(0,0,0,0.1)',
      }}
    >
      <div className="px-3 py-2 border-b flex items-center justify-between" style={{ borderColor: '#F1F5F9', background: '#F8FAFD' }}>
        <span className="text-xs font-bold text-slate-600">Diente #{tooth.number}</span>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xs">✕</button>
      </div>
      <div className="py-1">
        {options.map(opt => (
          <button
            key={opt.state}
            onClick={() => { onSelect(opt.state); onClose(); }}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-blue-50 transition-colors"
          >
            <span className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
              style={{ background: opt.color, fontSize: 10 }}>{opt.icon}</span>
            <span className="text-sm text-slate-700 font-medium">{opt.label}</span>
            {tooth.state === opt.state && (
              <svg className="ml-auto" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
          </button>
        ))}
      </div>
      {/* Arrow */}
      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-r border-b"
        style={{ borderColor: '#E2E8F0', transform: 'translateX(-50%) rotate(45deg)', bottom: -7 }} />
    </div>
  );
}

export default function OdontogramModule() {
  const [upperTeeth, setUpperTeeth] = useState<ToothData[]>(UPPER_TEETH);
  const [lowerTeeth, setLowerTeeth] = useState<ToothData[]>(LOWER_TEETH);
  const [hovered, setHovered] = useState<number | null>(14);
  const [popoverTooth, setPopoverTooth] = useState<number | null>(14);

  const allTeeth = [...upperTeeth, ...lowerTeeth];

  const updateState = (num: number, state: ToothState) => {
    setUpperTeeth(prev => prev.map(t => t.number === num ? { ...t, state } : t));
    setLowerTeeth(prev => prev.map(t => t.number === num ? { ...t, state } : t));
  };

  const stats = Object.entries(STATE_CFG).map(([state, cfg]) => ({
    state: state as ToothState,
    count: allTeeth.filter(t => t.state === state).length,
    ...cfg,
  })).filter(s => s.count > 0 && s.state !== 'healthy');

  const cpoD = (() => {
    const cariados = allTeeth.filter(t => t.state === 'caries').length;
    const perdidos = allTeeth.filter(t => t.state === 'missing').length;
    const obturados = allTeeth.filter(t => t.state === 'filled').length;
    return { c: cariados, p: perdidos, o: obturados, total: cariados + perdidos + obturados };
  })();

  const renderRow = (teeth: ToothData[], row: ToothRow, setTeeth: typeof setUpperTeeth) => (
    <div className="flex items-end justify-center gap-1">
      {teeth.map((tooth, i) => {
        const isHov = hovered === tooth.number;
        const hasPopover = popoverTooth === tooth.number;
        const dim = toothDims[tooth.type];
        const totalH = dim.crownH + dim.rootH + 12;
        return (
          <div
            key={tooth.number}
            className="relative flex flex-col items-center cursor-pointer select-none"
            style={{ width: dim.crownW + 4 }}
            onMouseEnter={() => setHovered(tooth.number)}
            onMouseLeave={() => { setHovered(null); }}
            onClick={() => setPopoverTooth(popoverTooth === tooth.number ? null : tooth.number)}
          >
            {/* Number — upper */}
            {row === 'upper' && (
              <div className="text-center mb-1 font-mono font-semibold" style={{ fontSize: 9, color: isHov ? '#3B82F6' : '#94A3B8', transition: 'color 0.15s' }}>
                {tooth.number}
              </div>
            )}

            {/* Popover */}
            {hasPopover && (
              <ToothPopover
                tooth={tooth}
                onSelect={s => updateState(tooth.number, s)}
                onClose={() => setPopoverTooth(null)}
              />
            )}

            {/* Tooth SVG */}
            <ToothSVG tooth={tooth} row={row} isHovered={isHov} />

            {/* Number — lower */}
            {row === 'lower' && (
              <div className="text-center mt-1 font-mono font-semibold" style={{ fontSize: 9, color: isHov ? '#3B82F6' : '#94A3B8', transition: 'color 0.15s' }}>
                {tooth.number}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: '#E2E8F0' }}>
      {/* Header */}
      <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: '#EEF2F7', background: '#F8FAFD' }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#EFF6FF' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1A4F8A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2C8 2 5 5 5 9c0 2 1 4 2 5l1 7h8l1-7c1-1 2-3 2-5 0-4-3-7-7-7z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-slate-800 text-sm">Odontograma Interactivo</h3>
            <p className="text-xs text-slate-400">Haz clic en cualquier diente para editar su estado clínico</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: '#EFF6FF', color: '#1A4F8A' }}>
            CPO-D: {cpoD.total}
          </div>
          <button className="px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors hover:bg-slate-50" style={{ borderColor: '#E2E8F0', color: '#64748B' }}>
            Imprimir
          </button>
          <button className="px-3 py-1.5 text-xs font-semibold text-white rounded-lg transition-opacity hover:opacity-90" style={{ background: '#1A4F8A' }}>
            Guardar
          </button>
        </div>
      </div>

      <div className="px-6 py-5">
        {/* Midline label */}
        <div className="flex justify-center gap-16 mb-1">
          <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#94A3B8', fontSize: 9 }}>Superior Derecho</span>
          <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#94A3B8', fontSize: 9 }}>Superior Izquierdo</span>
        </div>

        {/* Upper row */}
        <div className="relative">
          {renderRow(upperTeeth, 'upper', setUpperTeeth)}
        </div>

        {/* Midline divider */}
        <div className="my-3 flex items-center gap-3">
          <div className="flex-1 border-t border-dashed" style={{ borderColor: '#E2E8F0' }} />
          <div className="flex items-center gap-2 px-2 py-0.5 rounded-full text-xs font-mono font-semibold" style={{ color: '#94A3B8', background: '#F8FAFC', border: '1px solid #F1F5F9', fontSize: 9 }}>
            LÍNEA MEDIA
          </div>
          <div className="flex-1 border-t border-dashed" style={{ borderColor: '#E2E8F0' }} />
        </div>

        {/* Lower row */}
        <div className="relative">
          {renderRow(lowerTeeth, 'lower', setLowerTeeth)}
        </div>

        <div className="flex justify-center gap-16 mt-1">
          <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#94A3B8', fontSize: 9 }}>Inferior Derecho</span>
          <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#94A3B8', fontSize: 9 }}>Inferior Izquierdo</span>
        </div>
      </div>

      {/* Stats row */}
      <div className="px-6 pb-4">
        <div className="grid grid-cols-4 gap-3 mb-5">
          {[
            { label: 'Cariados (C)', value: cpoD.c, color: '#EF4444', bg: '#FEF2F2' },
            { label: 'Perdidos (P)', value: cpoD.p, color: '#6B7280', bg: '#F1F5F9' },
            { label: 'Obturados (O)', value: cpoD.o, color: '#3B82F6', bg: '#EFF6FF' },
            { label: 'CPO-D Total', value: cpoD.total, color: '#1A4F8A', bg: '#EFF6FF' },
          ].map(s => (
            <div key={s.label} className="text-center px-3 py-2.5 rounded-xl" style={{ background: s.bg }}>
              <div className="text-2xl font-bold font-mono" style={{ color: s.color }}>{s.value}</div>
              <div className="text-xs font-semibold mt-0.5" style={{ color: s.color, opacity: 0.7 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="px-6 pb-5">
        <div className="flex flex-wrap gap-2 p-3 rounded-xl" style={{ background: '#F8FAFC', border: '1px solid #F1F5F9' }}>
          {Object.entries(STATE_CFG).map(([state, cfg]) => (
            <div key={state} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full" style={{ background: cfg.fill, border: `1px solid ${cfg.border}` }}>
              {cfg.dotColor
                ? <div className="w-2.5 h-2.5 rounded-full" style={{ background: cfg.dotColor }} />
                : <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#CBD5E1' }} />
              }
              <span className="text-xs font-semibold" style={{ color: cfg.dotColor ?? '#64748B' }}>{cfg.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
