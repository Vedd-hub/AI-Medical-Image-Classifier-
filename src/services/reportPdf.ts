import { jsPDF } from 'jspdf'
import type { Analysis, Patient } from '../types'
import { DISCLAIMER_FULL } from '../data/constants'
import { formatDateTime } from '../utils/format'
import { phantomImage } from './phantom'

export function reportFileName(a: Analysis): string {
  return `MedVision_Report_${a.patientId}_${a.studyId}.pdf`
}

/** Downscale any image URL to a JPEG data URL suitable for embedding. */
async function toDataUrl(url: string, maxSide = 900): Promise<{ data: string; w: number; h: number }> {
  const img = await new Promise<HTMLImageElement>((res, rej) => {
    const i = new Image()
    i.onload = () => res(i)
    i.onerror = () => rej(new Error('image load failed'))
    i.src = url
  })
  const s = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight))
  const c = document.createElement('canvas')
  c.width = Math.round(img.naturalWidth * s)
  c.height = Math.round(img.naturalHeight * s)
  c.getContext('2d')!.drawImage(img, 0, 0, c.width, c.height)
  return { data: c.toDataURL('image/jpeg', 0.85), w: c.width, h: c.height }
}

const NAVY: [number, number, number] = [18, 40, 76]
const GREY: [number, number, number] = [95, 104, 116]

export async function buildReportPdf(a: Analysis, patient: Patient | undefined, heatmapUrl: string): Promise<jsPDF> {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const W = 210, M = 16
  let y = 0

  // header band
  doc.setFillColor(...NAVY); doc.rect(0, 0, W, 28, 'F')
  doc.setTextColor(255); doc.setFont('helvetica', 'bold'); doc.setFontSize(17)
  doc.text('MEDVISION AI', M, 13)
  doc.setFont('helvetica', 'normal'); doc.setFontSize(9.5)
  doc.text('AI-Assisted Medical Image Analysis', M, 20)
  doc.setFontSize(8.5)
  doc.text('DEMO MODE — simulated results', W - M, 13, { align: 'right' })
  doc.text(`Generated ${formatDateTime(new Date().toISOString())}`, W - M, 20, { align: 'right' })
  y = 38

  const heading = (t: string) => {
    if (y > 262) { doc.addPage(); y = 20 }
    doc.setTextColor(...NAVY); doc.setFont('helvetica', 'bold'); doc.setFontSize(11)
    doc.text(t.toUpperCase(), M, y)
    doc.setDrawColor(210, 215, 222); doc.line(M, y + 2, W - M, y + 2)
    y += 8
  }
  const kv = (rows: [string, string][]) => {
    doc.setFontSize(9.5)
    rows.forEach(([k, v]) => {
      if (y > 275) { doc.addPage(); y = 20 }
      doc.setFont('helvetica', 'normal'); doc.setTextColor(...GREY); doc.text(k, M, y)
      doc.setFont('helvetica', 'bold'); doc.setTextColor(30, 35, 45); doc.text(v, M + 42, y)
      y += 6
    })
    y += 3
  }
  const para = (text: string, fallback: string) => {
    doc.setFont('helvetica', 'normal'); doc.setFontSize(9.5)
    doc.setTextColor(text ? 30 : 140, text ? 35 : 145, text ? 45 : 150)
    const lines = doc.splitTextToSize(text || fallback, W - 2 * M) as string[]
    lines.forEach((l) => { if (y > 278) { doc.addPage(); y = 20 } doc.text(l, M, y); y += 5 })
    y += 4
  }

  heading('Patient')
  kv([
    ['Patient ID', a.patientId],
    ['Name', patient?.name ?? '—'],
    ['Age', patient ? String(patient.age) : '—'],
    ['Gender', patient?.gender ?? '—'],
  ])
  heading('Examination')
  kv([['Study ID', a.studyId], ['Modality', a.modality], ['Date / time', formatDateTime(a.date)]])

  heading('Images')
  const src = a.imageUrl ?? phantomImage(a.studyId)
  try {
    const [orig, heat] = await Promise.all([toDataUrl(src), toDataUrl(heatmapUrl)])
    const bw = 80, bh = 80
    const fit = (w: number, h: number) => { const r = Math.min(bw / w, bh / h); return [w * r, h * r] as const }
    const [ow, oh] = fit(orig.w, orig.h), [hw, hh] = fit(heat.w, heat.h)
    doc.setFillColor(12, 14, 17)
    doc.rect(M, y, bw, bh, 'F'); doc.rect(W - M - bw, y, bw, bh, 'F')
    doc.addImage(orig.data, 'JPEG', M + (bw - ow) / 2, y + (bh - oh) / 2, ow, oh)
    doc.addImage(heat.data, 'JPEG', W - M - bw + (bw - hw) / 2, y + (bh - hh) / 2, hw, hh)
    y += bh + 5
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(...GREY)
    doc.text('Original image', M, y)
    doc.text('Simulated explainability visualization (not model-derived)', W - M - bw, y)
    y += 8
  } catch {
    para('', 'Image could not be embedded.')
  }

  heading('AI Analysis (simulated prototype output)')
  kv([
    ['AI Prediction', a.result.prediction],
    ['Confidence', `${a.result.confidence.toFixed(1)}%`],
    ['Normal probability', `${a.result.probabilities.normal.toFixed(1)}%`],
    ['Abnormal probability', `${a.result.probabilities.abnormal.toFixed(1)}%`],
    ['Priority suggestion', `${a.result.priority} (workflow suggestion, not an emergency diagnosis)`],
  ])
  para(a.result.explanation, '')

  heading("Doctor's Review")
  doc.setFont('helvetica', 'bold'); doc.setFontSize(9); doc.setTextColor(...GREY); doc.text('Clinical notes', M, y); y += 5
  para(a.clinicalNotes, 'No clinical notes recorded.')
  doc.setFont('helvetica', 'bold'); doc.setFontSize(9); doc.setTextColor(...GREY); doc.text("Doctor's final interpretation", M, y); y += 5
  para(a.finalInterpretation, 'Pending — final interpretation has not been entered.')
  kv([['Review status', a.reviewStatus], ['Reviewed by', a.reviewedBy ?? 'Awaiting review']])

  heading('Model')
  kv([['Model version', a.result.modelVersion], ['Inference mode', a.result.mode === 'demo' ? 'Simulation (Demo AI Mode)' : 'Real inference']])

  heading('Disclaimer')
  para(DISCLAIMER_FULL, '')

  const pages = doc.getNumberOfPages()
  for (let p = 1; p <= pages; p++) {
    doc.setPage(p)
    doc.setFontSize(8); doc.setTextColor(...GREY)
    doc.text(`MedVision AI · Demo prototype · Page ${p} of ${pages}`, W / 2, 291, { align: 'center' })
  }
  return doc
}

export async function downloadReportPdf(a: Analysis, patient: Patient | undefined, heatmapUrl: string): Promise<void> {
  const doc = await buildReportPdf(a, patient, heatmapUrl)
  doc.save(reportFileName(a))
}
