import type { Access, CollectionConfig, FieldAccess } from 'payload'

const isPayloadAdmin: Access = ({ req }) => req.user?.collection === 'admins'
const isPayloadAdminField: FieldAccess = ({ req }) => req.user?.collection === 'admins'

export const Budgets: CollectionConfig = {
  slug: 'budgets',
  labels: {
    singular: 'Presupuesto',
    plural: 'Presupuestos',
  },
  admin: {
    group: 'Clínica',
    useAsTitle: 'quotationNumber',
    defaultColumns: ['quotationNumber', 'patientName', 'status', 'total', 'createdAt'],
  },
  access: {
    create: () => true,
    read: isPayloadAdmin,
    update: isPayloadAdmin,
    delete: isPayloadAdmin,
  },
  versions: false,
  hooks: {
    beforeChange: [
      ({ data }) => {
        const items = Array.isArray(data.items) ? data.items : []
        const subtotal = items.reduce((sum: number, item: Record<string, unknown>) => {
          const quantity = Number(item.quantity) || 0
          const unitPrice = Number(item.unitPrice) || 0
          return sum + quantity * unitPrice
        }, 0)
        const discount = Math.max(0, Math.min(100, Number(data.discountPercent) || 0))
        data.subtotal = Math.round(subtotal * 100) / 100
        data.discountAmount = Math.round(subtotal * (discount / 100) * 100) / 100
        data.total = Math.round((subtotal - data.discountAmount) * 100) / 100
        data.status = 'draft'
        return data
      },
    ],
  },
  fields: [
    {
      name: 'quotationNumber',
      label: 'N.º de presupuesto',
      type: 'text',
      required: true,
      index: true,
    },
    {
      type: 'row',
      fields: [
        { name: 'patientName', label: 'Paciente', type: 'text', required: true },
        { name: 'patientCI', label: 'Documento de identidad', type: 'text' },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'issuedAt', label: 'Fecha de emisión', type: 'date', required: true },
        { name: 'validUntil', label: 'Válido hasta', type: 'date', required: true },
        {
          name: 'status',
          label: 'Estado',
          type: 'select',
          defaultValue: 'draft',
          options: [
            { label: 'Borrador', value: 'draft' },
            { label: 'Enviado', value: 'sent' },
            { label: 'Aprobado', value: 'approved' },
            { label: 'Rechazado', value: 'rejected' },
          ],
          access: {
            create: isPayloadAdminField,
            update: isPayloadAdminField,
          },
        },
      ],
    },
    {
      name: 'diagnosis',
      label: 'Diagnóstico y plan clínico',
      type: 'textarea',
      required: true,
    },
    {
      name: 'items',
      label: 'Tratamientos',
      type: 'array',
      required: true,
      minRows: 1,
      maxRows: 30,
      fields: [
        {
          name: 'phase',
          label: 'Fase',
          type: 'select',
          required: true,
          options: ['Diagnóstico', 'Inicial', 'Quirúrgica', 'Rehabilitación', 'Mantenimiento'],
        },
        { name: 'treatment', label: 'Tratamiento', type: 'text', required: true },
        { name: 'tooth', label: 'Pieza / zona', type: 'text' },
        { name: 'quantity', label: 'Cantidad', type: 'number', required: true, min: 1, max: 99 },
        { name: 'unitPrice', label: 'Precio unitario (Bs.)', type: 'number', required: true, min: 0 },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'discountPercent', label: 'Descuento (%)', type: 'number', defaultValue: 0, min: 0, max: 100 },
        { name: 'subtotal', label: 'Subtotal (Bs.)', type: 'number', admin: { readOnly: true } },
        { name: 'discountAmount', label: 'Descuento (Bs.)', type: 'number', admin: { readOnly: true } },
        { name: 'total', label: 'Total (Bs.)', type: 'number', admin: { readOnly: true } },
      ],
    },
    { name: 'paymentTerms', label: 'Condiciones de pago', type: 'textarea', required: true },
    { name: 'notes', label: 'Observaciones', type: 'textarea' },
  ],
}
