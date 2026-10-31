import { useEffect, useMemo, useState } from 'react'

type StockStatus = 'optimo' | 'comprar' | 'agotado'

interface InventoryItem {
  id: number
  name: string
  category: string
  unit: string
  stock: number
  minIdeal: number
  maxIdeal: number
  costUnit: number
  expiryDate?: string
  supplier: string
}

interface Supplier {
  name: string
  email: string
  categories: string[]
  deliveryDays: number
  rating: number
  preferred?: boolean
}

interface PurchaseRequest {
  id: string
  type: 'pedido' | 'cotizacion'
  reference: string
  suppliers: string[]
  itemCount: number
  total?: number
  createdAt: string
  status: 'Preparado para enviar'
}

type PurchaseMode = 'pedido' | 'cotizacion'

const PURCHASES_STORAGE_KEY = 'dock-inventory-purchases-v1'

function dateFromNow(days: number) {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date.toISOString().slice(0, 10)
}

const INITIAL_ITEMS: InventoryItem[] = [
  {
    id: 1,
    name: 'Anestesia Articaína 4%',
    category: 'Anestésicos',
    unit: 'Carpules',
    stock: 8,
    minIdeal: 30,
    maxIdeal: 100,
    costUnit: 12.5,
    expiryDate: dateFromNow(42),
    supplier: 'Dental Depot',
  },
  {
    id: 2,
    name: 'Guantes de Látex Talla M',
    category: 'Protección',
    unit: 'Cajas',
    stock: 3,
    minIdeal: 10,
    maxIdeal: 30,
    costUnit: 45.0,
    supplier: 'MedSupply',
  },
  {
    id: 3,
    name: 'Resina Compuesta A2 (Filtek)',
    category: 'Materiales',
    unit: 'Jeringas',
    stock: 22,
    minIdeal: 10,
    maxIdeal: 40,
    costUnit: 85.0,
    expiryDate: dateFromNow(64),
    supplier: '3M ESPE',
  },
  {
    id: 4,
    name: 'Ácido Ortofosfórico 37%',
    category: 'Materiales',
    unit: 'Frascos',
    stock: 0,
    minIdeal: 5,
    maxIdeal: 15,
    costUnit: 28.0,
    expiryDate: dateFromNow(180),
    supplier: 'Dental Depot',
  },
  {
    id: 5,
    name: 'Mascarillas N95',
    category: 'Protección',
    unit: 'Cajas',
    stock: 15,
    minIdeal: 8,
    maxIdeal: 25,
    costUnit: 120.0,
    supplier: 'MedSupply',
  },
  {
    id: 6,
    name: 'Hilo de Sutura Vicryl 3-0',
    category: 'Cirugía',
    unit: 'Cajas',
    stock: 4,
    minIdeal: 6,
    maxIdeal: 20,
    costUnit: 95.0,
    expiryDate: dateFromNow(78),
    supplier: 'Ethicon',
  },
  {
    id: 7,
    name: 'Cemento de Ionómero Vítreo',
    category: 'Materiales',
    unit: 'Unidades',
    stock: 12,
    minIdeal: 5,
    maxIdeal: 20,
    costUnit: 220.0,
    expiryDate: dateFromNow(240),
    supplier: 'GC Corp',
  },
  {
    id: 8,
    name: 'Papel de Articular 40µ',
    category: 'Diagnóstico',
    unit: 'Paquetes',
    stock: 7,
    minIdeal: 5,
    maxIdeal: 15,
    costUnit: 18.5,
    supplier: 'Bausch',
  },
  {
    id: 9,
    name: 'Limas K-File #15-40',
    category: 'Endodoncia',
    unit: 'Cajas',
    stock: 2,
    minIdeal: 8,
    maxIdeal: 20,
    costUnit: 145.0,
    supplier: 'VDW',
  },
  {
    id: 10,
    name: 'Sellador de Canales AH Plus',
    category: 'Endodoncia',
    unit: 'Kits',
    stock: 5,
    minIdeal: 4,
    maxIdeal: 12,
    costUnit: 280.0,
    expiryDate: dateFromNow(150),
    supplier: 'Dentsply',
  },
]

const SUPPLIERS: Supplier[] = [
  {
    name: 'Dental Depot',
    email: 'pedidos@dentaldepot.example',
    categories: ['Anestésicos', 'Materiales', 'Diagnóstico'],
    deliveryDays: 1,
    rating: 4.9,
    preferred: true,
  },
  {
    name: 'MedSupply',
    email: 'ventas@medsupply.example',
    categories: ['Protección', 'Cirugía'],
    deliveryDays: 1,
    rating: 4.8,
    preferred: true,
  },
  {
    name: 'OdontoMarket',
    email: 'cotizaciones@odontomarket.example',
    categories: ['Anestésicos', 'Materiales', 'Endodoncia', 'Diagnóstico'],
    deliveryDays: 2,
    rating: 4.7,
  },
  {
    name: 'DentImport',
    email: 'comercial@dentimport.example',
    categories: ['Materiales', 'Cirugía', 'Endodoncia'],
    deliveryDays: 3,
    rating: 4.6,
  },
  {
    name: '3M ESPE',
    email: 'dental@3mespe.example',
    categories: ['Materiales'],
    deliveryDays: 3,
    rating: 4.9,
  },
  {
    name: 'Ethicon',
    email: 'pedidos@ethicon.example',
    categories: ['Cirugía'],
    deliveryDays: 4,
    rating: 4.8,
  },
]

const CATEGORIES = [
  'Todas',
  'Anestésicos',
  'Protección',
  'Materiales',
  'Cirugía',
  'Endodoncia',
  'Diagnóstico',
]

function getStatus(item: InventoryItem): StockStatus {
  if (item.stock === 0) return 'agotado'
  if (item.stock < item.minIdeal) return 'comprar'
  return 'optimo'
}

function isExpiring(item: InventoryItem) {
  if (!item.expiryDate) return false
  const days = (new Date(item.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  return days >= 0 && days <= 90
}

const STATUS_CFG: Record<
  StockStatus,
  { label: string; color: string; bg: string; border: string }
> = {
  optimo: { label: 'Óptimo', color: '#15803D', bg: '#DCFCE7', border: '#86EFAC' },
  comprar: { label: 'Comprar pronto', color: '#92400E', bg: '#FEF3C7', border: '#FCD34D' },
  agotado: { label: 'Agotado', color: '#B91C1C', bg: '#FEE2E2', border: '#FCA5A5' },
}

const catColors: Record<string, string> = {
  Anestésicos: '#EFF6FF',
  Protección: '#F0FDF4',
  Materiales: '#F5F3FF',
  Cirugía: '#FFF7ED',
  Endodoncia: '#FEF2F2',
  Diagnóstico: '#ECFEFF',
}

export default function InventoryModule() {
  const [items, setItems] = useState<InventoryItem[]>(INITIAL_ITEMS)
  const [catFilter, setCatFilter] = useState('Todas')
  const [statusFilter, setStatusFilter] = useState<StockStatus | 'all'>('all')
  const [expiryOnly, setExpiryOnly] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [search, setSearch] = useState('')
  const [purchaseMode, setPurchaseMode] = useState<PurchaseMode | null>(null)
  const [selectedItemIds, setSelectedItemIds] = useState<number[]>([])
  const [selectedSuppliers, setSelectedSuppliers] = useState<string[]>([])
  const [quantities, setQuantities] = useState<Record<number, number>>({})
  const [notes, setNotes] = useState('')
  const [purchaseRequests, setPurchaseRequests] = useState<PurchaseRequest[]>([])
  const [purchasesReady, setPurchasesReady] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem(PURCHASES_STORAGE_KEY)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed)) setPurchaseRequests(parsed)
      } catch {
        localStorage.removeItem(PURCHASES_STORAGE_KEY)
      }
    }
    setPurchasesReady(true)
  }, [])

  useEffect(() => {
    if (purchasesReady) {
      localStorage.setItem(PURCHASES_STORAGE_KEY, JSON.stringify(purchaseRequests))
    }
  }, [purchaseRequests, purchasesReady])

  const updateStock = (id: number, delta: number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, stock: Math.max(0, item.stock + delta) } : item,
      ),
    )
  }

  const setStockDirect = (id: number, val: string) => {
    const n = parseInt(val)
    if (!isNaN(n) && n >= 0) {
      setItems((prev) => prev.map((item) => (item.id === id ? { ...item, stock: n } : item)))
    }
  }

  const filtered = items.filter((item) => {
    const statusOk = statusFilter === 'all' || getStatus(item) === statusFilter
    const catOk = catFilter === 'Todas' || item.category === catFilter
    const expiryOk = !expiryOnly || isExpiring(item)
    const searchOk =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.category.toLowerCase().includes(search.toLowerCase())
    return statusOk && catOk && expiryOk && searchOk
  })

  const lowStock = items.filter((i) => getStatus(i) === 'comprar').length
  const outStock = items.filter((i) => getStatus(i) === 'agotado').length
  const totalVal = items.reduce((s, i) => s + i.stock * i.costUnit, 0)
  const expiringItems = items.filter(isExpiring)
  const expiring = expiringItems.length
  const criticalItems = items.filter((i) => getStatus(i) !== 'optimo')

  const selectedItems = useMemo(
    () => items.filter((item) => selectedItemIds.includes(item.id)),
    [items, selectedItemIds],
  )

  const eligibleSuppliers = useMemo(() => {
    const categories = new Set(selectedItems.map((item) => item.category))
    return SUPPLIERS.filter((supplier) =>
      supplier.categories.some((category) => categories.has(category)),
    )
  }, [selectedItems])

  const estimatedTotal = selectedItems.reduce(
    (sum, item) => sum + (quantities[item.id] ?? 0) * item.costUnit,
    0,
  )
  const procurementCandidates = purchaseMode === 'pedido' ? criticalItems : expiringItems

  const openPurchaseFlow = (mode: PurchaseMode, itemIds?: number[]) => {
    const candidates = itemIds
      ? items.filter((item) => itemIds.includes(item.id))
      : mode === 'pedido'
        ? criticalItems
        : expiringItems
    const ids = candidates.map((item) => item.id)
    const nextQuantities = Object.fromEntries(
      candidates.map((item) => [
        item.id,
        mode === 'pedido' ? Math.max(item.maxIdeal - item.stock, 1) : Math.max(item.minIdeal, 1),
      ]),
    )
    const usualSuppliers = Array.from(new Set(candidates.map((item) => item.supplier))).filter(
      (name) => SUPPLIERS.some((supplier) => supplier.name === name),
    )
    const quoteSuppliers = SUPPLIERS.filter((supplier) =>
      supplier.categories.some((category) => candidates.some((item) => item.category === category)),
    )
      .slice(0, 3)
      .map((supplier) => supplier.name)

    setPurchaseMode(mode)
    setSelectedItemIds(ids)
    setQuantities(nextQuantities)
    setSelectedSuppliers(mode === 'pedido' ? usualSuppliers.slice(0, 1) : quoteSuppliers)
    setNotes('')
  }

  const closePurchaseFlow = () => {
    setPurchaseMode(null)
    setSelectedItemIds([])
    setSelectedSuppliers([])
    setNotes('')
  }

  const togglePurchaseItem = (item: InventoryItem) => {
    setSelectedItemIds((current) => {
      if (current.includes(item.id)) return current.filter((id) => id !== item.id)
      setQuantities((previous) => ({
        ...previous,
        [item.id]:
          purchaseMode === 'pedido'
            ? Math.max(item.maxIdeal - item.stock, 1)
            : Math.max(item.minIdeal, 1),
      }))
      return [...current, item.id]
    })
  }

  const preparePurchaseEmail = () => {
    if (!purchaseMode || selectedItems.length === 0 || selectedSuppliers.length === 0) return

    const selectedSupplierRecords = SUPPLIERS.filter((supplier) =>
      selectedSuppliers.includes(supplier.name),
    )
    const reference = `${purchaseMode === 'pedido' ? 'OC' : 'SC'}-${new Date().getFullYear()}-${String(purchaseRequests.length + 1).padStart(3, '0')}`
    const subject =
      purchaseMode === 'pedido'
        ? `${reference} · Pedido urgente Clínica Dental DOCK`
        : `${reference} · Solicitud de cotización de insumos odontológicos`
    const itemLines = selectedItems.map(
      (item) =>
        `- ${item.name}: ${quantities[item.id] ?? 0} ${item.unit} (stock actual: ${item.stock})`,
    )
    const body = [
      'Estimado equipo comercial:',
      '',
      purchaseMode === 'pedido'
        ? 'Solicitamos disponibilidad y despacho de los siguientes insumos:'
        : 'Agradeceremos una proforma con precio, disponibilidad, fecha de vencimiento y plazo de entrega para:',
      '',
      ...itemLines,
      '',
      notes ? `Observaciones: ${notes}` : '',
      '',
      `Referencia: ${reference}`,
      'Clínica Dental DOCK',
      'La Paz, Bolivia',
    ]
      .filter(Boolean)
      .join('\n')

    setPurchaseRequests((current) => [
      {
        id: crypto.randomUUID(),
        type: purchaseMode,
        reference,
        suppliers: selectedSuppliers,
        itemCount: selectedItems.length,
        total: purchaseMode === 'pedido' ? estimatedTotal : undefined,
        createdAt: new Date().toISOString(),
        status: 'Preparado para enviar',
      },
      ...current,
    ])

    const recipients = selectedSupplierRecords.map((supplier) => supplier.email).join(',')
    const recipientField =
      purchaseMode === 'cotizacion' ? `?bcc=${encodeURIComponent(recipients)}&` : `${recipients}?`
    window.location.href = `mailto:${recipientField}subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    closePurchaseFlow()
  }

  return (
    <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: '#E2E8F0' }}>
      {/* Header */}
      <div
        className="px-5 py-4 border-b flex items-center justify-between"
        style={{ borderColor: '#EEF2F7', background: '#F8FAFD' }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: '#EFF6FF' }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#1A4F8A"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-slate-800 text-sm">Control de Inventario Clínico</h3>
            <p className="text-xs text-slate-400">
              {items.length} insumos · Actualización en tiempo real
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-xl transition-all hover:opacity-90"
          style={{ background: '#1A4F8A', boxShadow: '0 4px 12px rgba(26,79,138,0.3)' }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Añadir Insumo
        </button>
      </div>

      {/* Alert metric cards */}
      <div className="grid grid-cols-3 gap-4 px-5 py-4 border-b" style={{ borderColor: '#EEF2F7' }}>
        {/* Card 1 — Low stock */}
        <div
          className="px-4 py-3.5 rounded-xl border-2 transition-all hover:shadow-sm"
          style={{
            borderColor: statusFilter === 'comprar' ? '#FCA5A5' : '#FEE2E2',
            background: '#FFF5F5',
          }}
        >
          <button
            onClick={() => {
              setExpiryOnly(false)
              setStatusFilter(statusFilter === 'comprar' ? 'all' : 'comprar')
            }}
            className="w-full flex items-center gap-4 text-left"
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: '#FEE2E2' }}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#EF4444"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
            <div>
              <div className="text-2xl font-bold font-mono" style={{ color: '#B91C1C' }}>
                {lowStock + outStock}
              </div>
              <div className="text-xs font-semibold text-red-600">Artículos con stock bajo</div>
              <div className="text-xs text-slate-400 mt-0.5">
                {outStock} agotados · {lowStock} bajos
              </div>
            </div>
          </button>
          <button
            onClick={() => openPurchaseFlow('pedido')}
            disabled={criticalItems.length === 0}
            className="w-full mt-3 py-2 rounded-lg text-xs font-bold text-white bg-red-600 hover:bg-red-700 disabled:opacity-40 transition-colors flex items-center justify-center gap-1.5"
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.7 13.4A2 2 0 0 0 9.7 16h9.7a2 2 0 0 0 2-1.6L23 6H6" />
            </svg>
            Hacer pedido
          </button>
        </div>

        {/* Card 2 — Value */}
        <div
          className="flex items-center gap-4 px-4 py-3.5 rounded-xl border"
          style={{ borderColor: '#DBEAFE', background: '#EFF6FF' }}
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: '#DBEAFE' }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#1D4ED8"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
          <div>
            <div className="text-2xl font-bold font-mono" style={{ color: '#1D4ED8' }}>
              Bs. {totalVal.toLocaleString('es-BO', { maximumFractionDigits: 0 })}
            </div>
            <div className="text-xs font-semibold text-blue-700">Valor del Inventario</div>
            <div className="text-xs text-slate-400 mt-0.5">{items.length} referencias activas</div>
          </div>
        </div>

        {/* Card 3 — Expiring */}
        <div
          className="px-4 py-3.5 rounded-xl border transition-all hover:shadow-sm"
          style={{ borderColor: expiryOnly ? '#F59E0B' : '#FDE68A', background: '#FFFBEB' }}
        >
          <button
            onClick={() => {
              setStatusFilter('all')
              setExpiryOnly((current) => !current)
            }}
            className="w-full flex items-center gap-4 text-left"
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: '#FEF3C7' }}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#D97706"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <div>
              <div className="text-2xl font-bold font-mono" style={{ color: '#92400E' }}>
                {expiring}
              </div>
              <div className="text-xs font-semibold text-amber-700">Próximos a vencer</div>
              <div className="text-xs text-slate-400 mt-0.5">En los próximos 90 días</div>
            </div>
          </button>
          <button
            onClick={() => openPurchaseFlow('cotizacion')}
            disabled={expiringItems.length === 0}
            className="w-full mt-3 py-2 rounded-lg text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 disabled:opacity-40 transition-colors flex items-center justify-center gap-1.5"
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <path d="M14 2v6h6M8 13h8M8 17h5" />
            </svg>
            Solicitar cotizaciones
          </button>
        </div>
      </div>

      {/* Filters row */}
      <div
        className="flex items-center gap-3 px-5 py-3 border-b"
        style={{ borderColor: '#F1F5F9' }}
      >
        {/* Search */}
        <div className="relative flex-shrink-0">
          <svg
            className="absolute left-2.5 top-2"
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#94A3B8"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar insumo..."
            className="pl-8 pr-3 py-1.5 text-xs rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
            style={{ borderColor: '#E2E8F0', background: '#F8FAFC', width: 180 }}
          />
        </div>

        {/* Category pills */}
        <div className="flex gap-1 overflow-x-auto">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCatFilter(cat)}
              className="flex-shrink-0 px-3 py-1 text-xs font-semibold rounded-full transition-all"
              style={{
                background: catFilter === cat ? '#1A4F8A' : '#F1F5F9',
                color: catFilter === cat ? '#FFFFFF' : '#64748B',
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-2">
          {/* Status filter */}
          <div
            className="flex rounded-lg overflow-hidden border text-xs"
            style={{ borderColor: '#E2E8F0' }}
          >
            {[
              { id: 'all' as const, label: 'Todos' },
              { id: 'optimo' as const, label: '● Óptimo' },
              { id: 'comprar' as const, label: '● Comprar' },
              { id: 'agotado' as const, label: '● Agotado' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => {
                  setExpiryOnly(false)
                  setStatusFilter(f.id)
                }}
                className="px-3 py-1.5 font-semibold transition-all"
                style={{
                  background: statusFilter === f.id ? '#0C1E38' : '#FFFFFF',
                  color: statusFilter === f.id ? '#FFFFFF' : '#64748B',
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto overflow-y-auto" style={{ maxHeight: 380 }}>
        <table className="w-full text-sm">
          <thead className="sticky top-0 z-10">
            <tr style={{ background: '#F8FAFD' }}>
              {['Insumo', 'Categoría', 'Stock Actual', 'Mínimo Ideal', 'Estado', 'Acciones'].map(
                (h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide border-b"
                    style={{ color: '#64748B', borderColor: '#EEF2F7' }}
                  >
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => {
              const status = getStatus(item)
              const cfg = STATUS_CFG[status]
              const pct = Math.min((item.stock / item.maxIdeal) * 100, 100)
              const catBg = catColors[item.category] ?? '#F8FAFC'
              return (
                <tr
                  key={item.id}
                  className="border-t hover:bg-slate-50 transition-colors group"
                  style={{ borderColor: '#F1F5F9' }}
                >
                  {/* Insumo */}
                  <td className="px-4 py-3">
                    <div className="font-semibold text-slate-800 text-sm leading-tight">
                      {item.name}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-slate-400">{item.supplier}</span>
                      {item.expiryDate && (
                        <span className="text-xs font-mono text-amber-600">
                          Vence: {new Date(item.expiryDate).toLocaleDateString('es-BO')}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Categoría */}
                  <td className="px-4 py-3">
                    <span
                      className="text-xs font-semibold px-2.5 py-1 rounded-full"
                      style={{ background: catBg, color: '#475569' }}
                    >
                      {item.category}
                    </span>
                  </td>

                  {/* Stock actual */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div>
                        <div
                          className="font-bold font-mono text-base"
                          style={{
                            color:
                              status === 'agotado'
                                ? '#B91C1C'
                                : status === 'comprar'
                                  ? '#92400E'
                                  : '#1A4F8A',
                          }}
                        >
                          {item.stock}
                          <span className="text-xs font-normal ml-1 text-slate-400">
                            {item.unit}
                          </span>
                        </div>
                        {/* Mini bar */}
                        <div
                          className="w-24 h-1.5 rounded-full mt-1"
                          style={{ background: '#E2E8F0' }}
                        >
                          <div
                            className="h-1.5 rounded-full transition-all"
                            style={{
                              width: `${pct}%`,
                              background:
                                status === 'agotado'
                                  ? '#EF4444'
                                  : status === 'comprar'
                                    ? '#F59E0B'
                                    : '#22C55E',
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Mínimo */}
                  <td className="px-4 py-3 text-sm font-mono text-slate-500">
                    {item.minIdeal} {item.unit}
                  </td>

                  {/* Estado */}
                  <td className="px-4 py-3">
                    <span
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold"
                      style={{
                        background: cfg.bg,
                        color: cfg.color,
                        border: `1px solid ${cfg.border}`,
                      }}
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ background: cfg.color }}
                      />
                      {cfg.label}
                    </span>
                  </td>

                  {/* Acciones */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => updateStock(item.id, -1)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-slate-500 border transition-all hover:bg-red-50 hover:text-red-600 hover:border-red-200 active:scale-95"
                        style={{ borderColor: '#E2E8F0', fontSize: 16 }}
                      >
                        −
                      </button>
                      <input
                        type="number"
                        value={item.stock}
                        onChange={(e) => setStockDirect(item.id, e.target.value)}
                        className="w-14 text-center font-mono font-semibold text-sm rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 py-1"
                        style={{ borderColor: '#E2E8F0', color: '#1E293B' }}
                        min={0}
                      />
                      <button
                        onClick={() => updateStock(item.id, 1)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-slate-500 border transition-all hover:bg-green-50 hover:text-green-600 hover:border-green-200 active:scale-95"
                        style={{ borderColor: '#E2E8F0', fontSize: 16 }}
                      >
                        +
                      </button>
                      <button
                        onClick={() => openPurchaseFlow('pedido', [item.id])}
                        className="ml-1 w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 border transition-colors hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200"
                        style={{ borderColor: '#E2E8F0' }}
                        title="Generar orden de compra"
                      >
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <circle cx="9" cy="21" r="1" />
                          <circle cx="20" cy="21" r="1" />
                          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-12 text-center text-sm text-slate-400">
            No se encontraron insumos con esos filtros.
          </div>
        )}
      </div>

      {/* Purchase activity */}
      {purchaseRequests.length > 0 && (
        <div className="px-5 py-3 border-t bg-blue-50/60" style={{ borderColor: '#DBEAFE' }}>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                </svg>
              </span>
              <div>
                <p className="text-xs font-bold text-slate-700">Actividad de compras</p>
                <p className="text-xs text-slate-400">
                  {purchaseRequests.length} solicitudes preparadas
                </p>
              </div>
            </div>
            <div className="h-8 w-px bg-blue-200 mx-1" />
            <div className="flex gap-2 overflow-x-auto">
              {purchaseRequests.slice(0, 3).map((request) => (
                <div
                  key={request.id}
                  className="flex-shrink-0 bg-white border border-blue-100 rounded-lg px-3 py-1.5 flex items-center gap-3"
                >
                  <div>
                    <p className="text-xs font-bold text-slate-700">{request.reference}</p>
                    <p className="text-xs text-slate-400">
                      {request.type === 'pedido' ? 'Pedido' : 'Cotización'} · {request.itemCount}{' '}
                      insumos · {request.suppliers.length} proveedores
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
                    Correo preparado
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Footer summary */}
      <div
        className="px-5 py-3 border-t flex items-center justify-between"
        style={{ borderColor: '#EEF2F7', background: '#F8FAFD' }}
      >
        <span className="text-xs text-slate-400">
          Mostrando {filtered.length} de {items.length} insumos
        </span>
        <button className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:underline">
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Exportar a Excel
        </button>
      </div>

      {/* Procurement flow */}
      {purchaseMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-5 bg-slate-950/45 backdrop-blur-sm">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="procurement-title"
            className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col"
          >
            <div className="px-6 py-4 border-b border-slate-200 flex items-start justify-between bg-slate-50">
              <div className="flex items-start gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${purchaseMode === 'pedido' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}
                >
                  {purchaseMode === 'pedido' ? (
                    <svg
                      width="19"
                      height="19"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    >
                      <circle cx="9" cy="21" r="1" />
                      <circle cx="20" cy="21" r="1" />
                      <path d="M1 1h4l2.7 13.4A2 2 0 0 0 9.7 16h9.7a2 2 0 0 0 2-1.6L23 6H6" />
                    </svg>
                  ) : (
                    <svg
                      width="19"
                      height="19"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    >
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <path d="M14 2v6h6M8 13h8M8 17h5" />
                    </svg>
                  )}
                </div>
                <div>
                  <h2 id="procurement-title" className="text-lg font-bold text-slate-900">
                    {purchaseMode === 'pedido' ? 'Generar pedido urgente' : 'Solicitar proformas'}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {purchaseMode === 'pedido'
                      ? 'Repón el stock hasta el máximo ideal con el proveedor seleccionado.'
                      : 'Compara precio, disponibilidad, vencimiento y entrega antes de comprar.'}
                  </p>
                </div>
              </div>
              <button
                onClick={closePurchaseFlow}
                aria-label="Cerrar"
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
              >
                <svg
                  width="17"
                  height="17"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto grid grid-cols-[1.2fr_0.8fr]">
              <div className="p-6 border-r border-slate-200">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">1. Insumos y cantidades</h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {selectedItems.length} seleccionados
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-slate-500 bg-slate-100 rounded-full px-2.5 py-1">
                    {purchaseMode === 'pedido' ? 'Reposición sugerida' : 'Consumo preventivo'}
                  </span>
                </div>
                <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
                  {procurementCandidates.map((item) => {
                    const selected = selectedItemIds.includes(item.id)
                    return (
                      <div
                        key={item.id}
                        className={`p-3 flex items-center gap-3 transition-colors ${selected ? 'bg-blue-50/60' : 'bg-white'}`}
                      >
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={() => togglePurchaseItem(item)}
                          aria-label={`Seleccionar ${item.name}`}
                          className="w-4 h-4 accent-blue-700"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-800 truncate">
                            {item.name}
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5">
                            Stock: {item.stock} {item.unit} ·{' '}
                            {purchaseMode === 'pedido'
                              ? `Máximo: ${item.maxIdeal}`
                              : `Vence: ${new Date(item.expiryDate!).toLocaleDateString('es-BO')}`}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min={1}
                            disabled={!selected}
                            value={quantities[item.id] ?? 1}
                            onChange={(event) =>
                              setQuantities((current) => ({
                                ...current,
                                [item.id]: Math.max(1, Number(event.target.value)),
                              }))
                            }
                            aria-label={`Cantidad de ${item.name}`}
                            className="w-16 px-2 py-1.5 text-sm text-center font-mono rounded-lg border border-slate-200 disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <span className="w-16 text-xs text-slate-500">{item.unit}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
                <div className="mt-4">
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Observaciones para el proveedor
                  </label>
                  <textarea
                    rows={3}
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    placeholder={
                      purchaseMode === 'pedido'
                        ? 'Ej. Confirmar disponibilidad antes de despachar...'
                        : 'Ej. Incluir descuentos por volumen y fecha de vencimiento...'
                    }
                    className="w-full px-3 py-2.5 text-sm rounded-lg border border-slate-200 bg-slate-50 resize-none focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="p-6 bg-slate-50">
                <h3 className="text-sm font-bold text-slate-800">
                  2. {purchaseMode === 'pedido' ? 'Proveedor' : 'Marcas a cotizar'}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5 mb-3">
                  {purchaseMode === 'pedido'
                    ? 'Elige un canal para el pedido directo.'
                    : 'Recomendamos consultar al menos tres proveedores.'}
                </p>
                <div className="space-y-2">
                  {eligibleSuppliers.map((supplier) => {
                    const selected = selectedSuppliers.includes(supplier.name)
                    return (
                      <label
                        key={supplier.name}
                        className={`block rounded-xl border p-3 cursor-pointer transition-all ${selected ? 'border-blue-400 bg-blue-50' : 'border-slate-200 bg-white hover:border-slate-300'}`}
                      >
                        <div className="flex items-start gap-3">
                          <input
                            type={purchaseMode === 'pedido' ? 'radio' : 'checkbox'}
                            name="supplier"
                            checked={selected}
                            onChange={() => {
                              if (purchaseMode === 'pedido') {
                                setSelectedSuppliers([supplier.name])
                              } else {
                                setSelectedSuppliers((current) =>
                                  current.includes(supplier.name)
                                    ? current.filter((name) => name !== supplier.name)
                                    : [...current, supplier.name],
                                )
                              }
                            }}
                            className="mt-1 w-4 h-4 accent-blue-700"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-slate-800">
                                {supplier.name}
                              </span>
                              {supplier.preferred && (
                                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 rounded-full px-2 py-0.5">
                                  Aliado
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-400 truncate mt-0.5">
                              {supplier.email}
                            </p>
                            <div className="flex items-center gap-3 mt-2 text-xs">
                              <span className="font-semibold text-amber-600">
                                ★ {supplier.rating}
                              </span>
                              <span className="text-slate-500">
                                Entrega: {supplier.deliveryDays}–{supplier.deliveryDays + 1} días
                              </span>
                            </div>
                          </div>
                        </div>
                      </label>
                    )
                  })}
                </div>

                <div className="mt-4 rounded-xl bg-white border border-slate-200 p-4">
                  <div className="flex justify-between text-xs mb-2">
                    <span className="font-semibold text-slate-500">Resumen</span>
                    <span className="font-bold text-slate-700">{selectedItems.length} insumos</span>
                  </div>
                  {purchaseMode === 'pedido' ? (
                    <>
                      <div className="flex justify-between items-end pt-3 border-t border-slate-100">
                        <span className="text-sm font-semibold text-slate-600">Estimado</span>
                        <span className="text-xl font-bold font-mono text-blue-800">
                          Bs. {estimatedTotal.toLocaleString('es-BO', { maximumFractionDigits: 2 })}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 text-right">
                        Sujeto a confirmación del proveedor
                      </p>
                    </>
                  ) : (
                    <div className="pt-3 border-t border-slate-100">
                      <p className="text-xs text-slate-500 leading-relaxed">
                        La solicitud pedirá precio unitario, disponibilidad, vencimiento y plazo de
                        entrega para poder comparar.
                      </p>
                    </div>
                  )}
                </div>

                <div className="mt-4 p-3 rounded-lg bg-amber-50 border border-amber-200 flex gap-2">
                  <svg
                    className="text-amber-600 flex-shrink-0 mt-0.5"
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 8v4M12 16h.01" />
                  </svg>
                  <p className="text-xs text-amber-800 leading-relaxed">
                    Prototipo: los contactos son demostrativos. Se abrirá tu correo con el mensaje
                    listo; reemplázalos por datos verificados antes de operar.
                  </p>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-200 bg-white flex items-center justify-between">
              <p className="text-xs text-slate-400">
                {purchaseMode === 'cotizacion' && selectedSuppliers.length < 3
                  ? 'Selecciona tres proveedores para una comparación más útil.'
                  : 'El movimiento quedará registrado en Actividad de compras.'}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={closePurchaseFlow}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 rounded-lg border border-slate-200 hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={preparePurchaseEmail}
                  disabled={selectedItems.length === 0 || selectedSuppliers.length === 0}
                  className={`px-5 py-2 text-sm font-semibold text-white rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors ${purchaseMode === 'pedido' ? 'bg-red-600 hover:bg-red-700' : 'bg-amber-600 hover:bg-amber-700'}`}
                >
                  {purchaseMode === 'pedido'
                    ? 'Preparar pedido por correo'
                    : 'Preparar solicitud de proformas'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add item modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
            <div
              className="px-6 py-4 border-b flex items-center justify-between"
              style={{ borderColor: '#EEF2F7' }}
            >
              <h3 className="font-semibold text-slate-800">Añadir Nuevo Insumo</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="px-6 py-5 grid grid-cols-2 gap-4">
              {[
                { label: 'Nombre del Insumo', placeholder: 'Ej: Anestesia Lidocaína 2%', col: 2 },
                { label: 'Categoría', placeholder: 'Ej: Anestésicos' },
                { label: 'Unidad de Medida', placeholder: 'Ej: Cajas, Unidades' },
                { label: 'Stock Actual', placeholder: '0', type: 'number' },
                { label: 'Mínimo Ideal', placeholder: '10', type: 'number' },
                { label: 'Costo por Unidad (Bs.)', placeholder: '0.00', type: 'number' },
                { label: 'Fecha de Vencimiento', placeholder: '', type: 'date' },
                { label: 'Proveedor', placeholder: 'Ej: Dental Depot' },
              ].map((f) => (
                <div
                  key={f.label}
                  className={`flex flex-col gap-1 ${f.col === 2 ? 'col-span-2' : ''}`}
                >
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    {f.label}
                  </label>
                  <input
                    type={f.type ?? 'text'}
                    placeholder={f.placeholder}
                    className="w-full px-3 py-2 text-sm rounded-lg border bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{ borderColor: '#D1D9E6' }}
                  />
                </div>
              ))}
            </div>
            <div
              className="px-6 py-4 border-t flex justify-end gap-3"
              style={{ borderColor: '#EEF2F7', background: '#F8FAFD' }}
            >
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm font-semibold rounded-lg border hover:bg-slate-50 transition-colors"
                style={{ borderColor: '#D1D9E6', color: '#475569' }}
              >
                Cancelar
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="px-5 py-2 text-sm font-semibold text-white rounded-lg transition-opacity hover:opacity-90"
                style={{ background: '#1A4F8A' }}
              >
                Guardar Insumo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
