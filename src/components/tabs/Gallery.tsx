import { useState } from 'react';

interface ImageItem {
  id: number;
  tag: string;
  date: string;
  url: string;
  span?: boolean;
}

const images: ImageItem[] = [
  { id: 1, tag: 'Panorámica', date: '12 Mar 2024', url: 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=600&h=300&fit=crop&auto=format', span: true },
  { id: 2, tag: 'Periapical Molar', date: '12 Mar 2024', url: 'https://images.unsplash.com/photo-1609840114035-3c981b782dfe?w=300&h=300&fit=crop&auto=format' },
  { id: 3, tag: 'Foto Frontal', date: '15 Ene 2024', url: 'https://images.unsplash.com/photo-1606811971618-4486d14f3f99?w=300&h=300&fit=crop&auto=format' },
  { id: 4, tag: 'Evolución Ortodoncia', date: '01 Feb 2024', url: 'https://images.unsplash.com/photo-1588776814546-1ffbb172bb73?w=300&h=400&fit=crop&auto=format' },
  { id: 5, tag: 'Intraoral Superior', date: '15 Ene 2024', url: 'https://images.unsplash.com/photo-1629909615184-74f495363b67?w=300&h=200&fit=crop&auto=format' },
  { id: 6, tag: 'Antes — Blanqueamiento', date: '05 Nov 2023', url: 'https://images.unsplash.com/photo-1571748982800-fa51082c2224?w=300&h=250&fit=crop&auto=format' },
  { id: 7, tag: 'Después — Blanqueamiento', date: '20 Ene 2024', url: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=300&h=250&fit=crop&auto=format' },
  { id: 8, tag: 'Lateral Derecho', date: '12 Mar 2024', url: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=300&h=300&fit=crop&auto=format' },
];

const tagColors: Record<string, string> = {
  'Panorámica': 'bg-blue-100 text-blue-700',
  'Periapical Molar': 'bg-indigo-100 text-indigo-700',
  'Foto Frontal': 'bg-green-100 text-green-700',
  'Evolución Ortodoncia': 'bg-violet-100 text-violet-700',
  'Intraoral Superior': 'bg-sky-100 text-sky-700',
  'Antes — Blanqueamiento': 'bg-orange-100 text-orange-700',
  'Después — Blanqueamiento': 'bg-emerald-100 text-emerald-700',
  'Lateral Derecho': 'bg-cyan-100 text-cyan-700',
};

export default function Gallery() {
  const [selected, setSelected] = useState<ImageItem | null>(null);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="font-semibold text-slate-800">Galería de Imágenes Clínicas</h3>
          <p className="text-sm text-slate-500 mt-0.5">{images.length} archivos · Radiografías, fotos intraorales y evolución</p>
        </div>
        <div className="flex gap-2">
          <select className="text-sm px-3 py-2 rounded-md border bg-white" style={{ borderColor: '#D1D9E6', color: '#475569' }}>
            <option>Todos los tipos</option>
            <option>Radiografías</option>
            <option>Fotos Intraorales</option>
            <option>Evolución</option>
          </select>
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-md transition-opacity hover:opacity-90" style={{ background: '#1A4F8A' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Añadir Imagen
          </button>
        </div>
      </div>

      {/* Drag-drop zone */}
      <div
        className="border-2 border-dashed rounded-lg p-6 mb-5 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors hover:bg-blue-50"
        style={{ borderColor: '#93C5FD', background: '#F0F6FF' }}
      >
        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: '#DBEAFE' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="16 16 12 12 8 16" /><line x1="12" y1="12" x2="12" y2="21" />
            <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
          </svg>
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold text-blue-700">Arrastra imágenes aquí</p>
          <p className="text-xs text-slate-500 mt-0.5">JPG, PNG, TIFF, DICOM · Máx. 25 MB por archivo</p>
        </div>
      </div>

      {/* Masonry grid */}
      <div className="columns-2 gap-4 space-y-4" style={{ columnCount: 3 }}>
        {images.map((img) => (
          <div
            key={img.id}
            className="break-inside-avoid rounded-lg overflow-hidden border cursor-pointer group relative transition-all hover:shadow-md"
            style={{ borderColor: '#E2E8F0', background: '#F8FAFC' }}
            onClick={() => setSelected(img)}
          >
            <img
              src={img.url}
              alt={img.tag}
              className="w-full object-cover group-hover:brightness-95 transition-all"
            />
            <div className="px-3 py-2.5">
              <div className="flex items-center justify-between gap-2">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${tagColors[img.tag] ?? 'bg-slate-100 text-slate-600'}`}>
                  {img.tag}
                </span>
                <span className="text-xs text-slate-400 font-mono">{img.date}</span>
              </div>
            </div>
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="bg-white rounded-full p-2 shadow">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1A4F8A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                    <line x1="11" y1="8" x2="11" y2="14" /><line x1="8" y1="11" x2="14" y2="11" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-white rounded-xl overflow-hidden shadow-2xl max-w-2xl w-full mx-4"
            onClick={e => e.stopPropagation()}
          >
            <img src={selected.url} alt={selected.tag} className="w-full object-contain max-h-96" />
            <div className="px-5 py-4 flex items-center justify-between">
              <div>
                <div className="font-semibold text-slate-800">{selected.tag}</div>
                <div className="text-sm text-slate-500 font-mono">{selected.date}</div>
              </div>
              <div className="flex gap-2">
                <button className="px-3 py-1.5 text-sm font-semibold rounded border hover:bg-slate-50 transition-colors" style={{ borderColor: '#D1D9E6', color: '#475569' }}>
                  Descargar
                </button>
                <button onClick={() => setSelected(null)} className="px-3 py-1.5 text-sm font-semibold text-white rounded transition-opacity hover:opacity-90" style={{ background: '#1A4F8A' }}>
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
