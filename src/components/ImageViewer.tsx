import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Maximize, Minimize, RotateCcw, ScanLine, ZoomIn, ZoomOut } from 'lucide-react'

/** Lightweight medical image viewer: zoom, pan-by-scroll, reset, fit, fullscreen. */
export function ImageViewer({ src, alt, caption, footer, aspect = 'aspect-[4/4.2]' }: {
  src: string; alt: string; caption?: ReactNode; footer?: ReactNode; aspect?: string
}) {
  const [zoom, setZoom] = useState(1)
  const [full, setFull] = useState(false)
  const box = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const h = () => setFull(document.fullscreenElement === box.current)
    document.addEventListener('fullscreenchange', h)
    return () => document.removeEventListener('fullscreenchange', h)
  }, [])
  const clamp = (z: number) => Math.min(4, Math.max(0.5, +z.toFixed(2)))

  const toggleFull = async () => {
    try {
      if (!document.fullscreenElement) { await box.current?.requestFullscreen() }
      else { await document.exitFullscreen() }
    } catch { /* fullscreen not permitted */ }
  }

  const tool = 'btn btn-ghost btn-sm !px-2 !text-white/80 hover:!bg-white/15 hover:!text-white'
  return (
    <div ref={box} className="min-w-0 overflow-hidden rounded-xl border border-line bg-[#0b0d10]">
      <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1 border-b border-white/10 px-3 py-2">
        <div className="min-w-0 max-w-full truncate text-[12px] font-medium text-white/80">{caption}</div>
        <div className="flex shrink-0 items-center gap-0.5" role="toolbar" aria-label="Image viewer controls">
          <button className={tool} onClick={() => setZoom((z) => clamp(z - 0.25))} aria-label="Zoom out"><ZoomOut className="h-4 w-4" /></button>
          <span className="w-10 text-center text-[11px] tabular-nums text-white/70" aria-live="polite">{Math.round(zoom * 100)}%</span>
          <button className={tool} onClick={() => setZoom((z) => clamp(z + 0.25))} aria-label="Zoom in"><ZoomIn className="h-4 w-4" /></button>
          <button className={tool} onClick={() => setZoom(1)} aria-label="Reset zoom"><RotateCcw className="h-4 w-4" /></button>
          <button className={tool} onClick={() => setZoom(1)} aria-label="Fit to screen"><ScanLine className="h-4 w-4" /></button>
          <button className={tool} onClick={toggleFull} aria-label={full ? 'Exit fullscreen' : 'Fullscreen'}>{full ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}</button>
        </div>
      </div>
      <div className={`${full ? 'h-[calc(100vh-44px)]' : aspect} w-full overflow-auto`}>
        <div className="flex h-full min-h-full w-full items-center justify-center" style={zoom > 1 ? { width: `${zoom * 100}%`, height: `${zoom * 100}%` } : undefined}>
          <img src={src} alt={alt} draggable={false}
            className="max-h-full max-w-full select-none object-contain transition-transform duration-150"
            style={zoom <= 1 ? { transform: `scale(${zoom})` } : { width: '100%', height: '100%' }} />
        </div>
      </div>
      {footer && <div className="border-t border-white/10 px-3 py-2 text-[11.5px] text-white/60">{footer}</div>}
    </div>
  )
}
