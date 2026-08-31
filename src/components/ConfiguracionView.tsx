import { useState } from 'react';

type ConfigTab = 'clinica' | 'usuarios' | 'whatsapp' | 'suscripcion' | 'notificaciones';

const CONFIG_TABS: { id: ConfigTab; label: string; icon: string }[] = [
  { id: 'clinica',         label: 'Clínica',        icon: '🏥' },
  { id: 'usuarios',        label: 'Usuarios',        icon: '👥' },
  { id: 'whatsapp',        label: 'Bot WhatsApp',    icon: '🤖' },
  { id: 'suscripcion',     label: 'Suscripción',     icon: '💳' },
  { id: 'notificaciones',  label: 'Notificaciones',  icon: '🔔' },
];

const USERS = [
  { name: 'Dr. Juan Pérez',       email: 'jperez@clinica.bo',   role: 'Odontólogo Principal', status: 'Activo', avatar: 'JP', color: '#1A4F8A' },
  { name: 'Dra. Sofía Mamani',    email: 'smamani@clinica.bo',  role: 'Odontóloga',            status: 'Activo', avatar: 'SM', color: '#7C3AED' },
  { name: 'Laura Flores',          email: 'lflores@clinica.bo',  role: 'Recepcionista',         status: 'Activo', avatar: 'LF', color: '#059669' },
  { name: 'Diego Quispe',          email: 'dquispe@clinica.bo',  role: 'Asistente Dental',      status: 'Invitado', avatar: 'DQ', color: '#D97706' },
];

function SectionLabel({ label }: { label: string }) {
  return <h3 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#1A4F8A' }}>{label}</h3>;
}

function FormField({ label, value, type = 'text', placeholder }: { label: string; value: string; type?: string; placeholder?: string }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-500 mb-1">{label}</label>
      <input
        type={type}
        defaultValue={value}
        placeholder={placeholder}
        className="w-full px-3 py-2 text-sm rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
        style={{ borderColor: '#E2E8F0', background: '#FAFBFC' }}
      />
    </div>
  );
}

function Toggle({ label, desc, defaultOn }: { label: string; desc?: string; defaultOn?: boolean }) {
  const [on, setOn] = useState(defaultOn ?? false);
  return (
    <div className="flex items-start justify-between gap-4 py-3 border-b last:border-b-0" style={{ borderColor: '#F1F5F9' }}>
      <div>
        <div className="text-sm font-semibold text-slate-700">{label}</div>
        {desc && <div className="text-xs text-slate-400 mt-0.5">{desc}</div>}
      </div>
      <button
        onClick={() => setOn(!on)}
        className="relative flex-shrink-0 w-10 h-5.5 rounded-full transition-all"
        style={{ background: on ? '#1A4F8A' : '#CBD5E1', height: 22, width: 40 }}
      >
        <div className="absolute top-0.5 transition-all rounded-full bg-white shadow"
          style={{ width: 18, height: 18, left: on ? 20 : 2 }} />
      </button>
    </div>
  );
}

function ClinicaTab() {
  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <SectionLabel label="Información General" />
        <div className="bg-white rounded-xl border p-5 space-y-4" style={{ borderColor: '#E2E8F0' }}>
          {/* Logo upload */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-2">Logo de la Clínica</label>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl flex items-center justify-center border-2 text-2xl" style={{ background: '#EFF6FF', borderColor: '#BFDBFE' }}>
                🦷
              </div>
              <div>
                <button className="px-3 py-1.5 text-xs font-semibold rounded-lg border hover:bg-slate-50 transition-colors" style={{ borderColor: '#E2E8F0', color: '#475569' }}>
                  Subir imagen
                </button>
                <p className="text-xs text-slate-400 mt-1">PNG, JPG hasta 2 MB. Recomendado: 200x200px</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Nombre de la Clínica" value="Clínica Dental DOCK" />
            <FormField label="NIT / RUC" value="123456789" />
            <FormField label="Teléfono Principal" value="+591 2 2234567" type="tel" />
            <FormField label="WhatsApp Corporativo" value="+591 72345678" type="tel" />
          </div>
          <FormField label="Dirección" value="Av. Arce #2345, Sopocachi, La Paz — Bolivia" />
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Ciudad" value="La Paz" />
            <FormField label="País" value="Bolivia" />
          </div>
        </div>
      </div>

      <div>
        <SectionLabel label="Horario de Atención" />
        <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: '#E2E8F0' }}>
          {[
            { day: 'Lunes',     from: '08:00', to: '18:00', open: true },
            { day: 'Martes',    from: '08:00', to: '18:00', open: true },
            { day: 'Miércoles', from: '08:00', to: '18:00', open: true },
            { day: 'Jueves',    from: '08:00', to: '18:00', open: true },
            { day: 'Viernes',   from: '08:00', to: '17:00', open: true },
            { day: 'Sábado',    from: '09:00', to: '13:00', open: true },
            { day: 'Domingo',   from: '',      to: '',      open: false },
          ].map(d => (
            <div key={d.day} className="flex items-center gap-4 px-5 py-3 border-b last:border-b-0" style={{ borderColor: '#F1F5F9' }}>
              <div className="w-24 text-sm font-semibold text-slate-700">{d.day}</div>
              {d.open ? (
                <>
                  <input type="time" defaultValue={d.from} className="px-2 py-1 text-xs rounded border focus:outline-none focus:ring-1 focus:ring-blue-500" style={{ borderColor: '#E2E8F0' }} />
                  <span className="text-slate-400 text-xs">hasta</span>
                  <input type="time" defaultValue={d.to} className="px-2 py-1 text-xs rounded border focus:outline-none focus:ring-1 focus:ring-blue-500" style={{ borderColor: '#E2E8F0' }} />
                  <span className="text-xs font-semibold text-green-600 px-2 py-0.5 rounded-full" style={{ background: '#F0FDF4' }}>Abierto</span>
                </>
              ) : (
                <span className="text-xs font-semibold text-slate-400 px-2 py-0.5 rounded-full" style={{ background: '#F8FAFC' }}>Cerrado</span>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <button className="px-5 py-2 text-sm font-semibold text-white rounded-lg transition-opacity hover:opacity-90" style={{ background: '#1A4F8A' }}>
          Guardar Cambios
        </button>
      </div>
    </div>
  );
}

function UsuariosTab() {
  const [showInvite, setShowInvite] = useState(false);
  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-800">Equipo de la Clínica</h3>
          <p className="text-xs text-slate-400 mt-0.5">{USERS.length} miembros · Plan Pro (hasta 10 usuarios)</p>
        </div>
        <button onClick={() => setShowInvite(true)}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white rounded-lg hover:opacity-90 transition-opacity"
          style={{ background: '#1A4F8A' }}>
          + Invitar Usuario
        </button>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: '#E2E8F0' }}>
        {USERS.map((u, i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-4 border-b last:border-b-0 hover:bg-slate-50 transition-colors" style={{ borderColor: '#F1F5F9' }}>
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
              style={{ background: u.color }}>
              {u.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-slate-800">{u.name}</div>
              <div className="text-xs text-slate-400 mt-0.5">{u.email}</div>
            </div>
            <span className="text-xs font-semibold text-slate-500 px-2.5 py-1 rounded-full" style={{ background: '#F1F5F9' }}>{u.role}</span>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${u.status === 'Activo' ? 'text-green-600 bg-green-50' : 'text-amber-600 bg-amber-50'}`}>{u.status}</span>
            <button className="text-xs text-slate-400 hover:text-red-500 transition-colors">Eliminar</button>
          </div>
        ))}
      </div>

      {showInvite && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.4)' }}>
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-96" style={{ border: '1px solid #E2E8F0' }}>
            <h3 className="font-bold text-slate-800 mb-4">Invitar Nuevo Usuario</h3>
            <div className="space-y-3">
              <FormField label="Correo Electrónico" value="" placeholder="usuario@clinica.bo" type="email" />
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Rol</label>
                <select className="w-full px-3 py-2 text-sm rounded-lg border focus:outline-none" style={{ borderColor: '#E2E8F0', background: '#FAFBFC' }}>
                  <option>Odontólogo</option>
                  <option>Recepcionista</option>
                  <option>Asistente Dental</option>
                  <option>Administrador</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setShowInvite(false)} className="flex-1 py-2 text-sm font-semibold rounded-lg border" style={{ borderColor: '#E2E8F0', color: '#475569' }}>Cancelar</button>
              <button onClick={() => setShowInvite(false)} className="flex-1 py-2 text-sm font-semibold text-white rounded-lg" style={{ background: '#1A4F8A' }}>Enviar Invitación</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function WhatsAppTab() {
  const [botName, setBotName] = useState('DOCK Assistant');
  const [greeting, setGreeting] = useState('¡Hola! 👋 Soy el asistente virtual de Clínica Dental DOCK. ¿En qué puedo ayudarte hoy?');
  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <SectionLabel label="Identidad del Bot" />
        <div className="bg-white rounded-xl border p-5 space-y-4" style={{ borderColor: '#E2E8F0' }}>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Nombre del Asistente</label>
            <input value={botName} onChange={e => setBotName(e.target.value)} className="w-full px-3 py-2 text-sm rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500" style={{ borderColor: '#E2E8F0', background: '#FAFBFC' }} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Mensaje de Bienvenida</label>
            <textarea rows={3} value={greeting} onChange={e => setGreeting(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              style={{ borderColor: '#E2E8F0', background: '#FAFBFC' }} />
          </div>
          {/* Preview bubble */}
          <div className="rounded-xl p-3" style={{ background: '#F0FDF4' }}>
            <p className="text-xs font-semibold text-green-600 mb-2">Vista previa del mensaje</p>
            <div className="inline-block px-3 py-2 rounded-xl rounded-tl-sm text-sm text-white" style={{ background: '#128C7E', maxWidth: '90%' }}>
              {greeting || '...'}
            </div>
          </div>
        </div>
      </div>

      <div>
        <SectionLabel label="Disponibilidad del Bot" />
        <div className="bg-white rounded-xl border px-5" style={{ borderColor: '#E2E8F0' }}>
          <Toggle label="Bot activo 24/7" desc="El bot responderá en cualquier horario, incluso fuera de horas de consulta" defaultOn />
          <Toggle label="Notificar al equipo fuera de horario" desc="Enviar alerta cuando llegue un mensaje urgente en horario no laboral" defaultOn />
          <Toggle label="Auto-cierre de conversaciones inactivas" desc="Cerrar chats sin actividad por más de 48 horas" />
        </div>
      </div>

      <div>
        <SectionLabel label="Capacidades de IA" />
        <div className="bg-white rounded-xl border p-5 space-y-4" style={{ borderColor: '#E2E8F0' }}>
          {[
            { label: 'Agendar citas automáticamente', on: true },
            { label: 'Confirmar/cancelar citas existentes', on: true },
            { label: 'Responder preguntas frecuentes', on: true },
            { label: 'Enviar recordatorios de pago', on: false },
            { label: 'Compartir resultados de tratamiento', on: false },
          ].map(cap => (
            <div key={cap.label} className="flex items-center justify-between">
              <span className="text-sm text-slate-700">{cap.label}</span>
              <div className="relative w-10 rounded-full" style={{ background: cap.on ? '#1A4F8A' : '#CBD5E1', height: 22, width: 40, flexShrink: 0 }}>
                <div className="absolute top-0.5 rounded-full bg-white shadow" style={{ width: 18, height: 18, left: cap.on ? 20 : 2 }} />
              </div>
            </div>
          ))}
          {/* Quota */}
          <div className="pt-2 border-t" style={{ borderColor: '#F1F5F9' }}>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="font-semibold text-slate-600">Mensajes IA este mes</span>
              <span className="font-bold font-mono text-blue-700">1,842 / 5,000</span>
            </div>
            <div className="h-2 rounded-full" style={{ background: '#EFF6FF' }}>
              <div className="h-2 rounded-full" style={{ width: '36.8%', background: 'linear-gradient(90deg, #3B82F6, #1A4F8A)' }} />
            </div>
            <p className="text-xs text-slate-400 mt-1.5">36.8% de la cuota mensual utilizada</p>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button className="px-5 py-2 text-sm font-semibold text-white rounded-lg hover:opacity-90 transition-opacity" style={{ background: '#1A4F8A' }}>
          Guardar Configuración
        </button>
      </div>
    </div>
  );
}

function SuscripcionTab() {
  const PLAN_FEATURES: Record<string, string[]> = {
    Básico:      ['1 odontólogo', '100 pacientes', 'Calendario básico', 'WhatsApp Bot (500 msg/mes)'],
    Pro:         ['5 odontólogos', 'Pacientes ilimitados', 'Módulos completos', 'WhatsApp Bot (5,000 msg/mes)', 'Reportes avanzados'],
    Enterprise:  ['Usuarios ilimitados', 'Multi-sucursal', 'API personalizada', 'WhatsApp Bot ilimitado', 'Soporte prioritario 24/7'],
  };
  return (
    <div className="space-y-6 max-w-2xl">
      {/* Current plan */}
      <div className="rounded-xl p-5" style={{ background: 'linear-gradient(135deg, #0C1E38, #1A4F8A)', border: '1px solid rgba(59,130,246,0.4)' }}>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold text-blue-300 uppercase tracking-widest mb-1">Plan Actual</p>
            <h3 className="text-2xl font-bold text-white">Pro</h3>
            <p className="text-sm text-blue-200 mt-1">Bs. 450 / mes · Facturado anualmente</p>
          </div>
          <div className="text-right">
            <span className="px-3 py-1 rounded-full text-xs font-bold text-green-300" style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)' }}>Activo</span>
            <p className="text-xs text-blue-300 mt-2">Próxima factura: 01 Jul 2024</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-4">
          {PLAN_FEATURES['Pro'].map(f => (
            <span key={f} className="text-xs px-2.5 py-1 rounded-full text-blue-100" style={{ background: 'rgba(255,255,255,0.1)' }}>✓ {f}</span>
          ))}
        </div>
      </div>

      {/* Other plans */}
      <SectionLabel label="Cambiar Plan" />
      <div className="grid grid-cols-3 gap-3">
        {(['Básico', 'Pro', 'Enterprise'] as const).map((plan, i) => {
          const prices = ['Bs. 150', 'Bs. 450', 'Bs. 990'];
          const current = plan === 'Pro';
          return (
            <div key={plan} className="rounded-xl border p-4 transition-all" style={{
              borderColor: current ? '#1A4F8A' : '#E2E8F0',
              background: current ? '#EFF6FF' : '#FAFBFC',
              boxShadow: current ? '0 0 0 2px #1A4F8A33' : undefined
            }}>
              <div className="flex items-start justify-between mb-3">
                <h4 className="font-bold text-slate-800">{plan}</h4>
                {current && <span className="text-xs font-bold text-blue-700 px-1.5 py-0.5 rounded" style={{ background: '#DBEAFE' }}>Actual</span>}
              </div>
              <p className="text-lg font-bold font-mono" style={{ color: current ? '#1A4F8A' : '#475569' }}>{prices[i]}</p>
              <p className="text-xs text-slate-400 mb-3">/mes</p>
              <ul className="space-y-1 mb-4">
                {PLAN_FEATURES[plan].slice(0, 3).map(f => (
                  <li key={f} className="text-xs text-slate-600 flex items-start gap-1">
                    <span className="text-green-500 mt-0.5">✓</span>{f}
                  </li>
                ))}
              </ul>
              <button className="w-full py-1.5 text-xs font-semibold rounded-lg transition-all"
                style={{
                  background: current ? '#1A4F8A' : 'transparent',
                  color: current ? 'white' : '#1A4F8A',
                  border: `1px solid ${current ? '#1A4F8A' : '#BFDBFE'}`
                }}>
                {current ? 'Plan Actual' : plan === 'Básico' ? 'Degradar' : 'Actualizar'}
              </button>
            </div>
          );
        })}
      </div>

      {/* Billing history */}
      <div>
        <SectionLabel label="Historial de Facturación" />
        <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: '#E2E8F0' }}>
          {[
            { date: '01 Jun 2024', desc: 'Plan Pro — Junio 2024',   amount: 'Bs. 450', status: 'Pagado' },
            { date: '01 May 2024', desc: 'Plan Pro — Mayo 2024',    amount: 'Bs. 450', status: 'Pagado' },
            { date: '01 Abr 2024', desc: 'Plan Pro — Abril 2024',   amount: 'Bs. 450', status: 'Pagado' },
          ].map((row, i) => (
            <div key={i} className="flex items-center justify-between px-5 py-3.5 border-b last:border-b-0" style={{ borderColor: '#F1F5F9' }}>
              <div>
                <div className="text-sm font-semibold text-slate-800">{row.desc}</div>
                <div className="text-xs text-slate-400 mt-0.5">{row.date}</div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold font-mono text-slate-700">{row.amount}</span>
                <span className="text-xs font-semibold text-green-600 px-2 py-0.5 rounded-full" style={{ background: '#F0FDF4' }}>{row.status}</span>
                <button className="text-xs text-blue-600 hover:underline">PDF</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function NotificacionesTab() {
  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <SectionLabel label="Recordatorios de Citas" />
        <div className="bg-white rounded-xl border px-5" style={{ borderColor: '#E2E8F0' }}>
          <Toggle label="WhatsApp — 24h antes de la cita"           desc="Mensaje automático un día antes de la cita programada"  defaultOn />
          <Toggle label="WhatsApp — 2h antes de la cita"            desc="Recordatorio final dos horas antes de la cita"           defaultOn />
          <Toggle label="Email — Confirmación al agendar"           desc="Enviar email al paciente cuando su cita es confirmada"   defaultOn />
          <Toggle label="WhatsApp — Solicitar confirmación"         desc="Pedir al paciente que confirme asistencia con botón Sí/No" defaultOn />
          <Toggle label="Notificación interna — Cita cancelada"     desc="Alertar al equipo cuando un paciente cancele su cita"    defaultOn />
        </div>
      </div>

      <div>
        <SectionLabel label="Alertas Financieras" />
        <div className="bg-white rounded-xl border px-5" style={{ borderColor: '#E2E8F0' }}>
          <Toggle label="WhatsApp — Cobro de cuota próxima"         desc="Recordar al paciente 3 días antes del vencimiento de cuota" defaultOn />
          <Toggle label="WhatsApp — Cuota vencida"                  desc="Notificar al paciente cuando una cuota esté vencida"      defaultOn />
          <Toggle label="Email — Resumen financiero mensual"        desc="Informe automático a inicio de mes para el administrador"  />
          <Toggle label="Notificación interna — Deuda > Bs. 1,000" desc="Alertar cuando la deuda de un paciente supere el límite"   defaultOn />
        </div>
      </div>

      <div>
        <SectionLabel label="Operaciones e Inventario" />
        <div className="bg-white rounded-xl border px-5" style={{ borderColor: '#E2E8F0' }}>
          <Toggle label="Alerta de stock bajo"                      desc="Notificar cuando un insumo esté por debajo del mínimo"    defaultOn />
          <Toggle label="Alerta de stock agotado"                   desc="Notificación urgente cuando un insumo llegue a cero"      defaultOn />
          <Toggle label="Informe semanal de inventario"             desc="Resumen automático cada lunes de los niveles de stock"    />
        </div>
      </div>

      <div className="flex justify-end">
        <button className="px-5 py-2 text-sm font-semibold text-white rounded-lg hover:opacity-90 transition-opacity" style={{ background: '#1A4F8A' }}>
          Guardar Preferencias
        </button>
      </div>
    </div>
  );
}

export default function ConfiguracionView() {
  const [activeTab, setActiveTab] = useState<ConfigTab>('clinica');

  return (
    <div className="flex h-full overflow-hidden">
      {/* Left nav */}
      <div className="w-52 flex-shrink-0 border-r overflow-y-auto py-4 px-3" style={{ background: '#FFFFFF', borderColor: '#E2E8F0' }}>
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400 px-3 mb-3">Configuración</p>
        <div className="space-y-0.5">
          {CONFIG_TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-semibold text-left transition-all ${
                activeTab === tab.id ? 'text-blue-800' : 'text-slate-600 hover:bg-slate-50'
              }`}
              style={{ background: activeTab === tab.id ? '#EFF6FF' : undefined }}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-8" style={{ background: '#F8FAFD' }}>
        {activeTab === 'clinica'        && <ClinicaTab />}
        {activeTab === 'usuarios'       && <UsuariosTab />}
        {activeTab === 'whatsapp'       && <WhatsAppTab />}
        {activeTab === 'suscripcion'    && <SuscripcionTab />}
        {activeTab === 'notificaciones' && <NotificacionesTab />}
      </div>
    </div>
  );
}
