import type { CollectionConfig, FieldAccess } from 'payload'
import {
  enforceAdminTenant,
  tenantCreateAccess,
  tenantReadUpdateDeleteAccess,
} from '@/lib/tenant-access'

const serverManaged: FieldAccess = ({ req }) => req.user?.collection === 'admins'

export const Conversations: CollectionConfig = {
  slug: 'conversations',
  labels: {
    singular: 'Conversación',
    plural: 'Conversaciones',
  },
  admin: {
    group: 'WhatsApp',
    useAsTitle: 'patientName',
    defaultColumns: ['patientName', 'tenant', 'status', 'unreadCount', 'lastMessageAt'],
  },
  access: {
    create: tenantCreateAccess,
    read: tenantReadUpdateDeleteAccess,
    update: tenantReadUpdateDeleteAccess,
    delete: tenantReadUpdateDeleteAccess,
  },
  hooks: {
    beforeChange: [enforceAdminTenant],
  },
  versions: false,
  fields: [
    {
      name: 'tenant',
      label: 'Clínica',
      type: 'relationship',
      relationTo: 'tenants',
      required: true,
      index: true,
    },
    {
      name: 'patientPhone',
      label: 'Teléfono del paciente',
      type: 'text',
      required: true,
      index: true,
    },
    {
      name: 'patientName',
      label: 'Paciente',
      type: 'text',
      defaultValue: 'Paciente WhatsApp',
    },
    {
      name: 'status',
      label: 'Modo de atención',
      type: 'select',
      required: true,
      defaultValue: 'ai_active',
      options: [
        { label: 'Agente IA activo', value: 'ai_active' },
        { label: 'Atención humana', value: 'human_handoff' },
        { label: 'Cerrada', value: 'closed' },
      ],
    },
    {
      name: 'unreadCount',
      label: 'No leídos',
      type: 'number',
      defaultValue: 0,
      min: 0,
      access: {
        create: serverManaged,
        update: serverManaged,
      },
    },
    {
      name: 'lastMessagePreview',
      label: 'Último mensaje',
      type: 'text',
      access: {
        create: serverManaged,
        update: serverManaged,
      },
    },
    {
      name: 'lastMessageAt',
      label: 'Última actividad',
      type: 'date',
      index: true,
      access: {
        create: serverManaged,
        update: serverManaged,
      },
    },
  ],
}
