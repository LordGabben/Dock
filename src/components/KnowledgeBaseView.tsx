import { useEffect, useMemo, useState } from 'react'

type KnowledgeCategory = 'Servicios' | 'Precios' | 'Agenda' | 'Preparación' | 'Cuidados'

type KnowledgeEntry = {
  id: string
  title: string
  content: string
  category: KnowledgeCategory
  keywords: string[]
  enabled: boolean
  updatedAt: string
}

const STORAGE_KEY = 'dock-chatbot-knowledge-v1'

const CATEGORIES: KnowledgeCategory[] = [
  'Servicios',
  'Precios',
  'Agenda',
  'Preparación',
  'Cuidados',
]

const DEFAULT_ENTRIES: KnowledgeEntry[] = [
  {
    id: 'kb-implantes',
    title: 'Implantes dentales',
    content:
      'La clínica realiza evaluación, planificación digital y colocación de implantes. La primera consulta incluye valoración clínica y solicitud de estudios cuando sean necesarios.',
    category: 'Servicios',
    keywords: ['implantes', 'cirugía', 'diente perdido'],
    enabled: true,
    updatedAt: '2024-06-18T14:30:00.000Z',
  },
  {
    id: 'kb-limpieza-precio',
    title: 'Precio de limpieza dental',
    content:
      'La limpieza dental tiene un precio referencial desde Bs. 250. El monto final puede variar según la evaluación periodontal del paciente.',
    category: 'Precios',
    keywords: ['limpieza', 'profilaxis', 'precio', 'costo'],
    enabled: true,
    updatedAt: '2024-06-17T10:15:00.000Z',
  },
  {
    id: 'kb-primera-cita',
    title: 'Qué llevar a la primera cita',
    content:
      'El paciente debe traer su documento de identidad, estudios radiográficos recientes si los tiene y una lista de medicamentos o antecedentes médicos relevantes.',
    category: 'Preparación',
    keywords: ['primera cita', 'documentos', 'radiografía'],
    enabled: true,
    updatedAt: '2024-06-14T16:45:00.000Z',
  },
  {
    id: 'kb-reprogramacion',
    title: 'Reprogramación y cancelaciones',
    content:
      'Las citas pueden reprogramarse con al menos 24 horas de anticipación. El chatbot debe solicitar nombre completo y fecha de la cita antes de derivar la solicitud.',
    category: 'Agenda',
    keywords: ['cancelar', 'reprogramar', 'cambiar cita'],
    enabled: true,
    updatedAt: '2024-06-12T12:00:00.000Z',
  },
  {
    id: 'kb-extraccion',
    title: 'Cuidados después de una extracción',
    content:
      'Mantener la gasa indicada, evitar enjuagues fuertes durante las primeras 24 horas y seguir la medicación prescrita. Si existe sangrado persistente, dolor intenso o fiebre, contactar a la clínica.',
    category: 'Cuidados',
    keywords: ['extracción', 'sangrado', 'postoperatorio'],
    enabled: false,
    updatedAt: '2024-06-10T09:20:00.000Z',
  },
]

const EMPTY_FORM = {
  title: '',
  content: '',
  category: 'Servicios' as KnowledgeCategory,
  keywords: '',
  enabled: true,
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('es-BO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))
}

function CategoryIcon({ category }: { category: KnowledgeCategory }) {
  const paths: Record<KnowledgeCategory, React.ReactNode> = {
    Servicios: (
      <>
        <path d="M12 3v18M3 12h18" />
        <circle cx="12" cy="12" r="9" />
      </>
    ),
    Precios: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M16 8.5c-.8-.7-2-1-3.3-1-1.8 0-3.2.9-3.2 2.2 0 3.3 6.8 1.5 6.8 5 0 1.4-1.5 2.4-3.5 2.4-1.5 0-2.9-.5-3.8-1.3M12.7 5.5v2M12.7 17.2v1.5" />
      </>
    ),
    Agenda: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M16 3v4M8 3v4M3 10h18" />
      </>
    ),
    Preparación: (
      <>
        <path d="M9 5h6M9 3h6v4H9z" />
        <path d="M7 5H5v16h14V5h-2M8 12h8M8 16h5" />
      </>
    ),
    Cuidados: (
      <>
        <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8z" />
      </>
    ),
  }

  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[category]}
    </svg>
  )
}

export default function KnowledgeBaseView() {
  const [entries, setEntries] = useState<KnowledgeEntry[]>(DEFAULT_ENTRIES)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<'Todas' | KnowledgeCategory>('Todas')
  const [showEditor, setShowEditor] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [pendingDelete, setPendingDelete] = useState<KnowledgeEntry | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed)) setEntries(parsed)
      } catch {
        localStorage.removeItem(STORAGE_KEY)
      }
    }
    setReady(true)
  }, [])

  useEffect(() => {
    if (ready) localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
  }, [entries, ready])

  const filteredEntries = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase('es')
    return entries.filter((entry) => {
      const matchesCategory = category === 'Todas' || entry.category === category
      const searchable =
        `${entry.title} ${entry.content} ${entry.keywords.join(' ')}`.toLocaleLowerCase('es')
      return matchesCategory && (!normalizedSearch || searchable.includes(normalizedSearch))
    })
  }, [category, entries, search])

  const activeCount = entries.filter((entry) => entry.enabled).length
  const keywordCount = new Set(
    entries.flatMap((entry) => entry.keywords.map((keyword) => keyword.toLocaleLowerCase('es'))),
  ).size

  const openCreate = () => {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setShowEditor(true)
  }

  const openEdit = (entry: KnowledgeEntry) => {
    setEditingId(entry.id)
    setForm({
      title: entry.title,
      content: entry.content,
      category: entry.category,
      keywords: entry.keywords.join(', '),
      enabled: entry.enabled,
    })
    setShowEditor(true)
  }

  const saveEntry = () => {
    const title = form.title.trim()
    const content = form.content.trim()
    if (!title || !content) return

    const keywords = form.keywords
      .split(',')
      .map((keyword) => keyword.trim())
      .filter(Boolean)

    if (editingId) {
      setEntries((current) =>
        current.map((entry) =>
          entry.id === editingId
            ? { ...entry, ...form, title, content, keywords, updatedAt: new Date().toISOString() }
            : entry,
        ),
      )
    } else {
      setEntries((current) => [
        {
          id: crypto.randomUUID(),
          title,
          content,
          category: form.category,
          keywords,
          enabled: form.enabled,
          updatedAt: new Date().toISOString(),
        },
        ...current,
      ])
    }
    setShowEditor(false)
  }

  const removeEntry = () => {
    if (!pendingDelete) return
    setEntries((current) => current.filter((entry) => entry.id !== pendingDelete.id))
    setPendingDelete(null)
  }

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50">
      <div className="max-w-6xl mx-auto px-8 py-7">
        <div className="flex items-start justify-between gap-6 mb-7">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-blue-700">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                Inteligencia del asistente
              </span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Base de Conocimientos
            </h2>
            <p className="text-sm text-slate-500 mt-1 max-w-2xl">
              Define la información que el chatbot puede utilizar para responder a tus pacientes.
            </p>
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-800 text-white text-sm font-semibold shadow-sm hover:bg-blue-900 transition-colors"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
            Nuevo conocimiento
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            {
              label: 'Contenidos totales',
              value: entries.length,
              detail: 'en la biblioteca',
              color: 'text-blue-700',
              background: 'bg-blue-50',
            },
            {
              label: 'Respuestas activas',
              value: activeCount,
              detail: `${entries.length - activeCount} en borrador`,
              color: 'text-emerald-700',
              background: 'bg-emerald-50',
            },
            {
              label: 'Palabras clave',
              value: keywordCount,
              detail: 'para reconocer consultas',
              color: 'text-violet-700',
              background: 'bg-violet-50',
            },
          ].map((metric) => (
            <div
              key={metric.label}
              className="bg-white border border-slate-200 rounded-xl px-5 py-4 flex items-center gap-4 shadow-sm"
            >
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center text-lg font-bold ${metric.background} ${metric.color}`}
              >
                {metric.value}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-700">{metric.label}</p>
                <p className="text-xs text-slate-400 mt-0.5">{metric.detail}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center gap-3">
            <div className="relative flex-1">
              <svg
                className="absolute left-3 top-2.5 text-slate-400"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.4-4.4" />
              </svg>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar por título, contenido o palabra clave..."
                className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              />
            </div>
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value as 'Todas' | KnowledgeCategory)}
              className="px-3 py-2 text-sm font-medium text-slate-600 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Todas">Todas las categorías</option>
              {CATEGORIES.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </div>

          <div className="px-5 py-3 flex items-center justify-between bg-slate-50/70 border-b border-slate-100">
            <p className="text-xs font-semibold text-slate-500">
              {filteredEntries.length} {filteredEntries.length === 1 ? 'resultado' : 'resultados'}
            </p>
            <p className="text-xs text-slate-400">
              Los cambios se guardan automáticamente en este dispositivo
            </p>
          </div>

          {filteredEntries.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {filteredEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="group px-5 py-4 hover:bg-slate-50/70 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center flex-shrink-0">
                      <CategoryIcon category={entry.category} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2.5">
                        <h3 className="text-sm font-bold text-slate-800 truncate">{entry.title}</h3>
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-xs font-semibold">
                          {entry.category}
                        </span>
                        {!entry.enabled && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-xs font-semibold">
                            Borrador
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
                        {entry.content}
                      </p>
                      <div className="flex items-center gap-2 mt-3">
                        {entry.keywords.slice(0, 4).map((keyword) => (
                          <span
                            key={keyword}
                            className="text-xs text-blue-700 bg-blue-50 rounded-md px-2 py-0.5"
                          >
                            #{keyword}
                          </span>
                        ))}
                        <span className="text-xs text-slate-400 ml-1">
                          Actualizado {formatDate(entry.updatedAt)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() =>
                          setEntries((current) =>
                            current.map((item) =>
                              item.id === entry.id
                                ? {
                                    ...item,
                                    enabled: !item.enabled,
                                    updatedAt: new Date().toISOString(),
                                  }
                                : item,
                            ),
                          )
                        }
                        title={entry.enabled ? 'Desactivar respuesta' : 'Activar respuesta'}
                        aria-label={
                          entry.enabled ? `Desactivar ${entry.title}` : `Activar ${entry.title}`
                        }
                        className={`relative w-10 h-6 rounded-full transition-colors ${entry.enabled ? 'bg-blue-700' : 'bg-slate-300'}`}
                      >
                        <span
                          className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-all ${entry.enabled ? 'left-5' : 'left-1'}`}
                        />
                      </button>
                      <button
                        onClick={() => openEdit(entry)}
                        title="Editar"
                        aria-label={`Editar ${entry.title}`}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-blue-700 hover:bg-blue-50 transition-colors"
                      >
                        <svg
                          width="15"
                          height="15"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        >
                          <path d="M12 20h9" />
                          <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => setPendingDelete(entry)}
                        title="Eliminar"
                        aria-label={`Eliminar ${entry.title}`}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <svg
                          width="15"
                          height="15"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        >
                          <path d="M3 6h18M8 6V4h8v2M19 6l-1 15H6L5 6M10 11v6M14 11v6" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-16 text-center">
              <div className="w-12 h-12 mx-auto rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mb-3">
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.4-4.4" />
                </svg>
              </div>
              <h3 className="text-sm font-bold text-slate-700">No encontramos contenidos</h3>
              <p className="text-xs text-slate-400 mt-1">Prueba con otra búsqueda o categoría.</p>
            </div>
          )}
        </div>
      </div>

      {showEditor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/40 backdrop-blur-sm">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="knowledge-editor-title"
            className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden border border-slate-200"
          >
            <div className="px-6 py-5 border-b border-slate-100 flex items-start justify-between">
              <div>
                <h2 id="knowledge-editor-title" className="text-lg font-bold text-slate-900">
                  {editingId ? 'Editar conocimiento' : 'Nuevo conocimiento'}
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Escribe una respuesta clara y específica para el asistente.
                </p>
              </div>
              <button
                onClick={() => setShowEditor(false)}
                aria-label="Cerrar editor"
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <svg
                  className="mx-auto"
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
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Título de la información
                </label>
                <input
                  autoFocus
                  value={form.title}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, title: event.target.value }))
                  }
                  placeholder="Ej. Horarios de atención"
                  className="w-full px-3 py-2.5 text-sm rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Categoría
                  </label>
                  <select
                    value={form.category}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        category: event.target.value as KnowledgeCategory,
                      }))
                    }
                    className="w-full px-3 py-2.5 text-sm rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {CATEGORIES.map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Palabras clave
                  </label>
                  <input
                    value={form.keywords}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, keywords: event.target.value }))
                    }
                    placeholder="precio, horario, cita"
                    className="w-full px-3 py-2.5 text-sm rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Información para el chatbot
                </label>
                <textarea
                  rows={6}
                  value={form.content}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, content: event.target.value }))
                  }
                  placeholder="Describe la respuesta que el chatbot debe utilizar..."
                  className="w-full px-3 py-2.5 text-sm leading-relaxed rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
                <p className="text-xs text-slate-400 mt-1.5">
                  Separa las palabras clave con comas.
                </p>
              </div>
              <label className="flex items-center justify-between gap-4 p-3.5 rounded-lg bg-blue-50 border border-blue-100 cursor-pointer">
                <div>
                  <span className="block text-sm font-semibold text-blue-900">
                    Disponible para el chatbot
                  </span>
                  <span className="block text-xs text-blue-600 mt-0.5">
                    Puede usar este contenido al responder pacientes.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={form.enabled}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, enabled: event.target.checked }))
                  }
                  className="w-4 h-4 accent-blue-700"
                />
              </label>
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
              <button
                onClick={() => setShowEditor(false)}
                className="px-4 py-2 text-sm font-semibold text-slate-600 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={saveEntry}
                disabled={!form.title.trim() || !form.content.trim()}
                className="px-4 py-2 text-sm font-semibold text-white rounded-lg bg-blue-800 hover:bg-blue-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {editingId ? 'Guardar cambios' : 'Añadir conocimiento'}
              </button>
            </div>
          </div>
        </div>
      )}

      {pendingDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/40 backdrop-blur-sm">
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-knowledge-title"
            className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 border border-slate-200"
          >
            <div className="w-11 h-11 rounded-xl bg-red-50 text-red-600 flex items-center justify-center mb-4">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <path d="M3 6h18M8 6V4h8v2M19 6l-1 15H6L5 6" />
              </svg>
            </div>
            <h2 id="delete-knowledge-title" className="text-lg font-bold text-slate-900">
              Eliminar conocimiento
            </h2>
            <p className="text-sm text-slate-500 mt-2 leading-relaxed">
              “{pendingDelete.title}” dejará de estar disponible para el chatbot. Esta acción no se
              puede deshacer.
            </p>
            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setPendingDelete(null)}
                className="flex-1 py-2 text-sm font-semibold text-slate-600 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={removeEntry}
                className="flex-1 py-2 text-sm font-semibold text-white rounded-lg bg-red-600 hover:bg-red-700 transition-colors"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
