import { seededRandom } from '../utils/format'

/** Jet-like colour ramp for t in [0,1]; returns [r,g,b]. */
function ramp(t: number): [number, number, number] {
  const c = (v: number) => Math.max(0, Math.min(1, v))
  return [
    Math.round(255 * c(1.5 - Math.abs(4 * t - 3))),
    Math.round(255 * c(1.5 - Math.abs(4 * t - 2))),
    Math.round(255 * c(1.5 - Math.abs(4 * t - 1))),
  ]
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Image could not be decoded'))
    img.src = url
  })
}

/**
 * SIMULATED explainability overlay. Blobs are placed from a deterministic seed —
 * they do NOT reflect any trained model. Replace with generateGradCAM() once a
 * real model exposes activation maps; the return contract (image data URL) stays.
 */
export async function generateDemoHeatmap(imageUrl: string, seed: number, intense = true): Promise<string> {
  const img = await loadImage(imageUrl)
  const maxSide = 720
  const scale = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight))
  const w = Math.max(1, Math.round(img.naturalWidth * scale))
  const h = Math.max(1, Math.round(img.naturalHeight * scale))

  const heat = document.createElement('canvas')
  heat.width = w
  heat.height = h
  const hctx = heat.getContext('2d')!
  const rand = seededRandom(seed)
  const blobs = intense ? 3 : 1
  for (let i = 0; i < blobs; i++) {
    const cx = w * (0.25 + rand() * 0.5)
    const cy = h * (0.25 + rand() * 0.5)
    const r = Math.min(w, h) * (0.14 + rand() * 0.14) * (i === 0 ? 1.2 : 0.8)
    const g = hctx.createRadialGradient(cx, cy, 0, cx, cy, r)
    g.addColorStop(0, `rgba(0,0,0,${i === 0 ? 1 : 0.7})`)
    g.addColorStop(1, 'rgba(0,0,0,0)')
    hctx.fillStyle = g
    hctx.fillRect(0, 0, w, h)
  }
  const data = hctx.getImageData(0, 0, w, h)
  for (let p = 0; p < data.data.length; p += 4) {
    const a = data.data[p + 3] / 255
    if (a < 0.06) { data.data[p + 3] = 0; continue }
    const [r, g, b] = ramp(a)
    data.data[p] = r
    data.data[p + 1] = g
    data.data[p + 2] = b
    data.data[p + 3] = Math.round(a * 165)
  }
  hctx.putImageData(data, 0, 0)

  const out = document.createElement('canvas')
  out.width = w
  out.height = h
  const octx = out.getContext('2d')!
  octx.drawImage(img, 0, 0, w, h)
  octx.drawImage(heat, 0, 0)
  return out.toDataURL('image/jpeg', 0.85)
}
