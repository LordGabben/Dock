import type { Access, CollectionBeforeChangeHook, Where } from 'payload'

type AdminWithTenant = {
  collection?: string
  id?: string
  tenant?: string | { id?: string } | null
}

export function adminTenantId(user: unknown) {
  const admin = user as AdminWithTenant | null
  if (!admin || admin.collection !== 'admins') return null
  if (typeof admin.tenant === 'string') return admin.tenant
  return admin.tenant?.id || null
}

export const isPayloadAdmin: Access = ({ req }) => req.user?.collection === 'admins'

export const tenantReadUpdateDeleteAccess: Access = ({ req }) => {
  const tenantId = adminTenantId(req.user)
  return tenantId ? { tenant: { equals: tenantId } } : false
}

export const tenantCreateAccess: Access = ({ req }) => Boolean(adminTenantId(req.user))

export const ownTenantAccess: Access = ({ req }) => {
  const tenantId = adminTenantId(req.user)
  if (tenantId) {
    const tenantFilter: Where = { id: { equals: tenantId } }
    return tenantFilter
  }
  if (req.user?.collection === 'admins') {
    const ownerFilter: Where = { 'createdBy.value': { equals: req.user.id } }
    return ownerFilter
  }
  return false
}

export const bootstrapTenantCreateAccess: Access = ({ req }) =>
  req.user?.collection === 'admins' && !adminTenantId(req.user)

export const enforceAdminTenant: CollectionBeforeChangeHook = ({ data, req }) => {
  const tenantId = adminTenantId(req.user)
  return tenantId ? { ...data, tenant: tenantId } : data
}
