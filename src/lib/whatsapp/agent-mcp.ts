import { getPayloadClient } from '@/lib/payload'
import type { KnowledgeItem, Tenant } from '@/payload-types'

export interface AgentContext {
  tenantId: string
  conversationId: string
  patientPhone: string
  patientName: string
  incomingMessage: string
}

export interface AgentResult {
  replyText: string
  toolCalled?: DockToolName
}

export type DockToolName =
  | 'search_clinic_knowledge'
  | 'check_available_slots'
  | 'book_appointment'
  | 'get_budget_estimate'
  | 'escalate_to_doctor'

const DAILY_SLOTS = ['09:00', '10:00', '11:00', '15:00', '16:00', '17:00']

function relationshipId(value: string | { id: string }) {
  return typeof value === 'string' ? value : value.id
}

function normalize(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('es')
}

function tomorrow() {
  const value = new Date()
  value.setDate(value.getDate() + 1)
  return value.toISOString().slice(0, 10)
}

export async function executeDockMcpTool(
  toolName: DockToolName,
  args: Record<string, unknown>,
  ctx: AgentContext,
): Promise<string> {
  const payload = await getPayloadClient()

  if (toolName === 'check_available_slots') {
    const targetDate = String(args.date || tomorrow())
    const existing = await payload.find({
      collection: 'appointments',
      overrideAccess: true,
      where: {
        and: [
          { tenant: { equals: ctx.tenantId } },
          { date: { equals: targetDate } },
          { status: { not_equals: 'cancelled' } },
        ],
      },
      limit: 100,
    })
    const bookedTimes = new Set(existing.docs.map((appointment) => appointment.time))
    const available = DAILY_SLOTS.filter((slot) => !bookedTimes.has(slot))
    return available.length
      ? `Horarios disponibles para ${targetDate}: ${available.join(', ')}.`
      : `No quedan horarios disponibles para ${targetDate}.`
  }

  if (toolName === 'book_appointment') {
    const date = String(args.date || '')
    const time = String(args.time || '')
    const reason = String(args.reason || 'Valoración odontológica').slice(0, 160)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) {
      return 'Para reservar necesito una fecha AAAA-MM-DD y una hora HH:mm válidas.'
    }

    const occupied = await payload.count({
      collection: 'appointments',
      overrideAccess: true,
      where: {
        and: [
          { tenant: { equals: ctx.tenantId } },
          { date: { equals: date } },
          { time: { equals: time } },
          { status: { not_equals: 'cancelled' } },
        ],
      },
    })
    if (occupied.totalDocs > 0) return 'Ese horario acaba de ocuparse. Puedo ofrecerte otro.'

    await payload.create({
      collection: 'appointments',
      overrideAccess: true,
      data: {
        tenant: ctx.tenantId,
        patientName: String(args.patientName || ctx.patientName).slice(0, 120),
        patientPhone: ctx.patientPhone,
        date,
        time,
        treatmentReason: reason,
        status: 'pending',
        createdByAgent: true,
      },
    })
    return `Registré tu solicitud para el ${date} a las ${time}. La clínica confirmará la cita por este medio.`
  }

  if (toolName === 'escalate_to_doctor') {
    await payload.update({
      collection: 'conversations',
      id: ctx.conversationId,
      overrideAccess: true,
      data: { status: 'human_handoff' },
    })
    return 'He transferido la conversación al equipo de la clínica. El agente automático queda pausado.'
  }

  if (toolName === 'get_budget_estimate' || toolName === 'search_clinic_knowledge') {
    const query = normalize(String(args.query || ctx.incomingMessage))
    const knowledge = await payload.find({
      collection: 'knowledge-items',
      overrideAccess: true,
      where: {
        and: [
          { tenant: { equals: ctx.tenantId } },
          { active: { equals: true } },
          ...(toolName === 'get_budget_estimate'
            ? [{ category: { equals: 'pricing' as const } }]
            : []),
        ],
      },
      limit: 100,
    })
    const match = findKnowledgeMatch(knowledge.docs, query)
    return match
      ? `${match.title}: ${match.content}`
      : 'No tengo información verificada suficiente para responder. Te comunicaré con el equipo de la clínica.'
  }

  return 'Herramienta no disponible.'
}

function findKnowledgeMatch(items: KnowledgeItem[], normalizedQuery: string) {
  const queryWords = normalizedQuery.split(/\s+/).filter((word) => word.length > 3)
  return items
    .map((item) => {
      const keywords = item.keywords?.map((entry) => entry.keyword) ?? []
      const searchable = normalize(`${item.title} ${item.content} ${keywords.join(' ')}`)
      const score = queryWords.reduce(
        (total, word) => total + (searchable.includes(word) ? 1 : 0),
        0,
      )
      return { item, score }
    })
    .sort((a, b) => b.score - a.score)
    .find((candidate) => candidate.score > 0)?.item
}

export async function runTenantAgent(ctx: AgentContext): Promise<AgentResult> {
  const payload = await getPayloadClient()
  const tenant = (await payload.findByID({
    collection: 'tenants',
    id: ctx.tenantId,
    overrideAccess: true,
  })) as Tenant
  const incoming = normalize(ctx.incomingMessage)
  const agentName = tenant.agentConfig?.agentName || 'Asistente Virtual DOCK'

  if (
    ['urgencia', 'sangrado', 'dolor fuerte', 'accidente', 'humano', 'doctor'].some((term) =>
      incoming.includes(term),
    )
  ) {
    const result = await executeDockMcpTool('escalate_to_doctor', {}, ctx)
    return {
      replyText: `${result} Si se trata de una emergencia médica, acude al servicio de urgencias más cercano.`,
      toolCalled: 'escalate_to_doctor',
    }
  }

  const date = ctx.incomingMessage.match(/\b\d{4}-\d{2}-\d{2}\b/)?.[0]
  const time = ctx.incomingMessage.match(/\b([01]\d|2[0-3]):[0-5]\d\b/)?.[0]
  const confirmsBooking = ['confirmo', 'reservar', 'agendar'].some((term) =>
    incoming.includes(term),
  )
  if (confirmsBooking && date && time && tenant.agentConfig?.toolsEnabled !== false) {
    const result = await executeDockMcpTool(
      'book_appointment',
      { date, time, reason: 'Consulta odontológica solicitada por WhatsApp' },
      ctx,
    )
    return { replyText: result, toolCalled: 'book_appointment' }
  }

  if (
    ['horario', 'disponible', 'disponibilidad', 'turno', 'cita'].some((term) =>
      incoming.includes(term),
    ) &&
    tenant.agentConfig?.toolsEnabled !== false
  ) {
    const result = await executeDockMcpTool(
      'check_available_slots',
      { date: date || tomorrow() },
      ctx,
    )
    return {
      replyText: `${result} Para solicitar uno, responde “agendar”, la fecha en formato AAAA-MM-DD y la hora HH:mm.`,
      toolCalled: 'check_available_slots',
    }
  }

  const pricingIntent = ['precio', 'cuanto', 'costo', 'presupuesto'].some((term) =>
    incoming.includes(term),
  )
  const knowledgeResult = await executeDockMcpTool(
    pricingIntent ? 'get_budget_estimate' : 'search_clinic_knowledge',
    { query: ctx.incomingMessage },
    ctx,
  )
  if (!knowledgeResult.startsWith('No tengo información')) {
    return {
      replyText: knowledgeResult,
      toolCalled: pricingIntent ? 'get_budget_estimate' : 'search_clinic_knowledge',
    }
  }

  return {
    replyText: `Hola ${ctx.patientName}, soy ${agentName} de ${tenant.name}. Puedo ayudarte con información de tratamientos, precios y horarios. Si prefieres hablar con una persona, escribe “doctor”.`,
  }
}

export function getTenantId(value: string | Tenant) {
  return relationshipId(value)
}
