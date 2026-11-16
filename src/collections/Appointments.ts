import type { CollectionConfig, FieldAccess } from 'payload'
import {
  enforceAdminTenant,
  tenantCreateAccess,
  tenantReadUpdateDeleteAccess,
} from '@/lib/tenant-access'

const isPayloadAdminField: FieldAccess = ({ req }) => req.user?.collection === 'admins'

export const Appointments: CollectionConfig = {
  slug: 'appointments',
  labels: {
    singular: 'Cita de WhatsApp',
    plural: 'Citas de WhatsApp',
  },
  admin: {
    group: 'WhatsApp',
    useAsTitle: 'patientName',
    defaultColumns: ['patientName', 'date', 'time', 'status', 'tenant'],
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
      type: 'row',
      fields: [
        {
          name: 'patientName',
          label: 'Paciente',
          type: 'text',
          required: true,
        },
        {
          name: 'patientPhone',
          label: 'Teléfono',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'date',
          label: 'Fecha (AAAA-MM-DD)',
          type: 'text',
          required: true,
          index: true,
          validate: (value: unknown) =>
            /^\d{4}-\d{2}-\d{2}$/.test(String(value)) ? true : 'Usa el formato AAAA-MM-DD',
        },
        {
          name: 'time',
          label: 'Hora (HH:mm)',
          type: 'text',
          required: true,
          validate: (value: unknown) =>
            /^([01]\d|2[0-3]):[0-5]\d$/.test(String(value)) ? true : 'Usa el formato HH:mm',
        },
      ],
    },
    {
      name: 'treatmentReason',
      label: 'Motivo',
      type: 'text',
      required: true,
    },
    {
      name: 'status',
      label: 'Estado',
      type: 'select',
      required: true,
      defaultValue: 'pending',
      options: [
        { label: 'Pendiente de confirmación', value: 'pending' },
        { label: 'Confirmada', value: 'confirmed' },
        { label: 'Cancelada', value: 'cancelled' },
      ],
    },
    {
      name: 'createdByAgent',
      label: 'Creada por el agente',
      type: 'checkbox',
      defaultValue: false,
      access: {
        create: isPayloadAdminField,
        update: isPayloadAdminField,
      },
    },
  ],
}
