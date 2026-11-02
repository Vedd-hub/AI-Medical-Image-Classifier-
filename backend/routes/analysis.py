from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from services.inference import run_inference

router = APIRouter(tags=["analysis"])


@router.post("/analyze")
async def analyze(file: UploadFile = File(...), modality: str = Form("Chest X-Ray")) -> dict:
    """Returns the same shape as the frontend `AnalysisResult` type."""
    data = await file.read()
    if not data:
        raise HTTPException(status_code=400, detail="Empty file")
    return run_inference(data, modality)
