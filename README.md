# MedVision AI — AI-Assisted Medical Image Analysis

A college-project prototype of a healthcare SaaS for AI-assisted medical image screening.

> **DEMO MODE.** All patients are fictional and all AI output is simulated. Nothing here is a medical diagnosis.

```
Medical Image → AI Analysis → Explainable Result → Human Medical Review → Structured Report
```

## Features
- Landing page, simulated login (Doctor / Radiologist / Administrator, role-aware UI)
- Dashboard with demo statistics, Recharts charts, AI priority screening (suggestions only)
- Patient management: search, filter, add patient, patient profile with exam history
- 5-step analysis workflow: patient → modality → upload (drag & drop, validation, viewer with zoom/fullscreen) → animated processing → result
- Result page: AI prediction vs. **Doctor's Final Interpretation**, probabilities, simulated attention map, priority suggestion, model card
- Doctor review (save draft / mark reviewed), report preview and **PDF export** (`MedVision_Report_<PT>_<ST>.pdf`)
- History (search + 4 filters), Reports, Model Information, Settings
- Toasts, skeleton loaders, empty/error states, responsive layout with mobile drawer, keyboard/ARIA support

## Architecture
```
src/
  components/   reusable UI (Sidebar, ImageViewer, UploadZone, ProbabilityChart, DoctorReview, ReportPreview…)
  pages/        route screens (lazy loaded)
  layouts/      authenticated shell
  context/      AppContext (users, patients, analyses, reports, toasts)
  services/     aiService (inference abstraction), heatmap, image validation, reportPdf, phantom
  data/         centralised fictional demo data + constants
backend/        FastAPI + SQLite skeleton (optional in demo mode)
```
The frontend is fully functional without the backend; state lives in memory for the session.

## Demo AI Mode
`src/services/aiService.ts` exposes `runInference(input, onStage)`, which dispatches on `VITE_INFERENCE_MODE`:
- `demo` → `runDemoInference()`: deterministic (hash of file name + size), staged ~4 s processing, fixed illustrative values (91.4 % abnormal / 94.2 % normal case).
- `real` → `runRealInference()`: POSTs the file to `POST {VITE_API_URL}/api/analyze` and expects the `AnalysisResult` shape.

The attention overlay comes from `generateDemoHeatmap()` (`services/heatmap.ts`): seeded blobs, **not** model-derived, and labelled *Simulated* everywhere.
Demo records without an uploaded file use a procedurally drawn placeholder (`services/phantom.ts`), not a real scan.

## Real model integration
The trained classifiers (from the separate model repository, Keras 2.14 / MobileNetV2) live in `backend/models/`:
- **Chest X-Ray** — `NORMAL` / `PNEUMONIA`
- **MRI (brain)** — `glioma` / `meningioma` / `notumor` / `pituitary`

`backend/services/inference.py` loads them once at startup, runs inference and computes a real **Grad-CAM** map; `POST /api/analyze` selects the model from the chosen modality. Low-confidence (<70 %) results are returned as *Inconclusive — needs review*. Other modalities return HTTP 400.

Run it (the models need TensorFlow 2.14, i.e. Python 3.9-3.11):
```bash
cd backend
py -3.10 -m venv .venv && .venv/Scripts/pip install -r requirements.txt
.venv/Scripts/python -m uvicorn main:app --port 8000
```
then set `VITE_INFERENCE_MODE=real` (e.g. in `.env.local`) and restart `npm run dev`. The deployed Vercel site stays in demo mode because the backend is not hosted there.

No accuracy figures are claimed: the models were trained by the project team and have not been clinically validated; they may give confident but wrong output on images unlike their training data.

## Dataset integration
Training code and data details live in the model repository. Populate the Model page metrics from its real evaluation output.

## Running locally
```bash
npm install
npm run dev          # http://localhost:5173
npm run build        # type-check + production build
```
Optional backend:
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```
Sign in with any email (valid format) and any password of 4+ characters; pick a role.

## Environment variables
See `.env.example`: `VITE_INFERENCE_MODE` (`demo` | `real`), `VITE_API_URL`.

## Tech stack
React 19, TypeScript, Vite, Tailwind CSS 4, React Router, Recharts, Lucide, jsPDF; FastAPI + SQLite (skeleton). Planned: PyTorch, OpenCV, Pillow, Grad-CAM.

## Medical disclaimer
This prototype is intended for demonstration and research purposes only. AI-generated results are not medical diagnoses and should not be used as a substitute for professional medical judgment. Real-world clinical deployment requires appropriate clinical validation, regulatory compliance, security controls, and qualified healthcare oversight.

## Future development
Real DICOM pipeline, persistent backend storage, real authentication and RBAC, audit logging, real model + evaluation, dark theme, i18n.
