import type { CollectionConfig, FieldAccess } from 'payload'
import { bootstrapTenantCreateAccess, ownTenantAccess } from '@/lib/tenant-access'

const isPayloadAdminField: FieldAccess = ({ req }) => req.user?.collection === 'admins'

export const Tenants: CollectionConfig = {
  slug: 'tenants',
  labels: {
    singular: 'Clínica',
    plural: 'Clínicas',
  },
  admin: {
    group: 'WhatsApp',
    useAsTitle: 'name',
    defaultColumns: ['name', 'connectionMode', 'connectionStatus', 'whatsappPhoneNumberId'],
  },
  access: {
    create: bootstrapTenantCreateAccess,
    read: ownTenantAccess,
    update: ownTenantAccess,
    delete: ownTenantAccess,
  },
  versions: false,
  fields: [
    {
      name: 'name',
      label: 'Nombre de la clínica',
      type: 'text',
      required: true,
    },
    {
      name: 'connectionMode',
      label: 'Modo de conexión',
      type: 'select',
      required: true,
      defaultValue: 'byoa',
      options: [
        { label: 'Conexión directa BYOA', value: 'byoa' },
        { label: 'Meta Embedded Signup', value: 'embedded' },
      ],
    },
    {
      name: 'connectionStatus',
      label: 'Estado de la conexión',
      type: 'select',
      required: true,
      defaultValue: 'pending',
      options: [
        { label: 'Pendiente', value: 'pending' },
        { label: 'Conectada', value: 'connected' },
        { label: 'Error', value: 'error' },
        { label: 'Desactivada', value: 'disabled' },
      ],
      access: {
        create: isPayloadAdminField,
        update: isPayloadAdminField,
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'whatsappPhoneNumberId',
          label: 'Meta Phone Number ID',
          type: 'text',
          unique: true,
          index: true,
        },
        {
          name: 'whatsappWabaId',
          label: 'WhatsApp Business Account ID',
          type: 'text',
        },
      ],
    },
    {
      name: 'credentialKey',
      label: 'Referencia de credencial segura',
      type: 'text',
      defaultValue: 'WHATSAPP_ACCESS_TOKEN_PRIMARY',
      admin: {
        description:
          'Referencia dock/whatsapp/<tenantId> de Supabase Vault. La clínica principal puede usar el fallback WHATSAPP_ACCESS_TOKEN_PRIMARY.',
      },
      validate: (value: unknown) => {
        if (!value) return true
        return /^(WHATSAPP_ACCESS_TOKEN_PRIMARY|dock\/whatsapp\/[A-Za-z0-9_-]{1,128})$/.test(
          String(value),
        )
          ? true
          : 'Usa una referencia de Supabase Vault válida'
      },
    },
    {
      name: 'agentConfig',
      label: 'Configuración del agente',
      type: 'group',
      fields: [
        {
          name: 'enabled',
          label: 'Agente activo',
          type: 'checkbox',
          defaultValue: true,
        },
        {
          name: 'agentName',
          label: 'Nombre del agente',
          type: 'text',
          defaultValue: 'Asistente Virtual DOCK',
        },
        {
          name: 'systemPrompt',
          label: 'Instrucciones del agente',
          type: 'textarea',
          defaultValue:
            'Responde con información verificada de la clínica, ayuda a consultar horarios y deriva al equipo ante urgencias o cuando el paciente lo solicite.',
        },
        {
          name: 'toolsEnabled',
          label: 'Herramientas de agenda y derivación activas',
          type: 'checkbox',
          defaultValue: true,
        },
      ],
    },
  ],
}
