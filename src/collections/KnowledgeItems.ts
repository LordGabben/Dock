import type { CollectionConfig } from 'payload'
import {
  enforceAdminTenant,
  tenantCreateAccess,
  tenantReadUpdateDeleteAccess,
} from '@/lib/tenant-access'

export const KnowledgeItems: CollectionConfig = {
  slug: 'knowledge-items',
  labels: {
    singular: 'Conocimiento',
    plural: 'Base de conocimientos',
  },
  admin: {
    group: 'WhatsApp',
    useAsTitle: 'title',
    defaultColumns: ['title', 'tenant', 'category', 'active', 'updatedAt'],
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
      name: 'category',
      label: 'Categoría',
      type: 'select',
      required: true,
      defaultValue: 'faq',
      options: [
        { label: 'Precios y aranceles', value: 'pricing' },
        { label: 'Horarios y ubicación', value: 'schedule' },
        { label: 'Preguntas frecuentes', value: 'faq' },
        { label: 'Protocolos postoperatorios', value: 'protocols' },
        { label: 'Servicios y tratamientos', value: 'services' },
      ],
    },
    {
      name: 'title',
      label: 'Título',
      type: 'text',
      required: true,
    },
    {
      name: 'content',
      label: 'Contenido verificado',
      type: 'textarea',
      required: true,
    },
    {
      name: 'keywords',
      label: 'Palabras clave',
      type: 'array',
      fields: [
        {
          name: 'keyword',
          label: 'Palabra clave',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'active',
      label: 'Disponible para el agente',
      type: 'checkbox',
      defaultValue: true,
    },
  ],
}
