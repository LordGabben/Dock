'use server'

import config from '@/payload.config'
import { getPayload } from 'payload'

type BudgetItemInput = {
  phase: string
  treatment: string
  tooth: string
  quantity: number
  unitPrice: number
}

export type BudgetInput = {
  patientName: string
  patientCI: string
  issuedAt: string
  validUntil: string
  diagnosis: string
  items: BudgetItemInput[]
  discountPercent: number
  paymentTerms: string
  notes: string
}

export type SaveBudgetResult =
  | { success: true; quotationNumber: string }
  | { success: false; error: string }

const PHASES = new Set(['Diagnóstico', 'Inicial', 'Quirúrgica', 'Rehabilitación', 'Mantenimiento'])
type BudgetPhase = 'Diagnóstico' | 'Inicial' | 'Quirúrgica' | 'Rehabilitación' | 'Mantenimiento'

function cleanText(value: unknown, maxLength: number) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : ''
}

export async function createBudget(input: BudgetInput): Promise<SaveBudgetResult> {
  const patientName = cleanText(input.patientName, 140)
  const patientCI = cleanText(input.patientCI, 60)
  const diagnosis = cleanText(input.diagnosis, 3000)
  const paymentTerms = cleanText(input.paymentTerms, 2000)
  const notes = cleanText(input.notes, 2000)
  const issuedAt = new Date(input.issuedAt)
  const validUntil = new Date(input.validUntil)

  if (!patientName || !diagnosis || !paymentTerms) {
    return { success: false, error: 'Completa el paciente, diagnóstico y las condiciones de pago.' }
  }
  if (Number.isNaN(issuedAt.getTime()) || Number.isNaN(validUntil.getTime()) || validUntil < issuedAt) {
    return { success: false, error: 'Revisa las fechas de emisión y vigencia.' }
  }
  if (!Array.isArray(input.items) || input.items.length < 1 || input.items.length > 30) {
    return { success: false, error: 'El presupuesto debe tener entre 1 y 30 tratamientos.' }
  }

  const items = input.items.map((item) => ({
    phase: (PHASES.has(item.phase) ? item.phase : 'Rehabilitación') as BudgetPhase,
    treatment: cleanText(item.treatment, 240),
    tooth: cleanText(item.tooth, 80),
    quantity: Math.min(99, Math.max(1, Math.round(Number(item.quantity) || 1))),
    unitPrice: Math.min(1_000_000, Math.max(0, Number(item.unitPrice) || 0)),
  }))

  if (items.some((item) => !item.treatment)) {
    return { success: false, error: 'Cada partida debe indicar un tratamiento.' }
  }

  const quotationNumber = `PRES-${issuedAt.getFullYear()}-${Date.now().toString().slice(-6)}`

  try {
    const payload = await getPayload({ config })
    await payload.create({
      collection: 'budgets',
      data: {
        quotationNumber,
        patientName,
        patientCI,
        issuedAt: issuedAt.toISOString(),
        validUntil: validUntil.toISOString(),
        diagnosis,
        items,
        discountPercent: Math.min(100, Math.max(0, Number(input.discountPercent) || 0)),
        paymentTerms,
        notes,
      },
      overrideAccess: false,
    })
    return { success: true, quotationNumber }
  } catch {
    return { success: false, error: 'No se pudo guardar el presupuesto. Inténtalo nuevamente.' }
  }
}
