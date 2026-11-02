import { useRef, useState, type DragEvent } from 'react'
import { UploadCloud } from 'lucide-react'

export function UploadZone({ onFile, busy, progress }: { onFile: (f: File) => void; busy?: boolean; progress?: number }) {
  const input = useRef<HTMLInputElement>(null)
  const [drag, setDrag] = useState(false)

  const drop = (e: DragEvent) => {
    e.preventDefault(); setDrag(false)
    const f = e.dataTransfer.files?.[0]
    if (f) onFile(f)
  }

  return (
    <div>
      <div
        role="button" tabIndex={0} aria-label="Upload medical image. Drag and drop or press Enter to browse."
        onClick={() => !busy && input.current?.click()}
        onKeyDown={(e) => { if ((e.key === 'Enter' || e.key === ' ') && !busy) { e.preventDefault(); input.current?.click() } }}
        onDragOver={(e) => { e.preventDefault(); setDrag(true) }}
        onDragLeave={() => setDrag(false)}
        onDrop={drop}
        className={`flex cursor-pointer flex-col items-center rounded-xl border-2 border-dashed px-6 py-12 text-center transition-colors ${drag ? 'border-brand-600 bg-brand-50' : 'border-[#c5ccd6] bg-[#fafbfc] hover:border-brand-500 hover:bg-brand-50/50'}`}
      >
        <div className={`mb-4 flex h-14 w-14 items-center justify-center rounded-2xl transition-transform ${drag ? 'scale-105 bg-brand-100 text-brand-700' : 'bg-white text-brand-600 shadow-[var(--shadow-card)]'}`}>
          <UploadCloud className="h-7 w-7" aria-hidden="true" />
        </div>
        <p className="text-[15px] font-semibold text-navy-900">Upload medical image</p>
        <p className="mt-1 text-[13px] text-muted">Drag and drop, or <span className="font-medium text-brand-600 underline">browse files</span></p>
        <p className="mt-4 text-[12px] font-medium text-faint">Supported: JPG · JPEG · PNG · DICOM*</p>
        <p className="mt-1 max-w-md text-[11.5px] leading-relaxed text-faint">
          *DICOM support shown for prototype workflow; production implementation requires a dedicated DICOM processing pipeline.
        </p>
        <input ref={input} type="file" accept=".jpg,.jpeg,.png,.dcm,image/jpeg,image/png" className="sr-only" tabIndex={-1}
          onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); e.target.value = '' }} />
      </div>
      {busy && (
        <div className="mt-3" role="progressbar" aria-valuenow={Math.round((progress ?? 0) * 100)} aria-valuemin={0} aria-valuemax={100} aria-label="Upload progress">
          <div className="mb-1 flex justify-between text-[12px] text-muted"><span>Reading image…</span><span>{Math.round((progress ?? 0) * 100)}%</span></div>
          <div className="h-1.5 overflow-hidden rounded-full bg-[#e6eaf0]"><div className="h-full rounded-full bg-brand-600 transition-[width] duration-150" style={{ width: `${(progress ?? 0) * 100}%` }} /></div>
        </div>
      )}
    </div>
  )
}
