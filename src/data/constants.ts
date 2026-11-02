import type { Modality, Role } from '../types'

export const DISCLAIMER_SHORT =
  'This prototype uses simulated AI results for demonstration purposes. Results are not medical diagnoses and must not be used as a substitute for professional medical judgment.'

export const DISCLAIMER_FULL =
  'This prototype is intended for demonstration and research purposes only. AI-generated results are not medical diagnoses and should not be used as a substitute for professional medical judgment. Real-world clinical deployment requires appropriate clinical validation, regulatory compliance, security controls, and qualified healthcare oversight.'

export const MODALITIES: { name: Modality; supported: boolean }[] = [
  { name: 'Chest X-Ray', supported: true },
  { name: 'MRI', supported: true },
  { name: 'CT Scan', supported: false },
  { name: 'Ultrasound', supported: false },
  { name: 'Retinal Image', supported: false },
  { name: 'Skin Image', supported: false },
  { name: 'Other', supported: false },
]

export const PENDING_NOTE = 'Interface available — model integration pending.'

export const ROLE_CAPABILITIES: Record<Role, string[]> = {
  Doctor: ['View patients', 'Upload images', 'Analyze', 'Review', 'Add notes', 'Generate reports'],
  Radiologist: ['Review imaging', 'Review AI output', 'Add interpretation', 'Validate analysis'],
  Administrator: ['View statistics', 'Manage users', 'View model information', 'Manage settings'],
}

export const MODEL_INFO = {
  name: 'MedVision Chest X-Ray Classifier',
  architecture: 'ResNet-based Image Classifier',
  version: 'Demo v1.0',
  mode: 'Simulation',
  explainability: 'Grad-CAM-style visualization',
  dataset: 'Not connected',
}
