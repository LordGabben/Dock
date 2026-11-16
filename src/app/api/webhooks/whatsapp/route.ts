import { createHmac, timingSafeEqual } from 'node:crypto'
import { getPayloadClient } from '@/lib/payload'
import { runTenantAgent } from '@/lib/whatsapp/agent-mcp'
import { sendWhatsAppTextMessage } from '@/lib/whatsapp/cloud-api'
import type { Conversation, Tenant } from '@/payload-types'

export const runtime = 'nodejs'

function verifyMetaSignature(rawBody: string, signature: string | null) {
  const secret = process.env.WHATSAPP_APP_SECRET
  if (!secret || !signature?.startsWith('sha256=')) return false

  const expected = `sha256=${createHmac('sha256', secret).update(rawBody).digest('hex')}`
  const expectedBuffer = Buffer.from(expected)
  const receivedBuffer = Buffer.from(signature)
  return (
    expectedBuffer.length === receivedBuffer.length &&
    timingSafeEqual(expectedBuffer, receivedBuffer)
  )
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const mode = url.searchParams.get('hub.mode')
  const token = url.searchParams.get('hub.verify_token')
  const challenge = url.searchParams.get('hub.challenge')

  if (
    mode === 'subscribe' &&
    challenge &&
    token &&
    process.env.WHATSAPP_VERIFY_TOKEN &&
    token === process.env.WHATSAPP_VERIFY_TOKEN
  ) {
    return new Response(challenge, { status: 200 })
  }

  return Response.json({ error: 'Verificación rechazada' }, { status: 403 })
}

export async function POST(request: Request) {
  const rawBody = await request.text()
  if (!verifyMetaSignature(rawBody, request.headers.get('x-hub-signature-256'))) {
    return Response.json({ error: 'Firma de Meta inválida' }, { status: 401 })
  }

  let body: Record<string, unknown>
  try {
    body = JSON.parse(rawBody) as Record<string, unknown>
  } catch {
    return Response.json({ error: 'JSON inválido' }, { status: 400 })
  }

  const entry = Array.isArray(body.entry) ? body.entry[0] : null
  const change = entry && Array.isArray(entry.changes) ? entry.changes[0] : null
  const value = change?.value as
    | {
        metadata?: { phone_number_id?: string }
        contacts?: Array<{ profile?: { name?: string } }>
        messages?: Array<{
          id?: string
          from?: string
          text?: { body?: string }
          interactive?: { button_reply?: { title?: string }; list_reply?: { title?: string } }
        }>
        statuses?: Array<{ id?: string; status?: 'sent' | 'delivered' | 'read' | 'failed' }>
      }
    | undefined

  if (!value) return Response.json({ status: 'ignored' })

  const payload = await getPayloadClient()

  if (value.statuses?.length) {
    for (const status of value.statuses) {
      if (!status.id || !status.status) continue
      await payload.update({
        collection: 'messages',
        overrideAccess: true,
        where: { whatsappMessageId: { equals: status.id } },
        data: { deliveryStatus: status.status },
      })
    }
    return Response.json({ status: 'delivery_status_updated' })
  }

  const incoming = value.messages?.[0]
  const phoneNumberId = value.metadata?.phone_number_id
  if (!incoming?.id || !incoming.from || !phoneNumberId) {
    return Response.json({ status: 'ignored_no_message' })
  }

  const duplicate = await payload.count({
    collection: 'messages',
    overrideAccess: true,
    where: { whatsappMessageId: { equals: incoming.id } },
  })
  if (duplicate.totalDocs > 0) return Response.json({ status: 'duplicate_ignored' })

  const tenantResult = await payload.find({
    collection: 'tenants',
    overrideAccess: true,
    where: {
      and: [
        { whatsappPhoneNumberId: { equals: phoneNumberId } },
        { connectionStatus: { equals: 'connected' } },
      ],
    },
    limit: 1,
  })
  const tenant = tenantResult.docs[0] as Tenant | undefined
  if (!tenant) return Response.json({ status: 'unknown_phone_number' })

  const patientPhone = incoming.from
  const patientName =
    value.contacts?.[0]?.profile?.name?.slice(0, 120) || `Paciente ${patientPhone.slice(-4)}`
  const messageText =
    incoming.text?.body ||
    incoming.interactive?.button_reply?.title ||
    incoming.interactive?.list_reply?.title ||
    '[Mensaje multimedia recibido]'

  const conversationResult = await payload.find({
    collection: 'conversations',
    overrideAccess: true,
    where: {
      and: [
        { tenant: { equals: tenant.id } },
        { patientPhone: { equals: patientPhone } },
        { status: { not_equals: 'closed' } },
      ],
    },
    limit: 1,
  })

  let conversation = conversationResult.docs[0] as Conversation | undefined
  if (!conversation) {
    conversation = await payload.create({
      collection: 'conversations',
      overrideAccess: true,
      data: {
        tenant: tenant.id,
        patientPhone,
        patientName,
        status: tenant.agentConfig?.enabled ? 'ai_active' : 'human_handoff',
        unreadCount: 1,
        lastMessagePreview: messageText.slice(0, 180),
        lastMessageAt: new Date().toISOString(),
      },
    })
  } else {
    conversation = await payload.update({
      collection: 'conversations',
      id: conversation.id,
      overrideAccess: true,
      data: {
        unreadCount: (conversation.unreadCount || 0) + 1,
        lastMessagePreview: messageText.slice(0, 180),
        lastMessageAt: new Date().toISOString(),
      },
    })
  }

  await payload.create({
    collection: 'messages',
    overrideAccess: true,
    data: {
      tenant: tenant.id,
      conversation: conversation.id,
      sender: 'patient',
      content: messageText.slice(0, 4096),
      whatsappMessageId: incoming.id,
      deliveryStatus: 'received',
    },
  })

  if (conversation.status !== 'ai_active' || !tenant.agentConfig?.enabled) {
    return Response.json({ status: 'stored_for_human' })
  }

  const agentResponse = await runTenantAgent({
    tenantId: tenant.id,
    conversationId: conversation.id,
    patientPhone,
    patientName,
    incomingMessage: messageText,
  })
  const sendResult = await sendWhatsAppTextMessage(tenant, patientPhone, agentResponse.replyText)

  await payload.create({
    collection: 'messages',
    overrideAccess: true,
    data: {
      tenant: tenant.id,
      conversation: conversation.id,
      sender: 'ai_agent',
      content: agentResponse.replyText,
      whatsappMessageId: sendResult.success ? sendResult.messageId : undefined,
      deliveryStatus: sendResult.success ? 'sent' : 'failed',
      toolExecuted: agentResponse.toolCalled,
    },
  })

  await payload.update({
    collection: 'conversations',
    id: conversation.id,
    overrideAccess: true,
    data: {
      lastMessagePreview: agentResponse.replyText.slice(0, 180),
      lastMessageAt: new Date().toISOString(),
    },
  })

  return Response.json({
    status: sendResult.success ? 'processed_by_agent' : 'agent_reply_not_sent',
    toolExecuted: agentResponse.toolCalled || null,
  })
}
