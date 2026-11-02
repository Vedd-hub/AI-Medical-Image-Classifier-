import type { Patient } from '../types'

// Fictional demo records only — no real patient information.
export const demoPatients: Patient[] = [
  { id: 'PT-1042', name: 'Aarav Sharma', age: 45, gender: 'Male', contact: '+91 90000 10042', notes: 'Persistent cough, 3 weeks.', lastExam: '2026-09-20', studies: 3, status: 'Follow-up' },
  { id: 'PT-1043', name: 'Ananya Verma', age: 52, gender: 'Female', contact: '+91 90000 10043', notes: 'Routine annual screening.', lastExam: '2026-09-19', studies: 2, status: 'Active' },
  { id: 'PT-1044', name: 'Rohan Mehta', age: 38, gender: 'Male', contact: '+91 90000 10044', notes: 'Pre-employment chest imaging.', lastExam: '2026-09-18', studies: 1, status: 'Active' },
  { id: 'PT-1045', name: 'Kavya Iyer', age: 61, gender: 'Female', contact: '+91 90000 10045', notes: 'History of asthma.', lastExam: '2026-09-17', studies: 4, status: 'Follow-up' },
  { id: 'PT-1046', name: 'Vikram Nair', age: 29, gender: 'Male', contact: '+91 90000 10046', notes: 'Sports injury assessment.', lastExam: '2026-09-15', studies: 1, status: 'Discharged' },
  { id: 'PT-1047', name: 'Meera Kapoor', age: 47, gender: 'Female', contact: '+91 90000 10047', notes: 'Shortness of breath on exertion.', lastExam: '2026-09-14', studies: 2, status: 'Active' },
  { id: 'PT-1048', name: 'Arjun Singh', age: 66, gender: 'Male', contact: '+91 90000 10048', notes: 'Post-treatment follow-up.', lastExam: '2026-09-12', studies: 5, status: 'Follow-up' },
  { id: 'PT-1049', name: 'Diya Patel', age: 34, gender: 'Female', contact: '+91 90000 10049', notes: 'Routine screening.', lastExam: '2026-09-10', studies: 1, status: 'Discharged' },
]
