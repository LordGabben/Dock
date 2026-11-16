import type { Access, CollectionConfig } from 'payload'
import type { FieldAccess } from 'payload'
import { adminTenantId } from '@/lib/tenant-access'

const isPayloadAdmin: Access = ({ req }) => req.user?.collection === 'admins'
const canAssignOwnTenantOnce: FieldAccess = ({ req, id }) =>
  req.user?.collection === 'admins' &&
  req.user.id === id &&
  !adminTenantId(req.user)

export const Admins: CollectionConfig = {
  slug: 'admins',
  access: {
    create: () => false,
    delete: isPayloadAdmin,
    read: isPayloadAdmin,
    update: isPayloadAdmin,
  },
  admin: {
    useAsTitle: 'email',
  },
  auth: true,
  fields: [
    // Email added by default
    {
      name: 'tenant',
      label: 'Clínica asignada',
      type: 'relationship',
      relationTo: 'tenants',
      index: true,
      access: {
        update: canAssignOwnTenantOnce,
      },
      admin: {
        description: 'Aísla todos los datos operativos de este administrador por clínica.',
      },
    },
  ],
  versions: false,
}
