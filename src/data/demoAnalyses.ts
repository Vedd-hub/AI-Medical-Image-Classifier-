import type { Analysis, AnalysisResult, Modality, Priority, ResultLabel, ReviewStatus } from '../types'

const MODEL_VERSION = 'Demo v1.0'

function result(abnormal: boolean, conf: number, priority: Priority): AnalysisResult {
  return {
    prediction: abnormal ? 'Abnormal Finding' : 'No Abnormality Detected',
    confidence: conf,
    probabilities: abnormal
      ? { normal: +(100 - conf).toFixed(1), abnormal: conf }
      : { normal: conf, abnormal: +(100 - conf).toFixed(1) },
    priority,
    explanation: abnormal
      ? 'The prototype model identified image patterns associated with an abnormal finding.'
      : 'The prototype model did not identify image patterns associated with an abnormal finding.',
    modelVersion: MODEL_VERSION,
    mode: 'demo',
  }
}

function row(
  studyId: string, patientId: string, modality: Modality, date: string,
  abnormal: boolean, conf: number, priority: Priority, review: ReviewStatus,
  label?: ResultLabel,
): Analysis {
  return {
    studyId, patientId, modality, date,
    result: result(abnormal, conf, priority),
    resultLabel: label ?? (abnormal ? 'Abnormal' : 'Normal'),
    reviewStatus: review,
    clinicalNotes: review === 'Reviewed' ? 'Reviewed in context of clinical history. No acute concerns noted on review.' : '',
    finalInterpretation: review === 'Reviewed' ? 'Findings correlated clinically; routine follow-up advised.' : '',
    reviewedBy: review === 'Reviewed' ? 'Dr. Priya Sharma' : undefined,
  }
}

// Fictional demo studies. Values are simulated prototype output.
export const demoAnalyses: Analysis[] = [
  row('ST-8821', 'PT-1042', 'Chest X-Ray', '2026-09-20T09:12:00', true, 91.4, 'Priority', 'Pending Review'),
  row('ST-8820', 'PT-1043', 'Chest X-Ray', '2026-09-19T16:40:00', false, 94.2, 'Routine', 'Reviewed'),
  row('ST-8819', 'PT-1044', 'Chest X-Ray', '2026-09-18T11:05:00', false, 88.7, 'Routine', 'Reviewed'),
  row('ST-8818', 'PT-1045', 'Chest X-Ray', '2026-09-17T14:22:00', true, 78.3, 'Priority', 'Draft', 'Needs Review'),
  row('ST-8817', 'PT-1042', 'CT Scan', '2026-09-16T10:30:00', true, 96.1, 'Urgent', 'Reviewed'),
  row('ST-8816', 'PT-1046', 'MRI', '2026-09-15T09:48:00', false, 90.2, 'Routine', 'Reviewed'),
  row('ST-8815', 'PT-1047', 'Chest X-Ray', '2026-09-14T15:10:00', true, 84.9, 'Priority', 'Pending Review'),
  row('ST-8814', 'PT-1048', 'Ultrasound', '2026-09-12T13:00:00', false, 92.5, 'Routine', 'Reviewed'),
  row('ST-8813', 'PT-1048', 'Chest X-Ray', '2026-09-11T08:35:00', true, 73.6, 'Priority', 'Pending Review', 'Needs Review'),
  row('ST-8812', 'PT-1049', 'Chest X-Ray', '2026-09-10T12:15:00', false, 95.0, 'Routine', 'Reviewed'),
  row('ST-8811', 'PT-1043', 'Retinal Image', '2026-09-08T10:00:00', false, 89.1, 'Routine', 'Reviewed'),
  row('ST-8810', 'PT-1045', 'Chest X-Ray', '2026-09-05T16:20:00', true, 87.8, 'Priority', 'Reviewed'),
]
