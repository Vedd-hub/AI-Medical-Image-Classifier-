"""Inference service. Swap `_demo` for a PyTorch model + Grad-CAM later.

Future pipeline:
    image bytes -> Pillow/OpenCV preprocessing -> PyTorch model -> softmax
    -> Grad-CAM heatmap (base64 PNG) -> priority rule -> AnalysisResult
"""
import hashlib


def _demo(data: bytes) -> dict:
    abnormal = int(hashlib.sha256(data).hexdigest(), 16) % 2 == 0
    conf = 91.4 if abnormal else 94.2
    return {
        "prediction": "Abnormal Finding" if abnormal else "No Abnormality Detected",
        "confidence": conf,
        "probabilities": {"normal": round(100 - conf, 1), "abnormal": conf}
        if abnormal
        else {"normal": conf, "abnormal": round(100 - conf, 1)},
        "priority": "Priority" if abnormal else "Routine",
        "explanation": "Simulated prototype output.",
        "modelVersion": "Demo v1.0",
        "mode": "demo",
    }


def run_inference(data: bytes, modality: str) -> dict:
    # TODO: load the trained model once at import time and call it here.
    return _demo(data)
