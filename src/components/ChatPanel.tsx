import { useState } from 'react';

interface ChatMessage {
  from: 'patient' | 'bot' | 'doctor';
  text: string;
  time: string;
  type?: 'offer' | 'confirm' | 'normal';
}

interface Conversation {
  id: number;
  name: string;
  phone: string;
  lastMsg: string;
  time: string;
  unread: number;
  status: 'bot' | 'human';
  botState: 'negotiating' | 'confirmed' | 'waiting';
  messages: ChatMessage[];
}

const conversations: Conversation[] = [
  {
    id: 1, name: 'María Condori', phone: '+591 71234567',
    lastMsg: '¿Tienen disponibilidad el martes?', time: '10:42', unread: 1, status: 'bot', botState: 'negotiating',
    messages: [
      { from: 'patient', text: 'Hola! Necesito una cita para revisión, me duele una muela', time: '10:28', type: 'normal' },
      { from: 'bot', text: 'Hola María 😊 Soy el asistente de DOCK Clínica. Entiendo que tienes molestias, te ayudo a agendar de inmediato. ¿Qué día te viene mejor esta semana?', time: '10:29', type: 'normal' },
      { from: 'patient', text: 'El martes o miércoles por la mañana si hay', time: '10:31', type: 'normal' },
      { from: 'bot', text: '📅 Encontré estos espacios disponibles:', time: '10:32', type: 'offer' },
      { from: 'bot', text: '• Martes 16 — 09:00 AM (Box 1)\n• Martes 16 — 10:30 AM (Box 2)\n• Miércoles 17 — 08:30 AM (Box 1)\n\n¿Cuál prefieres?', time: '10:32', type: 'offer' },
      { from: 'patient', text: '¿Tienen disponibilidad el martes?', time: '10:42', type: 'normal' },
    ],
  },
  {
    id: 2, name: 'Diego Alvarado', phone: '+591 76543210',
    lastMsg: '¿Cuánto cuesta la ortodoncia completa?', time: '10:15', unread: 0, status: 'human', botState: 'waiting',
    messages: [
      { from: 'patient', text: 'Buenos días. Me interesa la ortodoncia, ¿cuánto cuesta?', time: '09:50', type: 'normal' },
      { from: 'bot', text: 'Buenos días Diego 🦷 La ortodoncia completa con brackets metálicos desde Bs. 3,500 y con brackets estéticos desde Bs. 4,800. ¿Le gustaría agendar una evaluación gratuita con el especialista?', time: '09:51', type: 'normal' },
      { from: 'patient', text: '¿Cuánto cuesta la ortodoncia completa?', time: '10:15', type: 'normal' },
    ],
  },
  {
    id: 3, name: 'Ana Sofía Ríos', phone: '+591 69876543',
    lastMsg: 'Confirmado, gracias! 🙏', time: 'Ayer', unread: 0, status: 'bot', botState: 'confirmed',
    messages: [
      { from: 'patient', text: 'Tengo urgencia, dolor muy fuerte', time: 'Ayer 15:20', type: 'normal' },
      { from: 'bot', text: '⚡ Entiendo Ana, es urgente. Tengo un espacio HOY mismo a las 17:30. ¿Puedes asistir?', time: 'Ayer 15:21', type: 'offer' },
      { from: 'patient', text: 'Sí por favor!', time: 'Ayer 15:25', type: 'normal' },
      { from: 'bot', text: '✅ Listo! Cita de urgencia confirmada: HOY 17:30 · Box 3 · Dr. Pérez. Trae tu C.I. Te enviamos recordatorio 30min antes.', time: 'Ayer 15:26', type: 'confirm' },
      { from: 'patient', text: 'Confirmado, gracias! 🙏', time: 'Ayer 15:30', type: 'normal' },
    ],
  },
  {
    id: 4, name: 'Roberto Vega', phone: '+591 72019845',
    lastMsg: 'Prefiero el jueves', time: 'Hace 2h', unread: 2, status: 'bot', botState: 'negotiating',
    messages: [
      { from: 'patient', text: 'Hola, ¿tienen citas la próxima semana para limpieza?', time: 'Hace 3h', type: 'normal' },
      { from: 'bot', text: 'Hola Roberto! Sí, hay disponibilidad. Te ofrezco:\n\n• Lunes 20 — 08:00 AM\n• Martes 21 — 14:00 PM\n• Jueves 23 — 10:00 AM', time: 'Hace 3h', type: 'offer' },
      { from: 'patient', text: 'Prefiero el jueves', time: 'Hace 2h', type: 'normal' },
    ],
  },
];

const botStateCfg = {
  negotiating: { label: 'Negociando cita', color: '#D97706', bg: '#FFFBEB', dot: '#F59E0B' },
  confirmed:   { label: 'Cita confirmada', color: '#15803D', bg: '#F0FDF4', dot: '#22C55E' },
  waiting:     { label: 'Esperando respuesta', color: '#6B7280', bg: '#F1F5F9', dot: '#9CA3AF' },
};

export default function ChatPanel({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const [active, setActive] = useState<number>(1);
  const [takenOver, setTakenOver] = useState<Set<number>>(new Set());
  const [replyText, setReplyText] = useState('');

  const conv = conversations.find(c => c.id === active)!;
  const isManual = takenOver.has(active);
  const totalUnread = conversations.reduce((s, c) => s + c.unread, 0);

  return (
    <div
      className="flex-shrink-0 flex overflow-hidden border-l transition-all duration-300"
      style={{ width: collapsed ? '48px' : '330px', borderColor: '#E2E8F0', background: '#FFFFFF' }}
    >
      {/* Collapsed tab */}
      {collapsed && (
        <button
          onClick={onToggle}
          className="w-full flex flex-col items-center justify-center gap-3 py-6 text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          {totalUnread > 0 && (
            <div className="w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold">{totalUnread}</div>
          )}
          <span className="text-xs font-semibold text-slate-400" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>Inbox</span>
        </button>
      )}

      {/* Expanded panel */}
      {!collapsed && (
        <div className="flex flex-col w-full overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b flex items-center justify-between flex-shrink-0" style={{ borderColor: '#EEF2F7', background: '#F8FAFD' }}>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md flex items-center justify-center" style={{ background: '#25D366' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                  <path d="M11.5 2C6.26 2 2 6.26 2 11.5c0 1.76.47 3.41 1.29 4.84L2 22l5.78-1.26A9.46 9.46 0 0 0 11.5 21C16.74 21 21 16.74 21 11.5S16.74 2 11.5 2zm0 17.25a7.76 7.76 0 0 1-3.97-1.09l-.28-.17-2.92.64.66-2.84-.18-.29a7.74 7.74 0 0 1-1.19-4.05C3.62 7.17 7.17 3.62 11.5 3.62c4.32 0 7.88 3.55 7.88 7.88 0 4.32-3.56 7.75-7.88 7.75z" />
                </svg>
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-800">Inbox IA</div>
                <div className="text-xs text-slate-400">{conversations.filter(c=>c.botState==='negotiating').length} negociando · {conversations.filter(c=>c.botState==='confirmed').length} confirmadas</div>
              </div>
            </div>
            <button onClick={onToggle} className="text-slate-400 hover:text-slate-600 transition-colors p-1">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>

          {/* Conversation list */}
          <div className="border-b overflow-y-auto flex-shrink-0" style={{ borderColor: '#EEF2F7', maxHeight: '210px' }}>
            {conversations.map(c => {
              const stateCfg = botStateCfg[c.botState];
              return (
                <button
                  key={c.id}
                  onClick={() => setActive(c.id)}
                  className={`w-full px-3 py-2.5 flex items-start gap-2.5 text-left border-b transition-colors hover:bg-slate-50 ${active === c.id ? 'bg-blue-50' : ''}`}
                  style={{ borderColor: '#F1F5F9' }}
                >
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5" style={{ background: '#1A4F8A' }}>
                    {c.name.split(' ').map(s => s[0]).join('').slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-semibold text-slate-700 truncate">{c.name}</span>
                      <span className="text-xs text-slate-400 font-mono flex-shrink-0">{c.time}</span>
                    </div>
                    <div className="text-xs text-slate-400 truncate mt-0.5">{c.lastMsg}</div>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="flex items-center gap-1" style={{ color: stateCfg.color, fontSize: '10px' }}>
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: stateCfg.dot }} />
                        {stateCfg.label}
                      </span>
                      {c.unread > 0 && (
                        <span className="w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center font-bold" style={{ fontSize: '9px' }}>
                          {c.unread}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Chat contact header */}
          <div className="px-3 py-2 border-b flex items-center justify-between" style={{ borderColor: '#EEF2F7', background: '#FAFBFD' }}>
            <div>
              <div className="text-xs font-semibold text-slate-800">{conv.name}</div>
              <div className="text-xs text-slate-400">{conv.phone}</div>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: botStateCfg[conv.botState].dot }} />
              <span className="text-xs font-medium" style={{ color: botStateCfg[conv.botState].color }}>
                {botStateCfg[conv.botState].label}
              </span>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2" style={{ background: '#ECE5DD' }}>
            {conv.messages.map((msg, i) => {
              const isPatient = msg.from === 'patient';
              const isOffer = msg.type === 'offer';
              const isConfirm = msg.type === 'confirm';
              return (
                <div key={i} className={`flex ${isPatient ? 'justify-start' : 'justify-end'}`}>
                  <div
                    className="max-w-[88%] px-3 py-2 text-xs leading-relaxed shadow-sm"
                    style={{
                      background: isPatient ? '#FFFFFF' : isConfirm ? '#DCF8C6' : isOffer ? '#E8F4FF' : '#FFFFFF',
                      borderRadius: isPatient ? '2px 14px 14px 14px' : '14px 2px 14px 14px',
                      color: '#1a1a1a',
                      border: isOffer ? '1px solid #BFDBFE' : isConfirm ? '1px solid #86EFAC' : 'none',
                    }}
                  >
                    {msg.from === 'bot' && (
                      <div className="text-xs font-bold mb-1" style={{ color: '#1A4F8A', fontSize: '10px' }}>
                        🤖 Asistente DOCK
                      </div>
                    )}
                    {msg.from === 'doctor' && (
                      <div className="text-xs font-bold mb-1 text-green-700" style={{ fontSize: '10px' }}>
                        👨‍⚕️ Dr. Pérez
                      </div>
                    )}
                    <p className="whitespace-pre-line">{msg.text}</p>
                    <div className="text-right mt-1 text-slate-400" style={{ fontSize: '10px' }}>{msg.time} {!isPatient && '✓✓'}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Takeover / Reply bar */}
          <div className="flex-shrink-0 border-t" style={{ borderColor: '#E2E8F0' }}>
            {!isManual ? (
              <div className="px-3 py-2.5">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                    <span className="text-xs text-slate-500">IA respondiendo automáticamente</span>
                  </div>
                </div>
                <button
                  onClick={() => setTakenOver(new Set([...takenOver, active]))}
                  className="w-full flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg border-2 transition-all hover:bg-orange-50"
                  style={{ borderColor: '#F97316', color: '#EA580C' }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                    <line x1="23" y1="11" x2="17" y2="11" /><line x1="20" y1="8" x2="20" y2="14" />
                  </svg>
                  Tomar el control manual
                </button>
              </div>
            ) : (
              <div className="px-3 py-2.5">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-xs font-semibold text-green-700">Modo manual — Dr. Pérez</span>
                  </div>
                  <button
                    onClick={() => { const s = new Set(takenOver); s.delete(active); setTakenOver(s); }}
                    className="text-xs text-slate-400 hover:text-slate-600 underline"
                  >
                    Devolver al bot
                  </button>
                </div>
                <div className="flex gap-1.5">
                  <input
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    placeholder="Escribe tu respuesta..."
                    className="flex-1 px-2.5 py-2 text-xs rounded-lg border focus:outline-none focus:ring-2 focus:ring-green-500"
                    style={{ borderColor: '#D1D9E6' }}
                  />
                  <button
                    onClick={() => setReplyText('')}
                    className="px-3 py-2 rounded-lg text-white text-xs font-bold transition-opacity hover:opacity-90 flex-shrink-0"
                    style={{ background: '#25D366' }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
