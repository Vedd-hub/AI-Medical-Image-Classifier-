import type { AnalysisResult, Modality } from '../types'
import { hashString } from '../utils/format'
import { generateDemoHeatmap } from './heatmap'

/**
 * AI service abstraction. The UI only ever calls `runInference()`.
 * To go live: implement `runRealInference()` (POST the image to the FastAPI
 * backend, return the same AnalysisResult shape) and set VITE_INFERENCE_MODE=real.
 */

export interface InferenceInput {
  imageUrl: string
  file?: File
  modality: Modality
}

export const PROCESSING_STAGES = [
  'Image received',
  'Image validation',
  'Preprocessing',
  'Feature extraction',
  'Classification',
  'Explainability',
  'Preparing report',
] as const

export type StageCallback = (stageIndex: number, progress: number) => void

const MODE = (import.meta.env.VITE_INFERENCE_MODE as string | undefined) === 'real' ? 'real' : 'demo'
const API_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:8000'

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

/** Controlled simulated output. Even hash → abnormal case, odd → normal case. */
export async function runDemoInference(input: InferenceInput, onStage?: StageCallback): Promise<AnalysisResult> {
  const seedKey = `${input.file?.name ?? input.imageUrl}:${input.file?.size ?? 0}`
  const seed = hashString(seedKey)
  const abnormal = seed % 2 === 0

  const stageMs = [350, 450, 550, 750, 650, 700, 450] // ≈ 3.9 s total
  for (let i = 0; i < PROCESSING_STAGES.length; i++) {
    onStage?.(i, 0)
    const steps = 5
    for (let s = 1; s <= steps; s++) {
      await sleep(stageMs[i] / steps)
      onStage?.(i, s / steps)
    }
  }

  const confidence = abnormal ? 91.4 : 94.2
  const heatmapUrl = await generateDemoHeatmap(input.imageUrl, seed, abnormal)
  return {
    prediction: abnormal ? 'Abnormal Finding' : 'No Abnormality Detected',
    confidence,
    probabilities: abnormal
      ? { normal: 8.6, abnormal: 91.4 }
      : { normal: 94.2, abnormal: 5.8 },
    priority: abnormal ? 'Priority' : 'Routine',
    explanation: abnormal
      ? 'The prototype model identified image patterns associated with an abnormal finding.'
      : 'The prototype model did not identify image patterns associated with an abnormal finding.',
    heatmapUrl,
    modelVersion: 'Demo v1.0',
    mode: 'demo',
  }
}

/** Placeholder for the future PyTorch-backed FastAPI endpoint. */
export async function runRealInference(input: InferenceInput, onStage?: StageCallback): Promise<AnalysisResult> {
  if (!input.file) throw new Error('A file is required for real inference')
  onStage?.(0, 1)
  const body = new FormData()
  body.append('file', input.file)
  body.append('modality', input.modality)
  const res = await fetch(`${API_URL}/api/analyze`, { method: 'POST', body })
  if (!res.ok) throw new Error(`Inference service returned ${res.status}`)
  onStage?.(PROCESSING_STAGES.length - 1, 1)
  return (await res.json()) as AnalysisResult
}

export function runInference(input: InferenceInput, onStage?: StageCallback): Promise<AnalysisResult> {
  return MODE === 'real' ? runRealInference(input, onStage) : runDemoInference(input, onStage)
}

export const inferenceMode = MODE
