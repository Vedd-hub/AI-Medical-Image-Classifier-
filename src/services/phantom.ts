import { seededRandom, hashString } from '../utils/format'

const cache = new Map<string, string>()

/**
 * Procedurally drawn placeholder "radiograph-like" image for fictional demo
 * records that have no uploaded file. It is not a real medical image.
 */
export function phantomImage(key: string): string {
  const hit = cache.get(key)
  if (hit) return hit
  const w = 640, h = 760
  const c = document.createElement('canvas')
  c.width = w; c.height = h
  const ctx = c.getContext('2d')!
  const rand = seededRandom(hashString(key))

  ctx.fillStyle = '#0b0d10'
  ctx.fillRect(0, 0, w, h)
  // torso
  const torso = ctx.createRadialGradient(w / 2, h * 0.5, 40, w / 2, h * 0.5, w * 0.62)
  torso.addColorStop(0, '#8a8f95'); torso.addColorStop(0.7, '#4b5057'); torso.addColorStop(1, '#101215')
  ctx.fillStyle = torso
  ctx.beginPath(); ctx.ellipse(w / 2, h * 0.52, w * 0.42, h * 0.46, 0, 0, Math.PI * 2); ctx.fill()
  // lungs
  for (const dx of [-1, 1]) {
    const g = ctx.createRadialGradient(w / 2 + dx * 130, h * 0.42, 10, w / 2 + dx * 130, h * 0.42, 190)
    g.addColorStop(0, '#1b1e22'); g.addColorStop(1, '#3a3f45')
    ctx.fillStyle = g
    ctx.beginPath(); ctx.ellipse(w / 2 + dx * 128, h * 0.42, 100, 190, dx * 0.08, 0, Math.PI * 2); ctx.fill()
  }
  // spine + ribs
  ctx.fillStyle = 'rgba(200,205,210,0.5)'
  ctx.fillRect(w / 2 - 14, h * 0.1, 28, h * 0.8)
  ctx.strokeStyle = 'rgba(210,214,218,0.35)'; ctx.lineWidth = 6
  for (let i = 0; i < 9; i++) {
    const y = h * 0.16 + i * 50
    for (const dx of [-1, 1]) {
      ctx.beginPath()
      ctx.moveTo(w / 2 + dx * 14, y)
      ctx.quadraticCurveTo(w / 2 + dx * 170, y + 20 + i * 2, w / 2 + dx * 235, y + 90)
      ctx.stroke()
    }
  }
  // heart shadow
  ctx.fillStyle = 'rgba(170,175,180,0.45)'
  ctx.beginPath(); ctx.ellipse(w / 2 - 45, h * 0.58, 78, 92, 0.3, 0, Math.PI * 2); ctx.fill()
  // grain
  const img = ctx.getImageData(0, 0, w, h)
  for (let i = 0; i < img.data.length; i += 4) {
    const n = (rand() - 0.5) * 22
    img.data[i] += n; img.data[i + 1] += n; img.data[i + 2] += n
  }
  ctx.putImageData(img, 0, 0)

  const url = c.toDataURL('image/jpeg', 0.85)
  cache.set(key, url)
  return url
}
