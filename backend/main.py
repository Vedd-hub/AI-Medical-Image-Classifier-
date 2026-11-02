"""MedVision AI backend (prototype).

Run:  uvicorn main:app --reload --port 8000
The frontend calls POST /api/analyze when VITE_INFERENCE_MODE=real.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database.db import init_db
from routes import analysis, patients

app = FastAPI(title="MedVision AI API", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def _startup() -> None:
    init_db()


@app.get("/api/health")
def health() -> dict:
    return {"status": "ok", "inference": "demo"}


app.include_router(patients.router, prefix="/api")
app.include_router(analysis.router, prefix="/api")
