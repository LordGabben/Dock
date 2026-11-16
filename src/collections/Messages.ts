import type { CollectionConfig, FieldAccess } from 'payload'
import {
  enforceAdminTenant,
  tenantCreateAccess,
  tenantReadUpdateDeleteAccess,
} from '@/lib/tenant-access'

const serverManaged: FieldAccess = ({ req }) => req.user?.collection === 'admins'

export const Messages: CollectionConfig = {
  slug: 'messages',
  labels: {
    singular: 'Mensaje',
    plural: 'Mensajes',
  },
  admin: {
    group: 'WhatsApp',
    useAsTitle: 'content',
    defaultColumns: ['conversation', 'sender', 'deliveryStatus', 'createdAt'],
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
      name: 'conversation',
      label: 'Conversación',
      type: 'relationship',
      relationTo: 'conversations',
      required: true,
      index: true,
    },
    {
      name: 'sender',
      label: 'Remitente',
      type: 'select',
      required: true,
      options: [
        { label: 'Paciente', value: 'patient' },
        { label: 'Agente IA', value: 'ai_agent' },
        { label: 'Doctor / clínica', value: 'doctor' },
      ],
    },
    {
      name: 'content',
      label: 'Contenido',
      type: 'textarea',
      required: true,
    },
    {
      name: 'whatsappMessageId',
      label: 'ID de Meta',
      type: 'text',
      index: true,
      access: {
        create: serverManaged,
        update: serverManaged,
      },
    },
    {
      name: 'deliveryStatus',
      label: 'Entrega',
      type: 'select',
      defaultValue: 'received',
      options: [
        { label: 'Recibido', value: 'received' },
        { label: 'Enviado', value: 'sent' },
        { label: 'Entregado', value: 'delivered' },
        { label: 'Leído', value: 'read' },
        { label: 'Fallido', value: 'failed' },
      ],
      access: {
        create: serverManaged,
        update: serverManaged,
      },
    },
    {
      name: 'toolExecuted',
      label: 'Herramienta ejecutada',
      type: 'text',
      access: {
        create: serverManaged,
        update: serverManaged,
      },
    },
  ],
}
