import type { Tenant } from '@/payload-types'

const PRIMARY_CREDENTIAL_KEY = 'WHATSAPP_ACCESS_TOKEN_PRIMARY'
const VAULT_PREFIX = 'dock/whatsapp/'

export type CredentialSource = 'supabase-vault' | 'primary-fallback' | 'none'

export class CredentialStoreError extends Error {
  constructor(
    message: string,
    public readonly code:
      | 'VAULT_NOT_CONFIGURED'
      | 'VAULT_SETUP_REQUIRED'
      | 'VAULT_REQUEST_FAILED'
      | 'INVALID_REFERENCE',
  ) {
    super(message)
    this.name = 'CredentialStoreError'
  }
}

function supabaseConfig() {
  const url = process.env.SUPABASE_URL?.replace(/\/$/, '')
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  return url && serviceRoleKey ? { url, serviceRoleKey } : null
}

function tenantSecretName(tenantId: string) {
  if (!/^[a-zA-Z0-9_-]{1,128}$/.test(tenantId)) {
    throw new CredentialStoreError('Identificador de clínica inválido.', 'INVALID_REFERENCE')
  }
  return `${VAULT_PREFIX}${tenantId}`
}

async function callVaultRpc<T>(functionName: string, body: Record<string, unknown>): Promise<T> {
  const config = supabaseConfig()
  if (!config) {
    throw new CredentialStoreError(
      'Supabase Vault no está configurado en este entorno.',
      'VAULT_NOT_CONFIGURED',
    )
  }

  const response = await fetch(`${config.url}/rest/v1/rpc/${functionName}`, {
    method: 'POST',
    headers: {
      apikey: config.serviceRoleKey,
      Authorization: `Bearer ${config.serviceRoleKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
    cache: 'no-store',
  })

  if (!response.ok) {
    if (response.status === 404 || response.status === 400) {
      throw new CredentialStoreError(
        'Las funciones de Supabase Vault aún no están instaladas.',
        'VAULT_SETUP_REQUIRED',
      )
    }
    throw new CredentialStoreError('Supabase Vault rechazó la operación.', 'VAULT_REQUEST_FAILED')
  }

  return (await response.json()) as T
}

export function credentialReferenceForTenant(tenantId: string) {
  return tenantSecretName(tenantId)
}

export async function storeTenantAccessToken(tenantId: string, token: string) {
  const normalizedToken = token.trim()
  if (normalizedToken.length < 20 || normalizedToken.length > 4096) {
    throw new CredentialStoreError(
      'El token de Meta no tiene una longitud válida.',
      'INVALID_REFERENCE',
    )
  }

  const name = tenantSecretName(tenantId)
  await callVaultRpc<string>('dock_vault_upsert_secret', {
    p_name: name,
    p_secret: normalizedToken,
  })
  return name
}

export async function readTenantAccessToken(
  tenant: Tenant,
): Promise<{ token: string | null; source: CredentialSource }> {
  const reference = tenant.credentialKey

  if (reference?.startsWith(VAULT_PREFIX)) {
    if (reference !== tenantSecretName(tenant.id)) {
      throw new CredentialStoreError(
        'La referencia de credencial no pertenece a esta clínica.',
        'INVALID_REFERENCE',
      )
    }
    const token = await callVaultRpc<string | null>('dock_vault_read_secret', {
      p_name: reference,
    })
    return { token: token || null, source: token ? 'supabase-vault' : 'none' }
  }

  if (!reference || reference === PRIMARY_CREDENTIAL_KEY) {
    const token = process.env[PRIMARY_CREDENTIAL_KEY] || null
    return { token, source: token ? 'primary-fallback' : 'none' }
  }

  throw new CredentialStoreError('Referencia de credencial no permitida.', 'INVALID_REFERENCE')
}

export async function hasTenantAccessToken(tenant: Tenant) {
  try {
    return Boolean((await readTenantAccessToken(tenant)).token)
  } catch {
    return false
  }
}
