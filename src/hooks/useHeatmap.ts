import { useEffect, useState } from 'react'
import type { Analysis } from '../types'
import { generateDemoHeatmap } from '../services/heatmap'
import { phantomImage } from '../services/phantom'
import { hashString } from '../utils/format'

/** Resolves the base image and the (simulated) explainability overlay for a study. */
export function useHeatmap(a: Analysis | undefined) {
  const base = a ? (a.imageUrl ?? phantomImage(a.studyId)) : undefined
  const [heat, setHeat] = useState<string | undefined>(a?.result.heatmapUrl)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    if (!a || !base) return
    if (a.result.heatmapUrl) { setHeat(a.result.heatmapUrl); return }
    let live = true
    setFailed(false)
    generateDemoHeatmap(base, hashString(a.studyId), a.result.probabilities.abnormal > a.result.probabilities.normal)
      .then((u) => live && setHeat(u))
      .catch(() => live && setFailed(true))
    return () => { live = false }
  }, [a?.studyId, a?.result.heatmapUrl, base]) // eslint-disable-line react-hooks/exhaustive-deps

  return { base, heat, failed, isPlaceholder: !!a && !a.imageUrl }
}
