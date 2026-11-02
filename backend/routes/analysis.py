from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from fastapi.concurrency import run_in_threadpool

from services.inference import InvalidImage, UnsupportedModality, run_inference

router = APIRouter(tags=["analysis"])

MAX_BYTES = 25 * 1024 * 1024


@router.post("/analyze")
async def analyze(file: UploadFile = File(...), modality: str = Form("Chest X-Ray")) -> dict:
    """Returns the same shape as the frontend `AnalysisResult` type."""
    data = await file.read()
    if not data:
        raise HTTPException(status_code=400, detail="Empty file")
    if len(data) > MAX_BYTES:
        raise HTTPException(status_code=413, detail="File too large")
    try:
        return await run_in_threadpool(run_inference, data, modality)
    except UnsupportedModality as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except InvalidImage as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
