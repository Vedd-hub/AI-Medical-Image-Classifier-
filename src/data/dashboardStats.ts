// Demo dashboard aggregates (fictional; not real hospital statistics).
export const stats = { totalScans: 1284, todayAnalyses: 37, priorityReviews: 6, pendingReviews: 12 }

export const activity = [
  { day: 'Mon', analyses: 28 }, { day: 'Tue', analyses: 34 }, { day: 'Wed', analyses: 31 },
  { day: 'Thu', analyses: 42 }, { day: 'Fri', analyses: 39 }, { day: 'Sat', analyses: 18 }, { day: 'Sun', analyses: 37 },
]
export const resultDistribution = [
  { name: 'Normal', value: 642, color: '#3f8f6b' },
  { name: 'Abnormal', value: 418, color: '#c0473f' },
  { name: 'Needs Review', value: 224, color: '#d19a2a' },
]
export const modalityDistribution = [
  { name: 'X-Ray', value: 612 }, { name: 'CT', value: 268 }, { name: 'MRI', value: 196 },
  { name: 'Ultrasound', value: 132 }, { name: 'Other', value: 76 },
]
export const priorityCases = [
  { level: 'Urgent' as const, studyId: 'ST-8817', patientId: 'PT-1042', reason: 'Model detected patterns requiring earlier human review.', action: 'Radiologist review recommended.' },
  { level: 'Priority' as const, studyId: 'ST-8821', patientId: 'PT-1042', reason: 'Model detected patterns requiring earlier human review.', action: 'Radiologist review recommended.' },
  { level: 'Routine' as const, studyId: 'ST-8820', patientId: 'PT-1043', reason: 'No patterns requiring expedited review were identified.', action: 'Standard review queue.' },
]
