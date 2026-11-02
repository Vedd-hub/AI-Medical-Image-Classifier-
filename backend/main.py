"""MedVision AI backend (prototype).

Run:  uvicorn main:app --reload --port 8000
The frontend calls POST /api/analyze when VITE_INFERENCE_MODE=real.
"""
import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database.db import init_db
from routes import analysis, patients
from services.inference import preload

app = FastAPI(title="MedVision AI API", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in os.environ.get("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173").split(",")],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def _startup() -> None:
    init_db()
    preload()


@app.get("/api/health")
def health() -> dict:
    return {"status": "ok", "inference": "real"}


app.include_router(patients.router, prefix="/api")
app.include_router(analysis.router, prefix="/api")
