'use client'

import { useMemo, useState, useTransition } from 'react'
import { createBudget } from '@/app/(frontend)/actions/budgets'

type BudgetItem = {
  id: number
  phase: string
  treatment: string
  tooth: string
  quantity: number
  unitPrice: number
}

const money = (value: number) =>
  new Intl.NumberFormat('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)

const today = new Date().toISOString().slice(0, 10)
const defaultValidity = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)

export default function Budget({ patientName, patientCI }: { patientName: string; patientCI: string }) {
  const [issuedAt, setIssuedAt] = useState(today)
  const [validUntil, setValidUntil] = useState(defaultValidity)
  const [diagnosis, setDiagnosis] = useState('Rehabilitación oral por pérdida de piezas posteriores y compromiso funcional. Se propone recuperación por fases, sujeta a evaluación radiográfica y respuesta biológica.')
  const [discountPercent, setDiscountPercent] = useState(0)
  const [paymentTerms, setPaymentTerms] = useState('40% al aprobar el plan, 30% al iniciar la fase protésica y 30% contra entrega. Los pagos se realizan en bolivianos.')
  const [notes, setNotes] = useState('El presupuesto no incluye procedimientos adicionales que puedan identificarse durante el tratamiento. Vigencia: 15 días calendario.')
  const [items, setItems] = useState<BudgetItem[]>([
    { id: 1, phase: 'Diagnóstico', treatment: 'Evaluación integral y planificación digital', tooth: 'Boca completa', quantity: 1, unitPrice: 350 },
    { id: 2, phase: 'Quirúrgica', treatment: 'Implante dental de titanio', tooth: 'Pieza 36', quantity: 1, unitPrice: 5200 },
    { id: 3, phase: 'Rehabilitación', treatment: 'Corona de zirconio sobre implante', tooth: 'Pieza 36', quantity: 1, unitPrice: 2800 },
  ])
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [savedNumber, setSavedNumber] = useState('')
  const [isPending, startTransition] = useTransition()

  const subtotal = useMemo(() => items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0), [items])
  const discountAmount = subtotal * (discountPercent / 100)
  const total = subtotal - discountAmount

  const updateItem = (id: number, field: keyof BudgetItem, value: string | number) => {
    setItems((current) => current.map((item) => item.id === id ? { ...item, [field]: value } : item))
  }

  const addItem = () => {
    setItems((current) => [
      ...current,
      { id: Date.now(), phase: 'Rehabilitación', treatment: '', tooth: '', quantity: 1, unitPrice: 0 },
    ])
  }

  const save = () => {
    setMessage(null)
    startTransition(async () => {
      const result = await createBudget({
        patientName,
        patientCI,
        issuedAt,
        validUntil,
        diagnosis,
        items: items.map(({ id: _id, ...item }) => item),
        discountPercent,
        paymentTerms,
        notes,
      })
      if (result.success) {
        setSavedNumber(result.quotationNumber)
        setMessage({ type: 'success', text: `Presupuesto ${result.quotationNumber} guardado correctamente.` })
      } else {
        setMessage({ type: 'error', text: result.error })
      }
    })
  }

  const downloadPdf = async () => {
    const { jsPDF } = await import('jspdf')
    const doc = new jsPDF({ unit: 'mm', format: 'a4' })
    const number = savedNumber || 'BORRADOR'
    doc.setFillColor(15, 42, 70)
    doc.rect(0, 0, 210, 30, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(20)
    doc.text('DOCK', 16, 18)
    doc.setFontSize(9)
    doc.text('PRESUPUESTO DE TRATAMIENTO', 194, 12, { align: 'right' })
    doc.text(number, 194, 19, { align: 'right' })
    doc.setTextColor(30, 41, 59)
    doc.setFontSize(10)
    doc.text(`Paciente: ${patientName}`, 16, 42)
    doc.text(`C.I.: ${patientCI || '—'}`, 16, 48)
    doc.text(`Emisión: ${issuedAt}  ·  Válido hasta: ${validUntil}`, 194, 42, { align: 'right' })
    doc.setFont('helvetica', 'bold')
    doc.text('Diagnóstico y plan clínico', 16, 60)
    doc.setFont('helvetica', 'normal')
    const diagnosisLines = doc.splitTextToSize(diagnosis, 178)
    doc.text(diagnosisLines, 16, 67)
    let y = 67 + diagnosisLines.length * 5 + 8
    doc.setFillColor(241, 245, 249)
    doc.rect(16, y, 178, 8, 'F')
    doc.setFont('helvetica', 'bold')
    doc.text('Tratamiento', 18, y + 5.5)
    doc.text('Pieza', 116, y + 5.5)
    doc.text('Cant.', 145, y + 5.5)
    doc.text('Importe', 191, y + 5.5, { align: 'right' })
    y += 12
    doc.setFont('helvetica', 'normal')
    items.forEach((item) => {
      if (y > 260) {
        doc.addPage()
        y = 20
      }
      const treatment = doc.splitTextToSize(`${item.phase} · ${item.treatment || 'Sin descripción'}`, 92)
      doc.text(treatment, 18, y)
      doc.text(item.tooth || '—', 116, y)
      doc.text(String(item.quantity), 148, y)
      doc.text(`Bs. ${money(item.quantity * item.unitPrice)}`, 191, y, { align: 'right' })
      y += Math.max(8, treatment.length * 5)
      doc.setDrawColor(226, 232, 240)
      doc.line(16, y - 3, 194, y - 3)
    })
    y += 3
    doc.setFont('helvetica', 'bold')
    doc.text('Subtotal', 155, y)
    doc.text(`Bs. ${money(subtotal)}`, 191, y, { align: 'right' })
    y += 7
    doc.text(`Descuento (${discountPercent}%)`, 155, y)
    doc.text(`- Bs. ${money(discountAmount)}`, 191, y, { align: 'right' })
    y += 9
    doc.setFontSize(14)
    doc.text('TOTAL', 155, y)
    doc.text(`Bs. ${money(total)}`, 191, y, { align: 'right' })
    y += 13
    doc.setFontSize(9)
    doc.text('Condiciones de pago', 16, y)
    doc.setFont('helvetica', 'normal')
    doc.text(doc.splitTextToSize(paymentTerms, 178), 16, y + 6)
    doc.save(`Presupuesto-${patientName.replace(/\s+/g, '-')}-${number}.pdf`)
  }

  return (
    <div className="budget-print-root mx-auto w-full min-w-0 max-w-6xl space-y-4 pb-8">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900">Presupuesto de tratamiento</h2>
            <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-700">
              {savedNumber ? 'Guardado' : 'Borrador'}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">Plan económico detallado para revisión y aceptación del paciente.</p>
        </div>
        <div className="budget-actions flex min-w-0 flex-wrap items-center justify-end gap-2">
          <button onClick={() => window.print()} className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">
            <span aria-hidden="true">⌁</span> Imprimir
          </button>
          <button onClick={downloadPdf} className="flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-100">
            <span aria-hidden="true">↓</span> Descargar PDF
          </button>
          <button onClick={save} disabled={isPending} className="rounded-lg bg-[#1A4F8A] px-4 py-2 text-xs font-semibold text-white hover:bg-[#143f70] disabled:opacity-60">
            {isPending ? 'Guardando…' : 'Guardar presupuesto'}
          </button>
        </div>
      </div>

      {message && (
        <div className={`rounded-lg border px-4 py-3 text-sm font-medium ${message.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-red-200 bg-red-50 text-red-700'}`}>
          {message.text}
        </div>
      )}

      <div className="grid min-w-0 gap-4">
        <div className="min-w-0 space-y-4">
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-700">Clínica Dental DOCK</p>
                <h3 className="mt-1 text-lg font-bold text-slate-900">{patientName}</h3>
                <p className="text-xs text-slate-500">C.I. {patientCI || '—'}</p>
              </div>
              <div className="grid min-w-0 grid-cols-2 gap-2">
                <label className="min-w-0 text-[10px] font-bold uppercase tracking-wide text-slate-500">Emisión<input type="date" value={issuedAt} onChange={(event) => setIssuedAt(event.target.value)} className="mt-1 block w-full min-w-0 rounded-md border border-slate-200 px-2 py-1.5 text-xs text-slate-700" /></label>
                <label className="min-w-0 text-[10px] font-bold uppercase tracking-wide text-slate-500">Válido hasta<input type="date" value={validUntil} onChange={(event) => setValidUntil(event.target.value)} className="mt-1 block w-full min-w-0 rounded-md border border-slate-200 px-2 py-1.5 text-xs text-slate-700" /></label>
              </div>
            </div>
            <label className="text-xs font-semibold text-slate-700">Diagnóstico y plan clínico
              <textarea value={diagnosis} onChange={(event) => setDiagnosis(event.target.value)} rows={3} className="mt-2 w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm leading-relaxed text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
            </label>
          </section>

          <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-3.5">
              <div><h3 className="text-sm font-bold text-slate-900">Tratamientos y procedimientos</h3><p className="mt-0.5 text-xs text-slate-400">{items.length} partidas en el plan</p></div>
              <button onClick={addItem} className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100">+ Añadir tratamiento</button>
            </div>
            <div className="divide-y divide-slate-100">
              {items.map((item, index) => (
                <div key={item.id} className="min-w-0 space-y-3 p-4">
                  <div className="flex min-w-0 flex-wrap items-end gap-3">
                    <label className="min-w-0 flex-[1_1_140px] text-[10px] font-bold uppercase tracking-wide text-slate-500">
                      Fase
                      <select value={item.phase} onChange={(event) => updateItem(item.id, 'phase', event.target.value)} className="mt-1 w-full rounded-md border border-slate-200 bg-white px-2 py-2 text-xs text-slate-600">
                        {['Diagnóstico', 'Inicial', 'Quirúrgica', 'Rehabilitación', 'Mantenimiento'].map((phase) => <option key={phase}>{phase}</option>)}
                      </select>
                    </label>
                    <label className="min-w-0 flex-[3_1_260px] text-[10px] font-bold uppercase tracking-wide text-slate-500">
                      Tratamiento {index + 1}
                      <input value={item.treatment} onChange={(event) => updateItem(item.id, 'treatment', event.target.value)} placeholder="Descripción del procedimiento" className="mt-1 w-full rounded-md border border-slate-200 px-2 py-2 text-xs text-slate-700" />
                    </label>
                    <button onClick={() => setItems((current) => current.filter((row) => row.id !== item.id))} disabled={items.length === 1} title="Eliminar partida" aria-label={`Eliminar tratamiento ${index + 1}`} className="mb-0.5 h-8 w-8 flex-shrink-0 rounded-md border border-slate-200 text-slate-400 hover:border-red-200 hover:bg-red-50 hover:text-red-500 disabled:opacity-20">×</button>
                  </div>
                  <div
                    className="grid min-w-0 gap-3"
                    style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(120px, 100%), 1fr))' }}
                  >
                    <label className="min-w-0 text-[10px] font-bold uppercase tracking-wide text-slate-500">
                      Pieza / zona
                      <input value={item.tooth} onChange={(event) => updateItem(item.id, 'tooth', event.target.value)} placeholder="Ej. pieza 36" className="mt-1 w-full min-w-0 rounded-md border border-slate-200 px-2 py-2 text-xs text-slate-700" />
                    </label>
                    <label className="min-w-0 text-[10px] font-bold uppercase tracking-wide text-slate-500">
                      Cantidad
                      <input type="number" min="1" value={item.quantity} onChange={(event) => updateItem(item.id, 'quantity', Number(event.target.value))} className="mt-1 w-full min-w-0 rounded-md border border-slate-200 px-2 py-2 text-right text-xs text-slate-700" />
                    </label>
                    <label className="min-w-0 text-[10px] font-bold uppercase tracking-wide text-slate-500">
                      Precio unitario
                      <span className="relative mt-1 block">
                        <span className="pointer-events-none absolute left-2 top-2 text-xs text-slate-400">Bs.</span>
                        <input type="number" min="0" value={item.unitPrice} onChange={(event) => updateItem(item.id, 'unitPrice', Number(event.target.value))} className="w-full min-w-0 rounded-md border border-slate-200 py-2 pl-8 pr-2 text-right text-xs text-slate-700" />
                      </span>
                    </label>
                    <div className="min-w-0">
                      <div className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Importe</div>
                      <div className="mt-1 flex h-[34px] items-center justify-end rounded-md bg-slate-50 px-2 font-mono text-xs font-bold text-slate-800">
                        Bs. {money(item.quantity * item.unitPrice)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section
            className="grid min-w-0 gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
            style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(260px, 100%), 1fr))' }}
          >
            <label className="text-xs font-semibold text-slate-700">Condiciones de pago<textarea value={paymentTerms} onChange={(event) => setPaymentTerms(event.target.value)} rows={4} className="mt-2 w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs leading-relaxed text-slate-700" /></label>
            <label className="text-xs font-semibold text-slate-700">Observaciones para el paciente<textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={4} className="mt-2 w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs leading-relaxed text-slate-700" /></label>
          </section>
        </div>

        <aside className="min-w-0 space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900">Resumen económico</h3>
            <div className="mt-4 space-y-3 border-b border-slate-100 pb-4 text-sm">
              <div className="flex justify-between text-slate-500"><span>Subtotal</span><strong className="font-mono text-slate-800">Bs. {money(subtotal)}</strong></div>
              <label className="flex items-center justify-between text-slate-500"><span>Descuento</span><span className="flex items-center gap-1"><input type="number" min="0" max="100" value={discountPercent} onChange={(event) => setDiscountPercent(Math.min(100, Math.max(0, Number(event.target.value))))} className="w-14 rounded-md border border-slate-200 px-2 py-1 text-right text-xs" />%</span></label>
              <div className="flex justify-between text-emerald-700"><span>Ahorro</span><strong className="font-mono">− Bs. {money(discountAmount)}</strong></div>
            </div>
            <div className="mt-4 rounded-xl bg-[#0F2A46] p-4 text-white">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-blue-200">Total del plan</p>
              <p className="mt-1 font-mono text-2xl font-bold">Bs. {money(total)}</p>
              <p className="mt-1 text-[10px] text-blue-200">Importe final sujeto a vigencia y condiciones.</p>
            </div>
            <div className="mt-4 rounded-lg border border-blue-100 bg-blue-50 p-3">
              <p className="text-xs font-semibold text-blue-800">Documento profesional</p>
              <p className="mt-1 text-[11px] leading-relaxed text-blue-600">Incluye datos del paciente, desglose por fases, vigencia, condiciones y espacio de aceptación.</p>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-4 pt-8 text-center text-[10px] text-slate-400">
              <div className="border-t border-slate-300 pt-2">Firma del profesional</div>
              <div className="border-t border-slate-300 pt-2">Aceptación del paciente</div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
