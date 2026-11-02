export type Role = 'Doctor' | 'Radiologist' | 'Administrator'
export type Modality = 'Chest X-Ray' | 'MRI' | 'CT Scan' | 'Ultrasound' | 'Retinal Image' | 'Skin Image' | 'Other'
export type Priority = 'Routine' | 'Priority' | 'Urgent'
export type ReviewStatus = 'Pending Review' | 'Draft' | 'Reviewed'
export type PatientStatus = 'Active' | 'Follow-up' | 'Discharged'
export type ResultLabel = 'Normal' | 'Abnormal' | 'Needs Review'

export interface User {
  name: string
  email: string
  role: Role
}

export interface Patient {
  id: string
  name: string
  age: number
  gender: 'Male' | 'Female' | 'Other'
  contact: string
  notes: string
  lastExam: string
  studies: number
  status: PatientStatus
}

export interface AnalysisResult {
  prediction: string
  confidence: number
  probabilities: { normal: number; abnormal: number }
  /** Per-class probabilities from a real multi-class model (percent). */
  classProbabilities?: { label: string; value: number }[]
  priority: Priority
  explanation: string
  heatmapUrl?: string
  modelVersion: string
  mode: 'demo' | 'real'
}

export interface Analysis {
  studyId: string
  patientId: string
  modality: Modality
  date: string // ISO
  result: AnalysisResult
  resultLabel: ResultLabel
  reviewStatus: ReviewStatus
  clinicalNotes: string
  finalInterpretation: string
  reviewedBy?: string
  imageUrl?: string
  fileName?: string
}

export interface Report {
  id: string
  studyId: string
  patientId: string
  generatedAt: string
  reviewedBy: string
  status: 'Final' | 'Draft'
}

export interface Toast {
  id: number
  kind: 'success' | 'error' | 'info'
  message: string
}
