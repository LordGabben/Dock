'use server'

import { headers } from 'next/headers'
import { getPayloadClient } from '@/lib/payload'
import { adminTenantId } from '@/lib/tenant-access'
import { runTenantAgent } from '@/lib/whatsapp/agent-mcp'
import { hasWhatsAppCredentials, sendWhatsAppTextMessage } from '@/lib/whatsapp/cloud-api'
import {
  credentialReferenceForTenant,
  hasTenantAccessToken,
  storeTenantAccessToken,
} from '@/lib/whatsapp/credential-store'
import type { Admin, Conversation, KnowledgeItem, Message, Tenant } from '@/payload-types'

type ActionResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; error: string; code?: 'UNAUTHORIZED' | 'VALIDATION' | 'NOT_FOUND' }

export type WhatsAppWorkspace = {
  tenant: Tenant | null
  connectedCredential: boolean
  conversations: Array<
    Conversation & {
      messages: Message[]
    }
  >
}

async function getAdminContext(): Promise<{
  payload: Awaited<ReturnType<typeof getPayloadClient>>
  user: Admin
} | null> {
  const payload = await getPayloadClient()
  const auth = await payload.auth({ headers: await headers() })
  if (!auth.user || auth.user.collection !== 'admins') return null
  return { payload, user: auth.user as Admin }
}

function cleanText(value: unknown, max: number) {
  return typeof value === 'string' ? value.trim().slice(0, max) : ''
}

function relationshipId(value: string | { id: string }) {
  return typeof value === 'string' ? value : value.id
}

export async function getWhatsAppWorkspace(): Promise<ActionResult<WhatsAppWorkspace>> {
  const context = await getAdminContext()
  if (!context) {
    return {
      ok: false,
      code: 'UNAUTHORIZED',
      error: 'Inicia sesión como administrador de Payload para gestionar WhatsApp.',
    }
  }

  const assignedTenantId = adminTenantId(context.user)
  const tenant = assignedTenantId
    ? await context.payload.findByID({
        collection: 'tenants',
        id: assignedTenantId,
        user: context.user,
        overrideAccess: false,
      })
    : null
  if (!tenant) {
    return {
      ok: true,
      data: { tenant: null, connectedCredential: false, conversations: [] },
    }
  }

  const conversations = await context.payload.find({
    collection: 'conversations',
    user: context.user,
    overrideAccess: false,
    where: { tenant: { equals: tenant.id } },
    sort: '-lastMessageAt',
    limit: 100,
  })

  const withMessages = await Promise.all(
    conversations.docs.map(async (conversation) => {
      const messages = await context.payload.find({
        collection: 'messages',
        user: context.user,
        overrideAccess: false,
        where: {
          and: [{ tenant: { equals: tenant.id } }, { conversation: { equals: conversation.id } }],
        },
        sort: 'createdAt',
        limit: 200,
      })
      return { ...conversation, messages: messages.docs }
    }),
  )

  return {
    ok: true,
    data: {
      tenant,
      connectedCredential: await hasWhatsAppCredentials(tenant),
      conversations: withMessages,
    },
  }
}

export async function saveTenantWhatsAppConfig(input: {
  tenantId?: string
  name: string
  whatsappPhoneNumberId: string
  whatsappWabaId: string
  whatsappAccessToken?: string
  agentEnabled: boolean
  agentName: string
  systemPrompt: string
  toolsEnabled: boolean
}): Promise<ActionResult<Tenant>> {
  const context = await getAdminContext()
  if (!context) {
    return { ok: false, code: 'UNAUTHORIZED', error: 'Sesión administrativa requerida.' }
  }

  const name = cleanText(input.name, 120)
  const phoneNumberId = cleanText(input.whatsappPhoneNumberId, 64).replace(/\D/g, '')
  const wabaId = cleanText(input.whatsappWabaId, 64).replace(/\D/g, '')
  const agentName = cleanText(input.agentName, 80)
  const systemPrompt = cleanText(input.systemPrompt, 2000)
  const accessToken = cleanText(input.whatsappAccessToken, 4096)

  if (!name || !agentName || !systemPrompt) {
    return {
      ok: false,
      code: 'VALIDATION',
      error: 'Nombre de clínica, nombre del agente e instrucciones son obligatorios.',
    }
  }
  if ((phoneNumberId && phoneNumberId.length < 6) || (wabaId && wabaId.length < 6)) {
    return {
      ok: false,
      code: 'VALIDATION',
      error: 'Phone Number ID y WABA ID deben contener identificadores numéricos válidos.',
    }
  }

  if (accessToken && accessToken.length < 20) {
    return {
      ok: false,
      code: 'VALIDATION',
      error: 'El token permanente de Meta no tiene una longitud válida.',
    }
  }

  const assignedTenantId = adminTenantId(context.user)
  if (input.tenantId && assignedTenantId && input.tenantId !== assignedTenantId) {
    return {
      ok: false,
      code: 'NOT_FOUND',
      error: 'La configuración no pertenece a la clínica autenticada.',
    }
  }

  const baseData = {
    name,
    connectionMode: 'byoa' as const,
    whatsappPhoneNumberId: phoneNumberId || null,
    whatsappWabaId: wabaId || null,
    agentConfig: {
      enabled: Boolean(input.agentEnabled),
      agentName,
      systemPrompt,
      toolsEnabled: Boolean(input.toolsEnabled),
    },
  }

  if (assignedTenantId) {
    const existingTenant = await context.payload.findByID({
      collection: 'tenants',
      id: assignedTenantId,
      user: context.user,
      overrideAccess: false,
    })
    let credentialKey = existingTenant.credentialKey || null
    if (accessToken) {
      try {
        credentialKey = await storeTenantAccessToken(existingTenant.id, accessToken)
      } catch (error) {
        return {
          ok: false,
          error:
            error instanceof Error ? error.message : 'No fue posible guardar el token en Vault.',
        }
      }
    }
    const credentialReady = credentialKey
      ? await hasTenantAccessToken({ ...existingTenant, credentialKey })
      : false
    const tenant = await context.payload.update({
      collection: 'tenants',
      id: existingTenant.id,
      data: {
        ...baseData,
        credentialKey,
        connectionStatus: phoneNumberId && wabaId && credentialReady ? 'connected' : 'pending',
      },
      user: context.user,
      overrideAccess: false,
    })
    return { ok: true, data: tenant }
  }

  const primaryFallbackAvailable = Boolean(process.env.WHATSAPP_ACCESS_TOKEN_PRIMARY)
  const tenant = await context.payload.create({
    collection: 'tenants',
    data: {
      ...baseData,
      credentialKey: primaryFallbackAvailable ? 'WHATSAPP_ACCESS_TOKEN_PRIMARY' : null,
      connectionStatus:
        phoneNumberId && wabaId && primaryFallbackAvailable ? 'connected' : 'pending',
    },
    user: context.user,
    overrideAccess: false,
  })

  await context.payload.update({
    collection: 'admins',
    id: context.user.id,
    data: { tenant: tenant.id },
    user: context.user,
    overrideAccess: false,
  })

  if (!accessToken) return { ok: true, data: tenant }

  try {
    await storeTenantAccessToken(tenant.id, accessToken)
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error
          ? `${error.message} La clínica quedó creada en estado pendiente; puedes reintentar.`
          : 'No fue posible guardar el token en Vault.',
    }
  }

  const scopedUser = { ...context.user, tenant: tenant.id } as Admin
  const connectedTenant = await context.payload.update({
    collection: 'tenants',
    id: tenant.id,
    data: {
      ...baseData,
      credentialKey: credentialReferenceForTenant(tenant.id),
      connectionStatus: phoneNumberId && wabaId ? 'connected' : 'pending',
    },
    user: scopedUser,
    overrideAccess: false,
  })

  return { ok: true, data: connectedTenant }
}

export async function toggleConversationAgentStatus(
  conversationId: string,
  newStatus: 'ai_active' | 'human_handoff',
): Promise<ActionResult<{ status: 'ai_active' | 'human_handoff' }>> {
  const context = await getAdminContext()
  if (!context) {
    return { ok: false, code: 'UNAUTHORIZED', error: 'Sesión administrativa requerida.' }
  }
  if (!conversationId || !['ai_active', 'human_handoff'].includes(newStatus)) {
    return { ok: false, code: 'VALIDATION', error: 'Estado de conversación inválido.' }
  }

  await context.payload.update({
    collection: 'conversations',
    id: conversationId,
    data: { status: newStatus },
    user: context.user,
    overrideAccess: false,
  })
  return { ok: true, data: { status: newStatus } }
}

export async function sendDoctorManualMessage(input: {
  tenantId: string
  conversationId: string
  content: string
}): Promise<ActionResult<Message>> {
  const context = await getAdminContext()
  if (!context) {
    return { ok: false, code: 'UNAUTHORIZED', error: 'Sesión administrativa requerida.' }
  }
  const content = cleanText(input.content, 4096)
  if (!content) return { ok: false, code: 'VALIDATION', error: 'Escribe un mensaje.' }

  const [tenant, conversation] = await Promise.all([
    context.payload.findByID({
      collection: 'tenants',
      id: input.tenantId,
      user: context.user,
      overrideAccess: false,
    }),
    context.payload.findByID({
      collection: 'conversations',
      id: input.conversationId,
      user: context.user,
      overrideAccess: false,
    }),
  ])
  if (relationshipId(conversation.tenant) !== tenant.id) {
    return { ok: false, code: 'NOT_FOUND', error: 'La conversación no pertenece a la clínica.' }
  }

  const sendResult = await sendWhatsAppTextMessage(tenant, conversation.patientPhone, content)
  const message = await context.payload.create({
    collection: 'messages',
    user: context.user,
    overrideAccess: false,
    data: {
      tenant: tenant.id,
      conversation: conversation.id,
      sender: 'doctor',
      content,
      whatsappMessageId: sendResult.success ? sendResult.messageId : undefined,
      deliveryStatus: sendResult.success ? 'sent' : 'failed',
    },
  })
  await context.payload.update({
    collection: 'conversations',
    id: conversation.id,
    user: context.user,
    overrideAccess: false,
    data: {
      status: 'human_handoff',
      lastMessagePreview: content.slice(0, 180),
      lastMessageAt: new Date().toISOString(),
    },
  })

  return sendResult.success ? { ok: true, data: message } : { ok: false, error: sendResult.error }
}

export async function simulateIncomingPatientWhatsApp(input: {
  tenantId: string
  patientPhone: string
  patientName: string
  text: string
}): Promise<ActionResult<{ conversationId: string }>> {
  const context = await getAdminContext()
  if (!context) {
    return { ok: false, code: 'UNAUTHORIZED', error: 'Sesión administrativa requerida.' }
  }

  const patientPhone = cleanText(input.patientPhone, 24).replace(/[^\d+]/g, '')
  const patientName = cleanText(input.patientName, 120)
  const text = cleanText(input.text, 4096)
  if (!input.tenantId || patientPhone.length < 8 || !patientName || !text) {
    return { ok: false, code: 'VALIDATION', error: 'Completa paciente, teléfono y mensaje.' }
  }

  const tenant = await context.payload.findByID({
    collection: 'tenants',
    id: input.tenantId,
    user: context.user,
    overrideAccess: false,
  })
  const existing = await context.payload.find({
    collection: 'conversations',
    user: context.user,
    overrideAccess: false,
    where: {
      and: [
        { tenant: { equals: tenant.id } },
        { patientPhone: { equals: patientPhone } },
        { status: { not_equals: 'closed' } },
      ],
    },
    limit: 1,
  })
  let conversation = existing.docs[0]
  if (!conversation) {
    conversation = await context.payload.create({
      collection: 'conversations',
      user: context.user,
      overrideAccess: false,
      data: {
        tenant: tenant.id,
        patientPhone,
        patientName,
        status: tenant.agentConfig?.enabled ? 'ai_active' : 'human_handoff',
        unreadCount: 1,
        lastMessagePreview: text.slice(0, 180),
        lastMessageAt: new Date().toISOString(),
      },
    })
  }

  await context.payload.create({
    collection: 'messages',
    user: context.user,
    overrideAccess: false,
    data: {
      tenant: tenant.id,
      conversation: conversation.id,
      sender: 'patient',
      content: text,
      deliveryStatus: 'received',
    },
  })

  if (conversation.status === 'ai_active' && tenant.agentConfig?.enabled) {
    const result = await runTenantAgent({
      tenantId: tenant.id,
      conversationId: conversation.id,
      patientPhone,
      patientName,
      incomingMessage: text,
    })
    await context.payload.create({
      collection: 'messages',
      user: context.user,
      overrideAccess: false,
      data: {
        tenant: tenant.id,
        conversation: conversation.id,
        sender: 'ai_agent',
        content: result.replyText,
        deliveryStatus: 'sent',
        toolExecuted: result.toolCalled,
      },
    })
    await context.payload.update({
      collection: 'conversations',
      id: conversation.id,
      user: context.user,
      overrideAccess: false,
      data: {
        lastMessagePreview: result.replyText.slice(0, 180),
        lastMessageAt: new Date().toISOString(),
      },
    })
  }

  return { ok: true, data: { conversationId: conversation.id } }
}

export async function getTenantKnowledge(tenantId: string): Promise<ActionResult<KnowledgeItem[]>> {
  const context = await getAdminContext()
  if (!context) {
    return { ok: false, code: 'UNAUTHORIZED', error: 'Sesión administrativa requerida.' }
  }
  const knowledge = await context.payload.find({
    collection: 'knowledge-items',
    user: context.user,
    overrideAccess: false,
    where: { tenant: { equals: tenantId } },
    sort: '-updatedAt',
    limit: 200,
  })
  return { ok: true, data: knowledge.docs }
}

export async function saveKnowledgeItem(input: {
  id?: string
  tenantId: string
  category: 'pricing' | 'schedule' | 'faq' | 'protocols' | 'services'
  title: string
  content: string
  keywords: string[]
  active: boolean
}): Promise<ActionResult<KnowledgeItem>> {
  const context = await getAdminContext()
  if (!context) {
    return { ok: false, code: 'UNAUTHORIZED', error: 'Sesión administrativa requerida.' }
  }

  const title = cleanText(input.title, 160)
  const content = cleanText(input.content, 5000)
  const allowedCategories = ['pricing', 'schedule', 'faq', 'protocols', 'services']
  const keywords = input.keywords
    .map((keyword) => cleanText(keyword, 60))
    .filter(Boolean)
    .slice(0, 20)
  if (!input.tenantId || !title || !content || !allowedCategories.includes(input.category)) {
    return { ok: false, code: 'VALIDATION', error: 'Completa los campos obligatorios.' }
  }

  const data = {
    tenant: input.tenantId,
    category: input.category,
    title,
    content,
    keywords: keywords.map((keyword) => ({ keyword })),
    active: Boolean(input.active),
  }
  const item = input.id
    ? await context.payload.update({
        collection: 'knowledge-items',
        id: input.id,
        data,
        user: context.user,
        overrideAccess: false,
      })
    : await context.payload.create({
        collection: 'knowledge-items',
        data,
        user: context.user,
        overrideAccess: false,
      })
  return { ok: true, data: item }
}

export async function deleteKnowledgeItem(
  tenantId: string,
  itemId: string,
): Promise<ActionResult<{ id: string }>> {
  const context = await getAdminContext()
  if (!context) {
    return { ok: false, code: 'UNAUTHORIZED', error: 'Sesión administrativa requerida.' }
  }
  const item = await context.payload.findByID({
    collection: 'knowledge-items',
    id: itemId,
    user: context.user,
    overrideAccess: false,
  })
  if (relationshipId(item.tenant) !== tenantId) {
    return { ok: false, code: 'NOT_FOUND', error: 'El contenido no pertenece a la clínica.' }
  }
  await context.payload.delete({
    collection: 'knowledge-items',
    id: itemId,
    user: context.user,
    overrideAccess: false,
  })
  return { ok: true, data: { id: itemId } }
}
