import { useEffect, useState } from 'react';

/* ─── Orb backgrounds ───────────────────────────────────────────── */
function Orb({ x, y, size, opacity = 0.18, color = '#00D4FF' }: { x: string; y: string; size: number; opacity?: number; color?: string }) {
  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: x, top: y,
        width: size, height: size,
        borderRadius: '50%',
        background: color,
        opacity,
        filter: `blur(${size * 0.55}px)`,
        transform: 'translate(-50%,-50%)',
      }}
    />
  );
}

/* ─── Phone mockup ──────────────────────────────────────────────── */
function PhoneMockup() {
  const msgs = [
    { from: 'patient', text: 'Hola! Quiero una cita para revisión 🦷', time: '09:41' },
    { from: 'bot', text: 'Hola Rosa 😊 Soy el asistente de DOCK. Tengo disponibilidad mañana a las 10:00 AM o el jueves a las 14:00. ¿Cuál prefieres?', time: '09:41' },
    { from: 'patient', text: 'Mañana a las 10 perfecto!', time: '09:42' },
    { from: 'bot', text: '✅ Cita confirmada: Mañana 10:00 AM · Dr. Pérez. Te enviamos recordatorio 1h antes. ¡Hasta pronto!', time: '09:42' },
  ];
  return (
    <div
      className="relative anim-float"
      style={{
        width: 220, height: 420,
        borderRadius: 36,
        background: 'linear-gradient(170deg, #0D1B2E 0%, #071020 100%)',
        border: '2px solid rgba(0,212,255,0.3)',
        boxShadow: '0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.08), inset 0 1px 0 rgba(255,255,255,0.12)',
        overflow: 'hidden',
      }}
    >
      {/* Notch */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-5 rounded-b-2xl" style={{ background: '#050D1A' }} />
      {/* Status bar */}
      <div className="flex items-center justify-between px-5 pt-6 pb-1">
        <span className="text-white text-xs font-semibold">9:41</span>
        <div className="flex gap-1 items-center">
          <div className="w-3 h-2 rounded-sm" style={{ background: 'rgba(255,255,255,0.5)' }} />
        </div>
      </div>
      {/* WA header */}
      <div className="flex items-center gap-2 px-3 py-2 border-b" style={{ borderColor: 'rgba(255,255,255,0.08)', background: 'rgba(0,212,255,0.07)' }}>
        <div className="w-7 h-7 rounded-full flex items-center justify-center text-white font-bold" style={{ background: '#1A4F8A', fontSize: 11 }}>D</div>
        <div>
          <div className="text-white text-xs font-semibold leading-none">DOCK Clínica</div>
          <div className="flex items-center gap-1 mt-0.5">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
            <span style={{ color: '#00D4FF', fontSize: 9 }}>IA activa</span>
          </div>
        </div>
      </div>
      {/* Messages */}
      <div className="px-2 py-3 space-y-2 overflow-hidden" style={{ background: '#0A1929', flex: 1, height: 290 }}>
        {msgs.map((m, i) => (
          <div key={i} className={`flex ${m.from === 'patient' ? 'justify-end' : 'justify-start'}`}>
            <div
              className="px-2.5 py-1.5 text-white leading-relaxed"
              style={{
                maxWidth: '80%',
                fontSize: 9.5,
                borderRadius: m.from === 'patient' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                background: m.from === 'patient' ? 'rgba(0,212,255,0.18)' : 'rgba(255,255,255,0.08)',
                border: m.from === 'bot' ? '1px solid rgba(0,212,255,0.2)' : 'none',
              }}
            >
              {m.from === 'bot' && <div style={{ color: '#00D4FF', fontSize: 8, fontWeight: 700, marginBottom: 2 }}>🤖 DOCK IA</div>}
              {m.text}
              <div className="text-right mt-1" style={{ color: 'rgba(255,255,255,0.35)', fontSize: 8 }}>{m.time} ✓✓</div>
            </div>
          </div>
        ))}
      </div>
      {/* Glow scan line */}
      <div
        className="absolute left-0 right-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, #00D4FF, transparent)', animation: 'scan 4s ease-in-out infinite', opacity: 0.5 }}
      />
    </div>
  );
}

/* ─── Dashboard preview card ────────────────────────────────────── */
function DashPreview() {
  const bars = [55, 80, 45, 95, 70, 85, 60, 90, 75, 88];
  return (
    <div
      className="relative overflow-hidden"
      style={{
        width: 320, height: 200,
        borderRadius: 20,
        background: 'linear-gradient(135deg, #051529 0%, #0A1F35 100%)',
        border: '1px solid rgba(0,212,255,0.2)',
        boxShadow: '0 24px 60px rgba(0,0,0,0.6)',
        padding: 18,
      }}
    >
      {/* Header row */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-xs font-semibold text-white mb-0.5">Ingresos del Mes</div>
          <div className="font-mono font-bold" style={{ color: '#00D4FF', fontSize: 20 }}>Bs. 24,850</div>
        </div>
        <div className="px-2.5 py-1 rounded-full text-xs font-bold" style={{ background: 'rgba(0,212,255,0.12)', color: '#00D4FF', border: '1px solid rgba(0,212,255,0.25)' }}>
          ↑ +18%
        </div>
      </div>
      {/* Mini bar chart */}
      <div className="flex items-end gap-1.5" style={{ height: 60 }}>
        {bars.map((h, i) => (
          <div
            key={i}
            className="flex-1 rounded-t"
            style={{
              height: `${h}%`,
              background: i === 9 ? 'linear-gradient(180deg, #00D4FF, #0077AA)' : 'rgba(0,212,255,0.2)',
              boxShadow: i === 9 ? '0 0 10px rgba(0,212,255,0.5)' : undefined,
            }}
          />
        ))}
      </div>
      {/* Stats row */}
      <div className="flex gap-3 mt-3">
        {[
          { label: 'Citas hoy', val: '12' },
          { label: 'Pendiente', val: 'Bs. 3,200' },
          { label: 'Pacientes', val: '48' },
        ].map(s => (
          <div key={s.label} className="flex-1 px-2 py-1.5 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)' }}>
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 9 }}>{s.label}</div>
            <div className="text-white font-semibold font-mono" style={{ fontSize: 12 }}>{s.val}</div>
          </div>
        ))}
      </div>
      {/* Glow orb inside */}
      <div className="absolute -bottom-8 -right-8 w-24 h-24 rounded-full" style={{ background: '#00D4FF', opacity: 0.07, filter: 'blur(24px)' }} />
    </div>
  );
}

/* ─── Odontogram preview ────────────────────────────────────────── */
function OdontogramPreview() {
  const teeth = ['18','17','16','15','14','13','12','11','21','22','23','24','25','26','27','28'];
  const colors: Record<string, string> = { '16': '#FF4D4D', '11': '#00D4FF', '26': '#FFB800', '36': '#FF4D4D' };
  return (
    <div
      style={{
        width: 300, height: 140,
        borderRadius: 16,
        background: 'linear-gradient(135deg, #051529 0%, #0A1F35 100%)',
        border: '1px solid rgba(0,212,255,0.15)',
        padding: 16,
      }}
    >
      <div className="text-xs font-semibold mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>Odontograma · HC-2024-0892</div>
      <div className="flex gap-1 justify-center mb-1">
        {teeth.map(t => (
          <div
            key={t}
            className="flex items-center justify-center rounded font-mono font-semibold"
            style={{
              width: 14, height: 14, fontSize: 7,
              background: colors[t] ? `${colors[t]}30` : 'rgba(255,255,255,0.07)',
              border: `1px solid ${colors[t] ?? 'rgba(255,255,255,0.12)'}`,
              color: colors[t] ?? 'rgba(255,255,255,0.4)',
              borderRadius: 4,
            }}
          >
            {t.slice(-1)}
          </div>
        ))}
      </div>
      <div className="flex gap-1 justify-center mb-3">
        {['48','47','46','45','44','43','42','41','31','32','33','34','35','36','37','38'].map((t, i) => (
          <div
            key={i}
            className="flex items-center justify-center rounded font-mono font-semibold"
            style={{
              width: 14, height: 14, fontSize: 7,
              background: t === '36' ? '#FF4D4D30' : 'rgba(255,255,255,0.07)',
              border: `1px solid ${t === '36' ? '#FF4D4D' : 'rgba(255,255,255,0.12)'}`,
              color: t === '36' ? '#FF4D4D' : 'rgba(255,255,255,0.4)',
              borderRadius: 4,
            }}
          >
            {t.slice(-1)}
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        {[{ c: '#00D4FF', l: 'Sano' }, { c: '#FF4D4D', l: 'Cariado' }, { c: '#FFB800', l: 'Corona' }].map(x => (
          <div key={x.l} className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-sm" style={{ background: x.c }} />
            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 9 }}>{x.l}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Pricing card ──────────────────────────────────────────────── */
interface PricePlan {
  name: string;
  sub: string;
  price: string;
  period: string;
  badge?: string;
  features: string[];
  highlight?: boolean;
  cta: string;
}

function PriceCard({ plan }: { plan: PricePlan }) {
  return (
    <div
      className="relative flex flex-col"
      style={{
        borderRadius: 28,
        padding: 32,
        background: plan.highlight
          ? 'linear-gradient(145deg, rgba(0,212,255,0.12) 0%, rgba(0,150,200,0.06) 100%)'
          : 'rgba(255,255,255,0.04)',
        border: plan.highlight
          ? '1px solid rgba(0,212,255,0.45)'
          : '1px solid rgba(255,255,255,0.09)',
        boxShadow: plan.highlight
          ? '0 0 0 1px rgba(0,212,255,0.1), 0 40px 80px rgba(0,0,0,0.5), 0 0 60px rgba(0,212,255,0.08)'
          : '0 20px 60px rgba(0,0,0,0.4)',
        backdropFilter: 'blur(24px)',
      }}
    >
      {plan.badge && (
        <div
          className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap"
          style={{
            background: 'linear-gradient(135deg, #00D4FF, #0099CC)',
            color: '#020B18',
            boxShadow: '0 0 20px rgba(0,212,255,0.5)',
          }}
        >
          {plan.badge}
        </div>
      )}

      <div className="mb-6">
        <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: plan.highlight ? '#00D4FF' : 'rgba(255,255,255,0.4)' }}>
          {plan.sub}
        </div>
        <div className="text-2xl font-bold text-white">{plan.name}</div>
      </div>

      <div className="mb-6">
        <div className="flex items-end gap-2">
          <span className="font-serif" style={{ fontSize: 48, color: plan.highlight ? '#00D4FF' : '#FFFFFF', lineHeight: 1 }}>
            {plan.price}
          </span>
          <span className="text-sm pb-2" style={{ color: 'rgba(255,255,255,0.4)' }}>{plan.period}</span>
        </div>
      </div>

      <ul className="space-y-3 flex-1 mb-8">
        {plan.features.map((f, i) => (
          <li key={i} className="flex items-start gap-3">
            <div
              className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
              style={{ background: plan.highlight ? 'rgba(0,212,255,0.2)' : 'rgba(255,255,255,0.08)' }}
            >
              <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke={plan.highlight ? '#00D4FF' : 'rgba(255,255,255,0.6)'} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <span className="text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>{f}</span>
          </li>
        ))}
      </ul>

      <button
        className="w-full py-3.5 rounded-2xl font-semibold text-sm transition-all"
        style={plan.highlight ? {
          background: 'linear-gradient(135deg, #00D4FF, #0099CC)',
          color: '#020B18',
          boxShadow: '0 0 30px rgba(0,212,255,0.4)',
        } : {
          background: 'rgba(255,255,255,0.07)',
          color: '#FFFFFF',
          border: '1px solid rgba(255,255,255,0.15)',
        }}
      >
        {plan.cta}
      </button>
    </div>
  );
}

/* ─── Main Landing Page ─────────────────────────────────────────── */
const PLANS: PricePlan[] = [
  {
    name: 'Independiente',
    sub: 'Para el odontólogo solo',
    price: 'Bs. 349',
    period: '/ mes',
    cta: 'Seleccionar Plan',
    features: [
      'Hasta 10 pacientes',
      'Historia clínica digital',
      'Calendario ilimitado',
      'Chatbot IA',
      'Reportes básicos',
    ],
  },
  {
    name: 'Pro',
    sub: 'El plan más popular',
    price: 'Bs. 599',
    period: '/ mes',
    badge: '★ Reemplaza el costo de un asistente',
    cta: 'Seleccionar Plan',
    highlight: true,
    features: [
      'Pacientes ilimitados',
      'Historia clínica oficial (formato legal BO)',
      'Chatbot IA — mensajes ilimitados',
      'Control financiero y recibos',
      'Galería de radiografías',
      'Soporte prioritario 24/7',
      'API de WhatsApp dedicada',
    ],
  },
  {
    name: 'Policlínico',
    sub: 'Para clínicas y redes',
    price: 'Contactar',
    period: '',
    cta: 'Hablar con Ventas',
    features: [
      'Todo lo de Pro',
      'Dashboard Centralizado',
      'Web dedicada',
      'Integración con sistemas externos',
      'Onboarding personalizado',
      'Multi-sede y multi-doctor',
    ],
  },
];

const TRUST_LOGOS = [
  'OralCare BO', 'SmilePlus', 'Dental Norte', 'OrtoCenter', 'Sonrisa Pro',
];

export default function LandingPage({ onEnterApp }: { onEnterApp: () => void }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    document.body.classList.add('landing');
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => {
      document.body.classList.remove('landing');
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMenuOpen(false);
  };

  return (
    <div style={{ background: '#020B18', color: '#FFFFFF', fontFamily: "'DM Sans', system-ui, sans-serif", overflowX: 'hidden' }}>

      {/* ── FLOATING NAV ─────────────────────────────────────────── */}
      <header
        className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-4 px-4 transition-all duration-300"
      >
        <nav
          className="w-full max-w-5xl flex items-center justify-between px-5 py-3 rounded-2xl transition-all duration-300"
          style={{
            background: scrolled ? 'rgba(2,11,24,0.85)' : 'rgba(255,255,255,0.05)',
            border: scrolled ? '1px solid rgba(0,212,255,0.15)' : '1px solid rgba(255,255,255,0.10)',
            backdropFilter: 'blur(24px)',
            boxShadow: scrolled ? '0 8px 40px rgba(0,0,0,0.5)' : '0 4px 24px rgba(0,0,0,0.3)',
          }}
        >
          {/* Logo */}
          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex items-center gap-2 group">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #00D4FF, #0077AA)' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a7 7 0 0 1 7 7c0 5.25-7 13-7 13S5 14.25 5 9a7 7 0 0 1 7-7z" />
                <circle cx="12" cy="9" r="2.5" fill="white" stroke="none" />
              </svg>
            </div>
            <span className="font-serif text-white text-lg tracking-wide">DOCK</span>
          </button>

          {/* Center links */}
          <div className="hidden md:flex items-center gap-6">
            {[
              { label: 'Características', id: 'features' },
              { label: 'Demo', id: 'video' },
              { label: 'Precios', id: 'pricing' },
            ].map(item => (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                className="text-sm font-medium transition-colors hover:text-white"
                style={{ color: 'rgba(255,255,255,0.6)' }}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Right CTAs */}
          <div className="flex items-center gap-3">
            <button
              onClick={onEnterApp}
              className="hidden md:block text-sm transition-colors hover:text-white"
              style={{ color: 'rgba(255,255,255,0.55)' }}
            >
              👉 ¿Eres miembro? <span className="underline">Inicia sesión</span>
            </button>
            <button
              onClick={() => scrollTo('pricing')}
              className="cyan-glow-btn text-sm font-bold px-5 py-2.5 rounded-xl transition-all"
              style={{ color: '#020B18' }}
            >
              Contactar Asesor
            </button>
            {/* Mobile hamburger */}
            <button className="md:hidden text-white" onClick={() => setMenuOpen(!menuOpen)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {menuOpen ? <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></> : <><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></>}
              </svg>
            </button>
          </div>
        </nav>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="absolute top-20 left-4 right-4 glass rounded-2xl p-5 md:hidden z-50 space-y-3">
            {[
              { label: 'Características', id: 'features' },
              { label: 'Demo', id: 'video' },
              { label: 'Precios', id: 'pricing' },
            ].map(item => (
              <button key={item.id} onClick={() => scrollTo(item.id)} className="block w-full text-left text-white text-sm py-2">
                {item.label}
              </button>
            ))}
            <button onClick={onEnterApp} className="block w-full text-left text-sm py-2" style={{ color: 'rgba(255,255,255,0.5)' }}>
              Iniciar sesión
            </button>
          </div>
        )}
      </header>

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-28 pb-20 overflow-hidden noise-overlay">
        {/* Background orbs */}
        <Orb x="10%"  y="20%"  size={500} opacity={0.13} color="#00D4FF" />
        <Orb x="88%"  y="30%"  size={400} opacity={0.10} color="#0055FF" />
        <Orb x="50%"  y="85%"  size={350} opacity={0.10} color="#00D4FF" />
        <Orb x="25%"  y="70%"  size={250} opacity={0.07} color="#8B5CF6" />

        {/* Subtle grid overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(rgba(0,212,255,0.06) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        {/* Badge */}
        <div
          className="glass inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 text-sm font-medium"
          style={{ border: '1px solid rgba(0,212,255,0.3)', color: '#00D4FF' }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
          IA clínica de nueva generación · Bolivia
        </div>

        {/* Headline */}
        <h1
          className="font-serif text-gradient-cyan text-center leading-tight mb-6"
          style={{ fontSize: 'clamp(42px, 7vw, 88px)', maxWidth: 900, letterSpacing: '-0.02em' }}
        >
          El futuro de tu consultorio.{' '}
          <span style={{ display: 'block', WebkitTextFillColor: 'rgba(255,255,255,0.9)' }}>
            Sin agendas físicas.
          </span>
          <span className="text-gradient-cyan">Sin demoras.</span>
        </h1>

        {/* Sub */}
        <p
          className="text-center leading-relaxed mb-10"
          style={{ color: 'rgba(255,255,255,0.55)', fontSize: 'clamp(15px, 2vw, 19px)', maxWidth: 680 }}
        >
          Gestión clínica integral con Inteligencia Artificial. Automatiza tus citas de WhatsApp,
          domina tus finanzas y blinda tu historia clínica con la plataforma definitiva
          para Odontólogos en Bolivia.
        </p>

        {/* CTAs */}
        <div className="flex flex-wrap gap-4 justify-center mb-16">
          <button
            onClick={onEnterApp}
            className="cyan-glow-btn font-bold px-8 py-4 rounded-2xl flex items-center gap-2 text-base transition-all"
            style={{ color: '#020B18' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
            Ver Demo Interactiva
          </button>
          <button
            onClick={() => scrollTo('pricing')}
            className="font-semibold px-8 py-4 rounded-2xl flex items-center gap-2 text-base transition-all"
            style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.2)', color: '#FFFFFF' }}
          >
            Hablar con un asesor
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </button>
        </div>

        {/* Hero visual: floating dashboard + phone */}
        <div className="relative w-full max-w-4xl mx-auto" style={{ height: 420 }}>
          {/* Main dashboard mockup */}
          <div
            className="absolute anim-float-slow"
            style={{
              left: '50%', top: '50%',
              transform: 'translate(-50%, -50%)',
              width: 620, maxWidth: '85vw',
              borderRadius: 24,
              background: 'linear-gradient(145deg, #071828 0%, #041220 100%)',
              border: '1px solid rgba(0,212,255,0.25)',
              boxShadow: '0 40px 120px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.06)',
              overflow: 'hidden',
            }}
          >
            {/* Toolbar */}
            <div className="flex items-center gap-2 px-4 py-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.07)', background: 'rgba(0,0,0,0.3)' }}>
              <div className="flex gap-1.5">
                {['#FF5F57','#FEBC2E','#28C840'].map(c => <div key={c} className="w-2.5 h-2.5 rounded-full" style={{ background: c }} />)}
              </div>
              <div className="flex-1 flex justify-center">
                <div className="px-3 py-1 rounded-md text-xs font-mono" style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.35)' }}>
                  dock.bo/dashboard
                </div>
              </div>
            </div>
            {/* Simulated UI */}
            <div className="flex" style={{ height: 300 }}>
              {/* Sidebar */}
              <div className="w-12 border-r py-4 flex flex-col items-center gap-3" style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(0,0,0,0.2)' }}>
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="w-6 h-6 rounded-lg" style={{ background: i === 2 ? 'rgba(0,212,255,0.3)' : 'rgba(255,255,255,0.06)' }} />
                ))}
              </div>
              {/* Content */}
              <div className="flex-1 p-4">
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {['24,850', '12', '48'].map((v, i) => (
                    <div key={i} className="rounded-lg p-2.5" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }}>
                      <div className="text-xs mb-1" style={{ color: 'rgba(255,255,255,0.35)', fontSize: 9 }}>
                        {['Ingresos Bs.', 'Citas hoy', 'Pacientes'][i]}
                      </div>
                      <div className="font-mono font-bold" style={{ color: '#00D4FF', fontSize: 14 }}>{v}</div>
                    </div>
                  ))}
                </div>
                {/* Calendar strip */}
                <div className="flex gap-1.5 mb-3">
                  {[...Array(7)].map((_, i) => (
                    <div key={i} className="flex-1 rounded-lg py-2" style={{ background: i === 2 ? 'rgba(0,212,255,0.15)' : 'rgba(255,255,255,0.04)', border: i === 2 ? '1px solid rgba(0,212,255,0.35)' : undefined }}>
                      <div className="text-center" style={{ fontSize: 8, color: i === 2 ? '#00D4FF' : 'rgba(255,255,255,0.3)' }}>
                        {['L','M','M','J','V','S','D'][i]}
                      </div>
                    </div>
                  ))}
                </div>
                {/* Appointment rows */}
                {[
                  { time: '09:00', patient: 'Ana Ríos', type: 'Ortodoncia', color: '#3B82F6' },
                  { time: '10:30', patient: 'Carlos M.', type: 'Endodoncia', color: '#F59E0B' },
                  { time: '12:00', patient: 'María C.', type: 'Limpieza', color: '#22C55E' },
                ].map(a => (
                  <div key={a.time} className="flex items-center gap-2 mb-1.5 px-2 py-1.5 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)' }}>
                    <div className="w-1 h-6 rounded-full flex-shrink-0" style={{ background: a.color }} />
                    <div style={{ fontSize: 10, color: '#00D4FF' }} className="font-mono font-bold w-10 flex-shrink-0">{a.time}</div>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)' }}>{a.patient}</div>
                    <div className="ml-auto px-1.5 py-0.5 rounded text-white" style={{ background: a.color + '30', color: a.color, fontSize: 8, border: `1px solid ${a.color}50` }}>{a.type}</div>
                  </div>
                ))}
              </div>
            </div>
            {/* Bottom glow */}
            <div className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none" style={{ background: 'linear-gradient(to top, rgba(0,212,255,0.04), transparent)' }} />
          </div>

          {/* Floating phone — right */}
          <div className="absolute hidden md:block" style={{ right: -20, top: '50%', transform: 'translateY(-55%)', zIndex: 10 }}>
            <PhoneMockup />
          </div>

          {/* Floating stat chip — left */}
          <div
            className="absolute hidden md:flex items-center gap-2.5 glass px-3 py-2 rounded-2xl anim-float"
            style={{ left: 16, top: '15%', animationDelay: '1s' }}
          >
            <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: 'rgba(34,197,94,0.15)' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
            </div>
            <div>
              <div style={{ color: '#22C55E', fontSize: 11, fontWeight: 700 }}>Cita confirmada</div>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10 }}>María C. · 10:00 AM</div>
            </div>
          </div>

          {/* Floating stat chip — top right */}
          <div
            className="absolute hidden md:flex items-center gap-2.5 glass px-3 py-2 rounded-2xl anim-float"
            style={{ left: 60, bottom: '8%', animationDelay: '2.5s' }}
          >
            <div style={{ color: '#00D4FF', fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, fontSize: 15 }}>+18%</div>
            <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 10 }}>Ingresos este mes</div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 opacity-40">
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>Explorar</span>
          <div className="w-px h-8" style={{ background: 'linear-gradient(to bottom, rgba(0,212,255,0.6), transparent)' }} />
        </div>
      </section>

      {/* ── TRUST BANNER ────────────────────────────────────────── */}
      <section className="py-10 overflow-hidden" style={{ borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <p className="text-center text-xs font-semibold uppercase tracking-widest mb-6" style={{ color: 'rgba(255,255,255,0.25)' }}>
          Tecnología de élite para los mejores consultorios
        </p>
        <div className="relative overflow-hidden">
          <div className="anim-ticker flex gap-16 w-max">
            {[...TRUST_LOGOS, ...TRUST_LOGOS].map((logo, i) => (
              <div key={i} className="flex items-center gap-3 flex-shrink-0">
                <div className="w-7 h-7 rounded-lg" style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.15)' }} />
                <span className="font-semibold text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>{logo}</span>
              </div>
            ))}
          </div>
          {/* Fade edges */}
          <div className="absolute inset-y-0 left-0 w-24 pointer-events-none" style={{ background: 'linear-gradient(to right, #020B18, transparent)' }} />
          <div className="absolute inset-y-0 right-0 w-24 pointer-events-none" style={{ background: 'linear-gradient(to left, #020B18, transparent)' }} />
        </div>
      </section>

      {/* ── FEATURE SHOWCASE ─────────────────────────────────────── */}
      <section id="features" className="relative py-28 px-6 overflow-hidden">
        <Orb x="80%" y="50%" size={400} opacity={0.09} color="#00D4FF" />
        <Orb x="10%" y="60%" size={300} opacity={0.08} color="#8B5CF6" />

        <div className="max-w-6xl mx-auto">
          {/* Section header */}
          <div className="text-center mb-20">
            <div className="inline-block text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-4" style={{ color: '#00D4FF', border: '1px solid rgba(0,212,255,0.25)', background: 'rgba(0,212,255,0.07)' }}>
              Plataforma completa
            </div>
            <h2 className="font-serif text-white mb-4" style={{ fontSize: 'clamp(32px, 5vw, 56px)', letterSpacing: '-0.02em' }}>
              Todo lo que tu clínica necesita,
              <span className="text-gradient-cyan"> en un solo lugar.</span>
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 17, maxWidth: 560, margin: '0 auto' }}>
              Diseñado desde cero para la realidad del Odontólogo Boliviano. Cumplimiento legal, IA y finanzas integradas.
            </p>
          </div>

          {/* Feature 1 — full width asymmetric */}
          <div className="relative flex flex-col lg:flex-row items-center gap-12 mb-20">
            <div className="lg:w-1/2">
              <div className="inline-block text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4" style={{ color: '#00D4FF', background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)' }}>
                01 — Asistente IA
              </div>
              <h3 className="font-serif text-white mb-4" style={{ fontSize: 'clamp(26px, 4vw, 44px)', letterSpacing: '-0.01em', lineHeight: 1.1 }}>
                Tu Asistente Virtual 24/7
              </h3>
              <p className="mb-6 leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)', fontSize: 16 }}>
                El bot de DOCK negocia horarios, confirma citas y responde preguntas frecuentes en WhatsApp — mientras tú duermes. Tus pacientes siempre tienen respuesta inmediata.
              </p>
              <ul className="space-y-3">
                {['Negociación inteligente de horarios', 'Recordatorios automáticos 1h antes', 'Takeover manual en un clic', 'Integración oficial con WhatsApp Business'].map(f => (
                  <li key={f} className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#00D4FF', boxShadow: '0 0 6px #00D4FF' }} />
                    <span style={{ color: 'rgba(255,255,255,0.65)', fontSize: 14 }}>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="lg:w-1/2 flex justify-center lg:justify-end">
              <div className="relative">
                <div className="absolute -inset-8 rounded-full opacity-20" style={{ background: '#00D4FF', filter: 'blur(40px)' }} />
                <PhoneMockup />
              </div>
            </div>
          </div>

          {/* Feature 2 + 3 — side by side glass cards */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Card 2 */}
            <div
              className="glass p-8 rounded-3xl relative overflow-hidden"
              style={{ border: '1px solid rgba(255,255,255,0.09)' }}
            >
              <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-10" style={{ background: '#8B5CF6', filter: 'blur(50px)' }} />
              <div className="inline-block text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-5" style={{ color: '#C084FC', background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.25)' }}>
                02 — Clínica Legal
              </div>
              <h3 className="font-serif text-white mb-3" style={{ fontSize: 32, letterSpacing: '-0.01em', lineHeight: 1.1 }}>
                Historia Clínica Oficial y Legal
              </h3>
              <p className="mb-6 text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>
                Formato oficial boliviano con Odontograma digital, Evolución SOAP, firma digital y galería de radiografías. Cumple con SEDES y el MJTI.
              </p>
              <OdontogramPreview />
            </div>

            {/* Card 3 */}
            <div
              className="glass p-8 rounded-3xl relative overflow-hidden"
              style={{ border: '1px solid rgba(0,212,255,0.15)' }}
            >
              <div className="absolute bottom-0 left-0 w-56 h-56 rounded-full opacity-10" style={{ background: '#00D4FF', filter: 'blur(60px)' }} />
              <div className="inline-block text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-5" style={{ color: '#00D4FF', background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.25)' }}>
                03 — Finanzas
              </div>
              <h3 className="font-serif text-white mb-3" style={{ fontSize: 32, letterSpacing: '-0.01em', lineHeight: 1.1 }}>
                Control Financiero Absoluto
              </h3>
              <p className="mb-6 text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>
                Planes de pago a plazos, recibos digitales, deuda por paciente y reportes mensuales. Sabe exactamente cuánto generas cada día.
              </p>
              <DashPreview />
            </div>
          </div>
        </div>
      </section>

      {/* ── VIDEO SECTION ────────────────────────────────────────── */}
      <section id="video" className="relative py-28 px-6 overflow-hidden">
        {/* Cyan aura background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full opacity-15" style={{ background: '#00D4FF', filter: 'blur(100px)' }} />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full opacity-10" style={{ background: '#FFFFFF', filter: 'blur(80px)' }} />
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-block text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-5" style={{ color: '#00D4FF', border: '1px solid rgba(0,212,255,0.25)', background: 'rgba(0,212,255,0.07)' }}>
            Video demostración
          </div>
          <h2 className="font-serif text-white mb-4" style={{ fontSize: 'clamp(28px, 5vw, 52px)', letterSpacing: '-0.02em' }}>
            Observa cómo DOCK transforma tu flujo de trabajo{' '}
            <span className="text-gradient-cyan">en 2 minutos.</span>
          </h2>
          <p className="mb-12" style={{ color: 'rgba(255,255,255,0.45)', fontSize: 17 }}>
            Una demostración real de un consultorio que triplicó su eficiencia con DOCK.
          </p>

          {/* Video frame */}
          <div
            className="relative rounded-3xl overflow-hidden mx-auto cursor-pointer group"
            style={{
              aspectRatio: '16/9',
              background: 'linear-gradient(135deg, #041220 0%, #071828 100%)',
              border: '1px solid rgba(0,212,255,0.3)',
              boxShadow: '0 0 0 1px rgba(0,212,255,0.1), 0 40px 120px rgba(0,0,0,0.7), 0 0 80px rgba(0,212,255,0.1)',
            }}
            onClick={onEnterApp}
          >
            {/* Simulated still frame */}
            <div className="absolute inset-0 flex">
              {/* Left: sidebar */}
              <div className="w-16 h-full border-r flex flex-col items-center pt-6 gap-4" style={{ background: '#0C1E38', borderColor: 'rgba(255,255,255,0.06)' }}>
                {[...Array(6)].map((_, i) => <div key={i} className="w-8 h-8 rounded-xl" style={{ background: i === 1 ? 'rgba(0,212,255,0.2)' : 'rgba(255,255,255,0.05)' }} />)}
              </div>
              {/* Content */}
              <div className="flex-1 p-6">
                <div className="grid grid-cols-4 gap-3 mb-4">
                  {['Bs.24,850', '12 citas', '4 urgencias', '48 pacientes'].map((v, i) => (
                    <div key={i} className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                      <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10 }}>{['Ingresos', 'Hoy', 'Urgentes', 'Total'][i]}</div>
                      <div className="font-mono font-bold" style={{ color: '#00D4FF', fontSize: 14 }}>{v}</div>
                    </div>
                  ))}
                </div>
                {/* Calendar rows */}
                <div className="space-y-2">
                  {['Ana Ríos · 09:00 · Ortodoncia', 'Carlos M. · 10:30 · Endodoncia', 'María C. · 12:00 · Limpieza'].map((r, i) => (
                    <div key={i} className="flex items-center gap-3 px-3 py-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
                      <div className="w-1 h-6 rounded-full" style={{ background: ['#3B82F6', '#F59E0B', '#22C55E'][i] }} />
                      <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12 }}>{r}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {/* Dark overlay */}
            <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.35)' }} />
            {/* Play button */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className="flex items-center justify-center rounded-full transition-all group-hover:scale-110"
                style={{
                  width: 80, height: 80,
                  background: 'rgba(0,212,255,0.15)',
                  border: '2px solid rgba(0,212,255,0.6)',
                  backdropFilter: 'blur(12px)',
                  boxShadow: '0 0 40px rgba(0,212,255,0.4)',
                }}
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="#00D4FF" style={{ marginLeft: 4 }}>
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
              </div>
            </div>
            {/* Duration badge */}
            <div className="absolute bottom-4 right-4 px-3 py-1.5 rounded-full text-xs font-mono font-bold" style={{ background: 'rgba(0,0,0,0.6)', color: '#00D4FF', backdropFilter: 'blur(8px)' }}>
              2:14
            </div>
          </div>
        </div>
      </section>

      {/* ── PRICING ──────────────────────────────────────────────── */}
      <section id="pricing" className="relative py-28 px-6 overflow-hidden">
        <Orb x="20%" y="50%" size={350} opacity={0.09} color="#00D4FF" />
        <Orb x="80%" y="40%" size={300} opacity={0.07} color="#8B5CF6" />

        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-block text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-4" style={{ color: '#00D4FF', border: '1px solid rgba(0,212,255,0.25)', background: 'rgba(0,212,255,0.07)' }}>
              Planes y precios
            </div>
            <h2 className="font-serif text-white mb-3" style={{ fontSize: 'clamp(30px, 5vw, 52px)', letterSpacing: '-0.02em' }}>
              Invierte en el crecimiento{' '}
              <span className="text-gradient-cyan">de tu clínica.</span>
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 16 }}>
              Sin contratos de permanencia. Cancela cuando quieras.
            </p>
          </div>
          <div className="grid lg:grid-cols-3 gap-6 items-stretch">
            {PLANS.map(plan => <PriceCard key={plan.name} plan={plan} />)}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ────────────────────────────────────────────── */}
      <section className="relative py-32 px-6 overflow-hidden noise-overlay">
        {/* Fluid abstract gradient bg */}
        <div className="absolute inset-0 pointer-events-none">
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(0,212,255,0.12) 0%, rgba(0,80,150,0.08) 50%, transparent 100%)' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 60% 80% at 20% 80%, rgba(139,92,246,0.08) 0%, transparent 60%)' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 50% 60% at 80% 20%, rgba(0,212,255,0.06) 0%, transparent 60%)' }} />
        </div>
        {/* Grid */}
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(rgba(0,212,255,0.04) 1px, transparent 1px)', backgroundSize: '48px 48px' }} />

        <div className="relative max-w-3xl mx-auto text-center">
          <div className="inline-block text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-6" style={{ color: '#00D4FF', border: '1px solid rgba(0,212,255,0.25)', background: 'rgba(0,212,255,0.07)' }}>
            El momento es ahora
          </div>
          <h2 className="font-serif mb-6" style={{ fontSize: 'clamp(36px, 6vw, 72px)', letterSpacing: '-0.02em', lineHeight: 1.05 }}>
            <span className="text-gradient-white">Da el salto a la</span>
            <br />
            <span className="text-gradient-cyan">odontología digital</span>
            <br />
            <span className="text-gradient-white">hoy.</span>
          </h2>
          <p className="mb-10 leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)', fontSize: 17, maxWidth: 480, margin: '0 auto 40px' }}>
            Más de 30 consultorios bolivianos ya transformaron su gestión clínica con DOCK. El tuyo es el próximo.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={() => scrollTo('pricing')}
              className="cyan-glow-btn font-bold px-10 py-4 rounded-2xl text-base flex items-center gap-2 transition-all"
              style={{ color: '#020B18' }}
            >
              Contactar a un Asesor
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
            <button
              onClick={onEnterApp}
              className="font-semibold px-10 py-4 rounded-2xl text-base transition-all"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', color: '#FFFFFF' }}
            >
              Ver la plataforma
            </button>
          </div>
          <p className="mt-6 text-sm" style={{ color: 'rgba(255,255,255,0.25)' }}>
            Sin tarjeta de crédito · Prueba de 14 días gratis
          </p>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────── */}
      <footer className="border-t px-6 py-12" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-10">
            {/* Logo */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #00D4FF, #0077AA)' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2a7 7 0 0 1 7 7c0 5.25-7 13-7 13S5 14.25 5 9a7 7 0 0 1 7-7z" />
                  <circle cx="12" cy="9" r="2.5" fill="white" stroke="none" />
                </svg>
              </div>
              <div>
                <div className="font-serif text-white text-lg">DOCK</div>
                <div className="text-xs font-mono" style={{ color: '#00D4FF' }}>Clínica Dental IA</div>
              </div>
            </div>

            {/* Links */}
            <div className="flex flex-wrap gap-6 justify-center">
              {['Características', 'Precios', 'Blog', 'Soporte'].map(l => (
                <button key={l} className="text-sm transition-colors hover:text-white" style={{ color: 'rgba(255,255,255,0.35)' }}>{l}</button>
              ))}
            </div>

            {/* Social */}
            <div className="flex gap-3">
              {[
                { label: 'WhatsApp', path: 'M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51A9.5 9.5 0 0 0 2 11.5C2 16.74 6.26 21 11.5 21c5.24 0 9.5-4.26 9.5-9.5S16.74 2 11.5 2C6.26 2 2 6.26 2 11.5' },
                { label: 'Instagram', path: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z' },
                { label: 'LinkedIn', path: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z' },
              ].map(s => (
                <button
                  key={s.label}
                  className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="rgba(255,255,255,0.5)">
                    <path d={s.path} />
                  </svg>
                </button>
              ))}
            </div>
          </div>

          <div className="border-t pt-8 flex flex-col md:flex-row items-center justify-between gap-4" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
            <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 13 }}>
              © 2026 Street Software Startup. Todos los derechos reservados.
            </p>
            <div className="flex gap-5">
              {['Política de Privacidad (Ley 164 BO)', 'Términos de Servicio', 'Cookies'].map(l => (
                <button key={l} className="text-xs transition-colors hover:text-white" style={{ color: 'rgba(255,255,255,0.3)' }}>{l}</button>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
