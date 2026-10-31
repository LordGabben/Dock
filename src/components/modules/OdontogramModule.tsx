import { useState } from 'react';
import { createPortal } from 'react-dom';

type ToothType = 'molar' | 'premolar' | 'canine' | 'incisor';
export type ToothState = 'healthy' | 'caries' | 'filled' | 'missing' | 'crown' | 'fracture' | 'bridge';
type ToothRow = 'upper' | 'lower';

export interface ToothData {
  number: number;
  type: ToothType;
  state: ToothState;
}

export interface OdontogramSnapshot {
  upper: ToothData[];
  lower: ToothData[];
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

// Slot width (px) — total horizontal space per tooth
const SW: Record<ToothType, number> = { molar: 36, premolar: 26, canine: 20, incisor: 15 };

// Occlusal view (top-down biting surface)
const OW: Record<ToothType, number> = { molar: 28, premolar: 18, canine: 13, incisor: 11 };
const OH: Record<ToothType, number> = { molar: 20, premolar: 14, canine: 12, incisor: 7 };

// Anatomical height proportions for crown and root.
const CH:  Record<ToothType, number> = { molar: 17, premolar: 18, canine: 22, incisor: 18 };
const RH:  Record<ToothType, number> = { molar: 22, premolar: 20, canine: 28, incisor: 20 };

const MAX_OCC_H = Math.max(...(Object.keys(OH) as ToothType[]).map(t => OH[t]));

const M = 'molar'    as const;
const P = 'premolar' as const;
const C = 'canine'   as const;
const I = 'incisor'  as const;

type TS = ToothState;

const mkTeeth = (nums: number[], types: ToothType[], states: TS[]): ToothData[] =>
  nums.map((n, i) => ({ number: n, type: types[i], state: states[i] }));

const TYPES_16: ToothType[] = [M,M,M,P,P,C,I,I, I,I,C,P,P,M,M,M];

const UPPER_TEETH: ToothData[] = mkTeeth(
  [18,17,16,15,14,13,12,11, 21,22,23,24,25,26,27,28],
  TYPES_16,
  ['missing','healthy','caries','healthy','healthy','healthy','healthy','healthy',
   'healthy','healthy','healthy','filled','healthy','healthy','crown','missing'],
);

const LOWER_TEETH: ToothData[] = mkTeeth(
  [48,47,46,45,44,43,42,41, 31,32,33,34,35,36,37,38],
  TYPES_16,
  ['healthy','healthy','filled','healthy','fracture','healthy','healthy','healthy',
   'healthy','healthy','healthy','healthy','healthy','caries','healthy','missing'],
);

export const createDefaultOdontogramSnapshot = (): OdontogramSnapshot => ({
  upper: UPPER_TEETH.map(tooth => ({ ...tooth })),
  lower: LOWER_TEETH.map(tooth => ({ ...tooth })),
});

export const createHealthyOdontogramSnapshot = (): OdontogramSnapshot => ({
  upper: UPPER_TEETH.map(tooth => ({ ...tooth, state: 'healthy' })),
  lower: LOWER_TEETH.map(tooth => ({ ...tooth, state: 'healthy' })),
});

// ─── Occlusal view (top-down biting surface) ────────────────────────────────

function OcclusalSVG({ tooth, isHovered }: { tooth: ToothData; isHovered: boolean }) {
  const { type, state } = tooth;
  const ow = OW[type];
  const oh = OH[type];
  const sw = SW[type];
  const cfg = STATE_CFG[state];
  const isMissing = state === 'missing';
  const cx = sw / 2;
  const cy = MAX_OCC_H / 2;
  const fill   = isHovered ? '#EFF6FF' : isMissing ? '#F8FAFC' : cfg.fill;
  const stroke = isHovered ? '#3B82F6' : cfg.border;
  const sW     = isHovered ? 2 : 1.5;

  const shape = () => {
    if (type === 'molar') {
      return (
        <>
          <path
            d={`M ${cx - ow/2 + 5} ${cy - oh/2}
                C ${cx - ow/2 + 1} ${cy - oh/2} ${cx - ow/2} ${cy - oh/2 + 4} ${cx - ow/2 + 1} ${cy}
                C ${cx - ow/2} ${cy + oh/2 - 4} ${cx - ow/2 + 3} ${cy + oh/2} ${cx - ow/2 + 7} ${cy + oh/2 - 1}
                C ${cx - 2} ${cy + oh/2 + 1} ${cx + 2} ${cy + oh/2 + 1} ${cx + 6} ${cy + oh/2 - 1}
                C ${cx + ow/2 - 2} ${cy + oh/2} ${cx + ow/2 + 1} ${cy + oh/2 - 4} ${cx + ow/2 - 1} ${cy}
                C ${cx + ow/2 + 1} ${cy - oh/2 + 4} ${cx + ow/2 - 2} ${cy - oh/2} ${cx + ow/2 - 6} ${cy - oh/2 + 1}
                C ${cx + 3} ${cy - oh/2 - 1} ${cx - 2} ${cy - oh/2 - 1} ${cx - ow/2 + 5} ${cy - oh/2} Z`}
            fill={fill} stroke={stroke} strokeWidth={sW} strokeLinejoin="round"
          />
          {!isMissing && (
            <>
              <path d={`M ${cx} ${cy - oh/2 + 3} C ${cx - 2} ${cy - 2} ${cx + 2} ${cy + 2} ${cx} ${cy + oh/2 - 3}`}
                stroke={isHovered ? '#93C5FD' : '#CBD5E1'} strokeWidth="0.8" fill="none" />
              <path d={`M ${cx - ow/2 + 4} ${cy} C ${cx - 3} ${cy - 2} ${cx + 3} ${cy + 2} ${cx + ow/2 - 4} ${cy}`}
                stroke={isHovered ? '#93C5FD' : '#CBD5E1'} strokeWidth="0.8" fill="none" />
              <circle cx={cx - 5} cy={cy - 4} r="1.4" fill="none" stroke="#E2E8F0" strokeWidth="0.7" />
              <circle cx={cx + 5} cy={cy + 4} r="1.4" fill="none" stroke="#E2E8F0" strokeWidth="0.7" />
            </>
          )}
        </>
      );
    }
    if (type === 'premolar') {
      return (
        <>
          <path
            d={`M ${cx} ${cy - oh/2}
                C ${cx + ow/2 - 1} ${cy - oh/2 + 1} ${cx + ow/2 + 1} ${cy - 2} ${cx + ow/2 - 1} ${cy + 3}
                C ${cx + ow/2 - 2} ${cy + oh/2} ${cx + 3} ${cy + oh/2 + 1} ${cx} ${cy + oh/2 - 1}
                C ${cx - 3} ${cy + oh/2 + 1} ${cx - ow/2 + 2} ${cy + oh/2} ${cx - ow/2 + 1} ${cy + 3}
                C ${cx - ow/2 - 1} ${cy - 2} ${cx - ow/2 + 1} ${cy - oh/2 + 1} ${cx} ${cy - oh/2} Z`}
            fill={fill} stroke={stroke} strokeWidth={sW}
          />
          {!isMissing && (
            <>
              <path d={`M ${cx - ow/2 + 3} ${cy} Q ${cx} ${cy - 3} ${cx + ow/2 - 3} ${cy}`}
                stroke={isHovered ? '#93C5FD' : '#CBD5E1'} strokeWidth="0.8" fill="none" />
              <path d={`M ${cx - 2} ${cy - oh/2 + 3} Q ${cx} ${cy} ${cx - 2} ${cy + oh/2 - 3}`}
                stroke="#E2E8F0" strokeWidth="0.7" fill="none" />
            </>
          )}
        </>
      );
    }
    if (type === 'canine') {
      return (
        <path
          d={`M ${cx} ${cy - oh/2}
              C ${cx + ow/2} ${cy - oh/2 + 2} ${cx + ow/2 + 1} ${cy + 2} ${cx + 2} ${cy + oh/2}
              C ${cx} ${cy + oh/2 + 1} ${cx - 2} ${cy + oh/2} ${cx - ow/2 - 1} ${cy + 2}
              C ${cx - ow/2} ${cy - oh/2 + 2} ${cx - 2} ${cy - oh/2 + 1} ${cx} ${cy - oh/2} Z`}
          fill={fill} stroke={stroke} strokeWidth={sW}
        />
      );
    }
    // incisor
    return (
      <path
        d={`M ${cx - ow/2 + 1} ${cy - oh/2}
            Q ${cx} ${cy - oh/2 - 1} ${cx + ow/2 - 1} ${cy - oh/2}
            L ${cx + ow/2} ${cy + oh/2 - 2}
            Q ${cx} ${cy + oh/2 + 1} ${cx - ow/2} ${cy + oh/2 - 2} Z`}
        fill={fill} stroke={stroke} strokeWidth={sW} strokeLinejoin="round"
      />
    );
  };

  const indicator = () => {
    if (isMissing) {
      return (
        <>
          <line x1={cx - ow/2 + 2} y1={cy - oh/2 + 2} x2={cx + ow/2 - 2} y2={cy + oh/2 - 2}
            stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />
          <line x1={cx + ow/2 - 2} y1={cy - oh/2 + 2} x2={cx - ow/2 + 2} y2={cy + oh/2 - 2}
            stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />
        </>
      );
    }
    if ((state === 'caries' || state === 'fracture') && cfg.dotColor) {
      const r = type === 'molar' ? 5 : type === 'premolar' ? 3.5 : 3;
      return state === 'fracture'
        ? <line x1={cx - 3} y1={cy - oh/2 + 2} x2={cx + 3} y2={cy + oh/2 - 2}
            stroke="#EA580C" strokeWidth="1.5" strokeLinecap="round" />
        : <circle cx={cx} cy={cy} r={r} fill={cfg.dotColor} opacity={0.85} />;
    }
    if (state === 'filled' && cfg.dotColor) {
      const hw = type === 'molar' ? 7 : type === 'premolar' ? 4 : 3;
      const hh = type === 'molar' ? 5 : type === 'premolar' ? 3.5 : 2.5;
      return <rect x={cx - hw} y={cy - hh} width={hw * 2} height={hh * 2} rx={1}
        fill={cfg.dotColor} opacity={0.55} />;
    }
    if (state === 'crown') {
      return <circle cx={cx} cy={cy} r={Math.min(ow, oh) / 2 * 0.55}
        fill="none" stroke="#F59E0B" strokeWidth="1.5" />;
    }
    return null;
  };

  return (
    <svg width={sw} height={MAX_OCC_H} viewBox={`0 0 ${sw} ${MAX_OCC_H}`}>
      {shape()}
      {indicator()}
    </svg>
  );
}

// ─── Lateral view (buccal side profile with crown + roots) ───────────────────

function LateralSVG({ tooth, row, isHovered }: { tooth: ToothData; row: ToothRow; isHovered: boolean }) {
  const { type, state } = tooth;
  const sw = SW[type];
  const cx = sw / 2;
  const rh = RH[type];
  const ch = CH[type];
  const totalH = rh + ch + 4;
  const neckY = rh + 2;
  const crownBottom = neckY + ch;
  const cfg = STATE_CFG[state];
  const isMissing = state === 'missing';
  const crownFill = isHovered ? '#EFF6FF' : cfg.fill;
  const crownStroke = isHovered ? '#3B82F6' : cfg.border;
  const rootStroke = isHovered ? '#93C5FD' : '#B8C2CE';
  const anatomyTransform = row === 'lower' ? `translate(0 ${totalH}) scale(1 -1)` : undefined;

  const rootPaths = () => {
    if (isMissing) return null;

    if (type === 'molar') {
      return (
        <>
          {row === 'upper' && (
            <path
              d={`M ${cx - 3} ${neckY + 2} C ${cx - 4} ${neckY - 7} ${cx - 3} 8 ${cx - 1} 2
                  C ${cx + 1} 8 ${cx + 2} ${neckY - 6} ${cx + 3} ${neckY + 2} Z`}
              fill="#F8FAFC" stroke={rootStroke} strokeWidth="1.1"
            />
          )}
          <path
            d={`M ${cx - 8} ${neckY + 2} C ${cx - 12} ${neckY - 7} ${cx - 13} 9 ${cx - 11} 3
                C ${cx - 9} 0 ${cx - 6} 9 ${cx - 4} ${neckY + 2} Z`}
            fill="#FAFAF9" stroke={rootStroke} strokeWidth="1.2"
          />
          <path
            d={`M ${cx + 8} ${neckY + 2} C ${cx + 12} ${neckY - 7} ${cx + 13} 9 ${cx + 11} 3
                C ${cx + 9} 0 ${cx + 6} 9 ${cx + 4} ${neckY + 2} Z`}
            fill="#FAFAF9" stroke={rootStroke} strokeWidth="1.2"
          />
        </>
      );
    }

    if (type === 'premolar') {
      return (
        <>
          <path
            d={`M ${cx - 5} ${neckY + 1} C ${cx - 7} ${neckY - 7} ${cx - 6} 8 ${cx - 3} 2
                C ${cx - 1} 0 ${cx} 11 ${cx} ${neckY + 1} Z`}
            fill="#FAFAF9" stroke={rootStroke} strokeWidth="1.1"
          />
          <path
            d={`M ${cx + 5} ${neckY + 1} C ${cx + 7} ${neckY - 7} ${cx + 6} 8 ${cx + 3} 2
                C ${cx + 1} 0 ${cx} 11 ${cx} ${neckY + 1} Z`}
            fill="#FAFAF9" stroke={rootStroke} strokeWidth="1.1"
          />
        </>
      );
    }

    const rootHalfWidth = type === 'canine' ? 4.5 : 3.7;
    return (
      <path
        d={`M ${cx - rootHalfWidth} ${neckY + 1}
            C ${cx - rootHalfWidth - 1} ${neckY - 8} ${cx - 3} 8 ${cx} 2
            C ${cx + 3} 8 ${cx + rootHalfWidth + 1} ${neckY - 8} ${cx + rootHalfWidth} ${neckY + 1} Z`}
        fill="#FAFAF9" stroke={rootStroke} strokeWidth="1.15"
      />
    );
  };

  const crownPath = () => {
    if (type === 'molar') {
      return `M ${cx - 8} ${neckY}
        C ${cx - 12} ${neckY + 3} ${cx - 13} ${neckY + 10} ${cx - 12} ${crownBottom - 4}
        C ${cx - 12} ${crownBottom - 1} ${cx - 9} ${crownBottom + 1} ${cx - 7} ${crownBottom - 2}
        C ${cx - 5} ${crownBottom + 2} ${cx - 2} ${crownBottom + 2} ${cx} ${crownBottom - 2}
        C ${cx + 2} ${crownBottom + 2} ${cx + 5} ${crownBottom + 2} ${cx + 7} ${crownBottom - 2}
        C ${cx + 9} ${crownBottom + 1} ${cx + 12} ${crownBottom - 1} ${cx + 12} ${crownBottom - 4}
        C ${cx + 13} ${neckY + 10} ${cx + 12} ${neckY + 3} ${cx + 8} ${neckY}
        C ${cx + 4} ${neckY + 2} ${cx - 4} ${neckY + 2} ${cx - 8} ${neckY} Z`;
    }
    if (type === 'premolar') {
      return `M ${cx - 6} ${neckY}
        C ${cx - 9} ${neckY + 4} ${cx - 9} ${crownBottom - 5} ${cx - 7} ${crownBottom - 2}
        C ${cx - 5} ${crownBottom + 1} ${cx - 2} ${crownBottom - 1} ${cx} ${crownBottom - 5}
        C ${cx + 2} ${crownBottom - 1} ${cx + 5} ${crownBottom + 1} ${cx + 7} ${crownBottom - 2}
        C ${cx + 9} ${crownBottom - 5} ${cx + 9} ${neckY + 4} ${cx + 6} ${neckY}
        C ${cx + 3} ${neckY + 2} ${cx - 3} ${neckY + 2} ${cx - 6} ${neckY} Z`;
    }
    if (type === 'canine') {
      return `M ${cx - 4.5} ${neckY}
        C ${cx - 7} ${neckY + 4} ${cx - 7} ${crownBottom - 7} ${cx - 4} ${crownBottom - 3}
        L ${cx} ${crownBottom + 1}
        L ${cx + 4} ${crownBottom - 3}
        C ${cx + 7} ${crownBottom - 7} ${cx + 7} ${neckY + 4} ${cx + 4.5} ${neckY}
        C ${cx + 2} ${neckY + 1.5} ${cx - 2} ${neckY + 1.5} ${cx - 4.5} ${neckY} Z`;
    }
    return `M ${cx - 4.5} ${neckY}
      C ${cx - 6} ${neckY + 4} ${cx - 6} ${crownBottom - 4} ${cx - 5} ${crownBottom - 1}
      Q ${cx} ${crownBottom + 1} ${cx + 5} ${crownBottom - 1}
      C ${cx + 6} ${crownBottom - 4} ${cx + 6} ${neckY + 4} ${cx + 4.5} ${neckY}
      C ${cx + 2} ${neckY + 1.5} ${cx - 2} ${neckY + 1.5} ${cx - 4.5} ${neckY} Z`;
  };

  const crownD = crownPath();

  return (
    <svg width={sw} height={totalH} viewBox={`0 0 ${sw} ${totalH}`} style={{ overflow: 'visible' }}>
      <g transform={anatomyTransform}>
        {rootPaths()}
        <path
          d={crownD}
          fill={isMissing ? '#F8FAFC' : crownFill}
          stroke={crownStroke}
          strokeWidth={isHovered ? 1.8 : 1.35}
          strokeLinejoin="round"
          strokeDasharray={isMissing ? '2 2' : undefined}
        />
        {!isMissing && (
          <>
            <path
              d={`M ${cx - (type === 'molar' ? 8 : 4)} ${neckY + 4}
                  Q ${cx} ${neckY + 1} ${cx + (type === 'molar' ? 8 : 4)} ${neckY + 4}`}
              fill="none" stroke="#DCE3EA" strokeWidth="0.8"
            />
            <path
              d={`M ${cx - (type === 'molar' ? 7 : 3)} ${crownBottom - 4}
                  Q ${cx} ${crownBottom - 1} ${cx + (type === 'molar' ? 7 : 3)} ${crownBottom - 4}`}
              fill="none" stroke="#E2E8F0" strokeWidth="0.75"
            />
          </>
        )}
        {isMissing && (
          <>
            <line x1={cx - 5} y1={neckY + 5} x2={cx + 5} y2={crownBottom - 3} stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />
            <line x1={cx + 5} y1={neckY + 5} x2={cx - 5} y2={crownBottom - 3} stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />
          </>
        )}
        {state === 'crown' && <path d={crownD} fill="none" stroke="#F59E0B" strokeWidth="2.2" />}
        {state === 'bridge' && (
          <path
            d={`M ${cx - (type === 'molar' ? 12 : 7)} ${neckY + ch * 0.58}
                Q ${cx} ${neckY + ch * 0.45} ${cx + (type === 'molar' ? 12 : 7)} ${neckY + ch * 0.58}`}
            fill="none" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round"
          />
        )}
      </g>
    </svg>
  );
}

// ─── Popover ─────────────────────────────────────────────────────────────────

interface PopoverProps {
  tooth: ToothData;
  row: ToothRow;
  anchorRect: {
    left: number;
    right: number;
    top: number;
    bottom: number;
    width: number;
  };
  onSelect: (s: ToothState) => void;
  onClose: () => void;
}

function ToothPopover({ tooth, row, anchorRect, onSelect, onClose }: PopoverProps) {
  const options: { state: ToothState; label: string; color: string; icon: string }[] = [
    { state: 'healthy',  label: 'Sano',     color: '#15803D', icon: '✓' },
    { state: 'caries',   label: 'Caries',   color: '#EF4444', icon: '●' },
    { state: 'filled',   label: 'Obturado', color: '#3B82F6', icon: '■' },
    { state: 'crown',    label: 'Corona',   color: '#F59E0B', icon: '♦' },
    { state: 'missing',  label: 'Ausente',  color: '#6B7280', icon: '✕' },
    { state: 'fracture', label: 'Fractura', color: '#EA580C', icon: '⚡' },
    { state: 'bridge',   label: 'Puente',   color: '#22C55E', icon: '—' },
  ];

  if (typeof document === 'undefined') return null;

  const popoverWidth = 170;
  const preferredHeight = 276;
  const viewportPadding = 8;
  const gap = 8;
  const spaceAbove = anchorRect.top - viewportPadding - gap;
  const spaceBelow = window.innerHeight - anchorRect.bottom - viewportPadding - gap;
  const openBelow = row === 'upper'
    ? spaceBelow >= 150 || spaceBelow >= spaceAbove
    : !(spaceAbove >= 150 || spaceAbove >= spaceBelow);
  const availableHeight = Math.max(120, openBelow ? spaceBelow : spaceAbove);
  const popoverHeight = Math.min(preferredHeight, availableHeight);
  const anchorCenter = anchorRect.left + anchorRect.width / 2;
  const left = Math.max(
    viewportPadding,
    Math.min(anchorCenter - popoverWidth / 2, window.innerWidth - popoverWidth - viewportPadding),
  );
  const top = openBelow
    ? anchorRect.bottom + gap
    : Math.max(viewportPadding, anchorRect.top - popoverHeight - gap);
  const arrowLeft = Math.max(12, Math.min(popoverWidth - 12, anchorCenter - left));

  return createPortal(
    <div
      className="fixed z-[100] flex flex-col rounded-xl shadow-2xl overflow-hidden"
      style={{
        top,
        left,
        background: '#FFFFFF',
        border: '1px solid #E2E8F0',
        width: popoverWidth,
        maxHeight: popoverHeight,
        boxShadow: '0 16px 48px rgba(0,0,0,0.18), 0 4px 12px rgba(0,0,0,0.1)',
      }}
      onClick={event => event.stopPropagation()}
    >
      <div className="px-3 py-2 border-b flex items-center justify-between"
        style={{ borderColor: '#F1F5F9', background: '#F8FAFD' }}>
        <span className="text-xs font-bold text-slate-600">Diente #{tooth.number}</span>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xs leading-none">✕</button>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain py-1">
        {options.map(opt => (
          <button
            key={opt.state}
            onClick={() => { onSelect(opt.state); onClose(); }}
            className="w-full flex items-center gap-2.5 px-3 py-1.5 text-left hover:bg-blue-50 transition-colors"
          >
            <span className="w-5 h-5 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0"
              style={{ background: opt.color, fontSize: 10 }}>{opt.icon}</span>
            <span className="text-sm text-slate-700 font-medium">{opt.label}</span>
            {tooth.state === opt.state && (
              <svg className="ml-auto" width="12" height="12" viewBox="0 0 24 24" fill="none"
                stroke="#3B82F6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
          </button>
        ))}
      </div>
      <div
        className={`absolute h-3 w-3 rotate-45 bg-white ${
          openBelow ? 'border-l border-t' : 'border-r border-b'
        }`}
        style={{
          borderColor: '#E2E8F0',
          left: arrowLeft - 6,
          top: openBelow ? -6 : undefined,
          bottom: openBelow ? undefined : -6,
        }}
      />
    </div>,
    document.body,
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

const VERSIONS = [
  { label: 'Actual — 06 Sep 2026', value: 'current' },
  { label: '14 Jun 2026', value: '2026-06-14' },
  { label: '02 Mar 2026', value: '2026-03-02' },
  { label: '18 Nov 2025', value: '2025-11-18' },
  { label: '05 Jul 2025', value: '2025-07-05' },
];

interface OdontogramModuleProps {
  value?: OdontogramSnapshot;
  onChange?: (snapshot: OdontogramSnapshot) => void;
  embedded?: boolean;
  readOnly?: boolean;
}

export default function OdontogramModule({
  value,
  onChange,
  embedded = false,
  readOnly = false,
}: OdontogramModuleProps = {}) {
  const [localSnapshot, setLocalSnapshot] = useState<OdontogramSnapshot>(createDefaultOdontogramSnapshot);
  const [hovered,     setHovered]     = useState<number | null>(null);
  const [popoverTarget, setPopoverTarget] = useState<{
    tooth: number;
    rect: PopoverProps['anchorRect'];
  } | null>(null);
  const [selectedVersion, setSelectedVersion] = useState('current');

  const snapshot = value ?? localSnapshot;
  const upperTeeth = snapshot.upper;
  const lowerTeeth = snapshot.lower;
  const allTeeth = [...upperTeeth, ...lowerTeeth];

  const updateState = (num: number, state: ToothState) => {
    if (readOnly) return;
    const next = {
      upper: upperTeeth.map(t => t.number === num ? { ...t, state } : t),
      lower: lowerTeeth.map(t => t.number === num ? { ...t, state } : t),
    };
    if (onChange) onChange(next);
    else setLocalSnapshot(next);
  };

  const cpoD = (() => {
    const c = allTeeth.filter(t => t.state === 'caries').length;
    const p = allTeeth.filter(t => t.state === 'missing').length;
    const o = allTeeth.filter(t => t.state === 'filled').length;
    return { c, p, o, total: c + p + o };
  })();

  const MIDLINE_IDX = 7; // index of last right-quadrant tooth (11 upper, 41 lower)

  const handleEnter = (n: number) => setHovered(n);
  const handleLeave = () => setHovered(null);
  const handleClick = (n: number, element: HTMLElement) => {
    if (readOnly) return;
    const rect = element.getBoundingClientRect();
    setPopoverTarget(prev => prev?.tooth === n ? null : {
      tooth: n,
      rect: {
        left: rect.left,
        right: rect.right,
        top: rect.top,
        bottom: rect.bottom,
        width: rect.width,
      },
    });
  };

  const lateralRow = (teeth: ToothData[], row: ToothRow, align: 'end' | 'start') => (
    <div className={`flex justify-center`} style={{ alignItems: align === 'end' ? 'flex-end' : 'flex-start' }}>
      {teeth.map((tooth, idx) => {
        const isHov = hovered === tooth.number;
        const hasPop = popoverTarget?.tooth === tooth.number;
        const isMid = idx === MIDLINE_IDX;
        return (
          <div
            key={tooth.number}
            className="relative flex-shrink-0 cursor-pointer"
            style={{
              width: SW[tooth.type],
              borderRight: isMid ? '1.5px dashed #94A3B8' : undefined,
            }}
            onMouseEnter={() => handleEnter(tooth.number)}
            onMouseLeave={handleLeave}
            onClick={event => handleClick(tooth.number, event.currentTarget)}
          >
            {hasPop && (
              <ToothPopover
                tooth={tooth}
                row={row}
                anchorRect={popoverTarget.rect}
                onSelect={s => updateState(tooth.number, s)}
                onClose={() => setPopoverTarget(null)}
              />
            )}
            <LateralSVG tooth={tooth} row={row} isHovered={isHov} />
          </div>
        );
      })}
    </div>
  );

  const occlusalRow = (teeth: ToothData[], row: ToothRow) => (
    <div className="flex justify-center items-center">
      {teeth.map((tooth, idx) => {
        const isHov = hovered === tooth.number;
        const isMid = idx === MIDLINE_IDX;
        return (
          <div
            key={tooth.number}
            className="flex-shrink-0 cursor-pointer flex items-center justify-center"
            style={{
              width: SW[tooth.type],
              height: MAX_OCC_H,
              borderRight: isMid ? '1.5px dashed #94A3B8' : undefined,
            }}
            onMouseEnter={() => handleEnter(tooth.number)}
            onMouseLeave={handleLeave}
            onClick={event => handleClick(tooth.number, event.currentTarget)}
          >
            <OcclusalSVG tooth={tooth} isHovered={isHov} />
          </div>
        );
      })}
    </div>
  );

  const numberRow = (teeth: ToothData[], row: ToothRow) => (
    <div className="flex justify-center items-center">
      {teeth.map((tooth, idx) => {
        const isHov = hovered === tooth.number;
        const isMid = idx === MIDLINE_IDX;
        return (
          <div
            key={tooth.number}
            className="flex-shrink-0 flex items-center justify-center cursor-pointer"
            style={{
              width: SW[tooth.type],
              height: 13,
              borderRight: isMid ? '1.5px solid #94A3B8' : undefined,
            }}
            onMouseEnter={() => handleEnter(tooth.number)}
            onMouseLeave={handleLeave}
            onClick={event => handleClick(tooth.number, event.currentTarget)}
          >
            <span
              className="font-mono font-bold select-none leading-none"
              style={{
                fontSize: 8,
                color: isHov ? '#1A4F8A' : row === 'upper' ? '#1E3A5F' : '#64748B',
                transition: 'color 0.1s',
              }}
            >
              {tooth.number}
            </span>
          </div>
        );
      })}
    </div>
  );

  return (
    <div
      className={`border overflow-hidden ${embedded ? 'rounded-xl bg-slate-50/40' : 'bg-white rounded-2xl'}`}
      style={{ borderColor: '#E2E8F0' }}
    >
      {/* Header */}
      {!embedded && <div className="px-5 py-4 border-b flex items-center justify-between"
        style={{ borderColor: '#EEF2F7', background: '#F8FAFD' }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#EFF6FF' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1A4F8A"
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2C8 2 5 5 5 9c0 2 1 4 2 5l1 7h8l1-7c1-1 2-3 2-5 0-4-3-7-7-7z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-slate-800 text-sm">Odontograma Interactivo</h3>
            <p className="text-xs text-slate-400">Haz clic en cualquier diente para editar su estado clínico</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-xs font-semibold px-2.5 py-1 rounded-full"
            style={{ background: '#EFF6FF', color: '#1A4F8A' }}>
            CPO-D: {cpoD.total}
          </div>

          {/* Historial Evolutivo dropdown */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">Historial Evolutivo:</span>
            <select
              value={selectedVersion}
              onChange={e => setSelectedVersion(e.target.value)}
              className="text-xs font-semibold rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-400 px-2 py-1.5 cursor-pointer"
              style={{ borderColor: '#E2E8F0', background: '#F8FAFC', color: '#1A4F8A', maxWidth: 170 }}
            >
              {VERSIONS.map(v => (
                <option key={v.value} value={v.value}>{v.label}</option>
              ))}
            </select>
          </div>

          <button className="px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors hover:bg-slate-50"
            style={{ borderColor: '#E2E8F0', color: '#64748B' }}>
            Imprimir
          </button>
          <button className="px-3 py-1.5 text-xs font-semibold text-white rounded-lg transition-opacity hover:opacity-90"
            style={{ background: '#1A4F8A' }}>
            Guardar
          </button>
        </div>
      </div>}

      {/* Odontogram chart */}
      <div className="px-6 py-5 overflow-x-auto">
        {/* Quadrant labels */}
        <div className="flex justify-center mb-2 gap-0">
          {(['Superior Derecho', 'Superior Izquierdo'] as const).map(label => (
            <span key={label}
              className="flex-1 text-center font-semibold uppercase tracking-widest text-slate-400"
              style={{ fontSize: 8, maxWidth: '50%' }}>
              {label}
            </span>
          ))}
        </div>

        {/* Upper lateral row — roots at top, crowns face down, items-end */}
        {lateralRow(upperTeeth, 'upper', 'end')}

        {/* Upper occlusal row */}
        <div className="mt-px">
          {occlusalRow(upperTeeth, 'upper')}
        </div>

        {/* Number band */}
        <div className="my-px" style={{ background: '#F8FAFD', borderTop: '1px solid #E9EEF5', borderBottom: '1px solid #E9EEF5', paddingTop: 2, paddingBottom: 2 }}>
          {numberRow(upperTeeth, 'upper')}
          <div style={{ height: 1, background: '#CBD5E1', margin: '2px 0' }} />
          {numberRow(lowerTeeth, 'lower')}
        </div>

        {/* Lower occlusal row */}
        <div className="mt-px">
          {occlusalRow(lowerTeeth, 'lower')}
        </div>

        {/* Lower lateral row — crowns face up, roots at bottom, items-start */}
        {lateralRow(lowerTeeth, 'lower', 'start')}

        {/* Quadrant labels */}
        <div className="flex justify-center mt-2 gap-0">
          {(['Inferior Derecho', 'Inferior Izquierdo'] as const).map(label => (
            <span key={label}
              className="flex-1 text-center font-semibold uppercase tracking-widest text-slate-400"
              style={{ fontSize: 8, maxWidth: '50%' }}>
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* CPO-D stats */}
      <div className="px-6 pb-4">
        <div className="grid grid-cols-4 gap-3 mb-4">
          {[
            { label: 'Cariados (C)', value: cpoD.c, color: '#EF4444', bg: '#FEF2F2' },
            { label: 'Perdidos (P)', value: cpoD.p, color: '#6B7280', bg: '#F1F5F9' },
            { label: 'Obturados (O)', value: cpoD.o, color: '#3B82F6', bg: '#EFF6FF' },
            { label: 'CPO-D Total', value: cpoD.total, color: '#1A4F8A', bg: '#E8F0FA' },
          ].map(s => (
            <div key={s.label} className="text-center px-3 py-2.5 rounded-xl" style={{ background: s.bg }}>
              <div className="text-2xl font-bold font-mono" style={{ color: s.color }}>{s.value}</div>
              <div className="text-xs font-semibold mt-0.5" style={{ color: s.color, opacity: 0.75 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="px-6 pb-5">
        <div className="flex flex-wrap gap-1.5 p-3 rounded-xl" style={{ background: '#F8FAFC', border: '1px solid #F1F5F9' }}>
          {Object.entries(STATE_CFG).map(([state, cfg]) => (
            <div key={state} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
              style={{ background: cfg.fill, border: `1px solid ${cfg.border}` }}>
              <div className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ background: cfg.dotColor ?? '#CBD5E1' }} />
              <span className="text-xs font-semibold" style={{ color: cfg.dotColor ?? '#64748B' }}>{cfg.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
