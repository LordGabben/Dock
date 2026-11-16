import type { Tenant } from '@/payload-types'
import { hasTenantAccessToken, readTenantAccessToken } from './credential-store'

export type WhatsAppSendResult =
  | { success: true; messageId: string }
  | { success: false; error: string }

export async function hasWhatsAppCredentials(tenant: Tenant) {
  return Boolean(tenant.whatsappPhoneNumberId && (await hasTenantAccessToken(tenant)))
}

export async function sendWhatsAppTextMessage(
  tenant: Tenant,
  toPhone: string,
  text: string,
): Promise<WhatsAppSendResult> {
  const phoneNumberId = tenant.whatsappPhoneNumberId

  if (!phoneNumberId) {
    return {
      success: false,
      error: 'La clínica no tiene una credencial segura o Phone Number ID configurado.',
    }
  }

  const cleanPhone = toPhone.replace(/\D/g, '')
  if (!cleanPhone || text.trim().length === 0) {
    return { success: false, error: 'El destinatario y el mensaje son obligatorios.' }
  }

  try {
    const { token: accessToken } = await readTenantAccessToken(tenant)
    if (!accessToken) {
      return {
        success: false,
        error: 'La clínica no tiene una credencial segura configurada.',
      }
    }
    const apiVersion = process.env.WHATSAPP_GRAPH_API_VERSION || 'v22.0'
    const response = await fetch(
      `https://graph.facebook.com/${apiVersion}/${encodeURIComponent(phoneNumberId)}/messages`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: cleanPhone,
          type: 'text',
          text: {
            preview_url: false,
            body: text.slice(0, 4096),
          },
        }),
      },
    )

    const data = (await response.json()) as {
      error?: { message?: string }
      messages?: Array<{ id?: string }>
    }
    const messageId = data.messages?.[0]?.id

    if (!response.ok || !messageId) {
      return {
        success: false,
        error: data.error?.message || 'Meta rechazó el envío del mensaje.',
      }
    }

    return { success: true, messageId }
  } catch {
    return {
      success: false,
      error: 'No fue posible conectar con WhatsApp Cloud API.',
    }
  }
}
