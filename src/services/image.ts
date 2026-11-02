export const ACCEPTED_EXT = ['jpg', 'jpeg', 'png', 'dcm']
export const MAX_BYTES = 25 * 1024 * 1024

export interface ImageValidation {
  ok: boolean
  error?: string
  width?: number
  height?: number
  checks: { label: string; pass: boolean }[]
  /** DICOM passes the workflow check but cannot be previewed in the browser. */
  isDicom: boolean
}

export function extOf(name: string): string {
  return name.split('.').pop()?.toLowerCase() ?? ''
}

export function measureImage(url: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight })
    img.onerror = () => reject(new Error('Image could not be decoded'))
    img.src = url
  })
}

/** Validates a local file without sending it anywhere. */
export async function validateImage(file: File, url: string): Promise<ImageValidation> {
  const ext = extOf(file.name)
  if (!ACCEPTED_EXT.includes(ext)) {
    return { ok: false, isDicom: false, error: `Unsupported file type ".${ext || 'unknown'}". Use JPG, PNG or DICOM.`, checks: [{ label: 'Format supported', pass: false }] }
  }
  if (file.size === 0) return { ok: false, isDicom: false, error: 'The file is empty.', checks: [{ label: 'File not empty', pass: false }] }
  if (file.size > MAX_BYTES) return { ok: false, isDicom: false, error: 'File exceeds the 25 MB prototype limit.', checks: [{ label: 'Size within limit', pass: false }] }
  if (ext === 'dcm') {
    return { ok: false, isDicom: true, error: 'DICOM is shown for workflow purposes only — a dedicated DICOM pipeline is required to render it. Please use a JPG or PNG export for this demo.', checks: [{ label: 'Format recognised (DICOM)', pass: true }, { label: 'Preview available', pass: false }] }
  }
  try {
    const { width, height } = await measureImage(url)
    const res = width >= 128 && height >= 128
    return {
      ok: res, isDicom: false, width, height,
      error: res ? undefined : 'Resolution too low (minimum 128 × 128 px).',
      checks: [
        { label: 'Resolution acceptable', pass: res },
        { label: 'Format supported', pass: true },
        { label: 'Image loaded successfully', pass: true },
      ],
    }
  } catch {
    return { ok: false, isDicom: false, error: 'This file could not be read as an image.', checks: [{ label: 'Image loaded successfully', pass: false }] }
  }
}
