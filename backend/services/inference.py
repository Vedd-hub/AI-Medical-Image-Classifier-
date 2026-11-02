"""Real inference service for the two trained Keras (MobileNetV2) classifiers.

    Chest X-Ray -> models/xray_model.keras  (NORMAL, PNEUMONIA)
    MRI         -> models/mri_model.keras   (glioma, meningioma, notumor, pituitary)

The saved models already contain MobileNetV2 preprocessing, so they take raw
0-255 RGB 224x224 input. Heatmaps are real Grad-CAM computed on the last
convolutional block of the MobileNetV2 backbone.
"""
import base64
import io
import json
import os
from functools import lru_cache
from pathlib import Path

os.environ.setdefault("TF_CPP_MIN_LOG_LEVEL", "2")

import numpy as np  # noqa: E402
import tensorflow as tf  # noqa: E402
from PIL import Image, ImageOps  # noqa: E402

MODEL_DIR = Path(__file__).resolve().parent.parent / "models"
IMG_SIZE = (224, 224)
LOW_CONFIDENCE = 70.0  # % — below this the result is flagged for closer review

MODALITY_KEY = {"Chest X-Ray": "xray", "MRI": "mri"}
# Label shown to clinicians for each model class.
DISPLAY = {
    "NORMAL": "Normal",
    "PNEUMONIA": "Pneumonia pattern",
    "glioma": "Glioma pattern",
    "meningioma": "Meningioma pattern",
    "notumor": "No tumour pattern",
    "pituitary": "Pituitary tumour pattern",
}
NORMAL_CLASS = {"xray": "NORMAL", "mri": "notumor"}
MODEL_NAME = {"xray": "MobileNetV2 Chest X-Ray Classifier", "mri": "MobileNetV2 Brain MRI Classifier"}


class UnsupportedModality(ValueError):
    pass


class InvalidImage(ValueError):
    pass


class _Bundle:
    def __init__(self, key: str) -> None:
        self.key = key
        self.model = tf.keras.models.load_model(MODEL_DIR / f"{key}_model.keras", compile=False)
        self.classes: list[str] = json.loads((MODEL_DIR / f"{key}_class_names.json").read_text())
        self.base = self.model.get_layer("mobilenetv2_1.00_224")
        self.head = [self.model.get_layer(n) for n in ("global_average_pooling2d", "dense")]
        # Warm-up so the first request is not slow.
        self.model.predict(np.zeros((1, *IMG_SIZE, 3), dtype="float32"), verbose=0)

    def predict(self, x: np.ndarray) -> np.ndarray:
        return self.model.predict(x, verbose=0)[0]

    def gradcam(self, x: np.ndarray, class_idx: int) -> np.ndarray:
        """Grad-CAM for `class_idx`, returned as a [0,1] map at feature-map resolution."""
        pre = tf.constant(x / 127.5 - 1.0)  # MobileNetV2 preprocess_input
        with tf.GradientTape() as tape:
            conv = self.base(pre, training=False)
            tape.watch(conv)
            pooled = self.head[0](conv)
            score = self.head[1](pooled)[:, class_idx]
        grads = tape.gradient(score, conv)
        weights = tf.reduce_mean(grads, axis=(1, 2))
        cam = tf.nn.relu(tf.reduce_sum(conv * weights[:, None, None, :], axis=-1))[0].numpy()
        peak = cam.max()
        return cam / peak if peak > 0 else cam


@lru_cache(maxsize=None)
def _bundle(key: str) -> _Bundle:
    return _Bundle(key)


def preload() -> None:
    for key in MODALITY_KEY.values():
        _bundle(key)


def _jet(v: np.ndarray) -> np.ndarray:
    r = np.clip(1.5 - np.abs(4 * v - 3), 0, 1)
    g = np.clip(1.5 - np.abs(4 * v - 2), 0, 1)
    b = np.clip(1.5 - np.abs(4 * v - 1), 0, 1)
    return np.stack([r, g, b], axis=-1)


def _overlay(original: Image.Image, cam: np.ndarray) -> str:
    base = original.copy()
    base.thumbnail((768, 768))
    cam_img = Image.fromarray((cam * 255).astype("uint8")).resize(base.size, Image.BICUBIC)
    heat = np.asarray(cam_img, dtype="float32") / 255.0
    color = _jet(heat) * 255
    alpha = (np.clip(heat, 0, 1) ** 0.8 * 0.55)[..., None]  # low-attention areas stay transparent
    out = np.asarray(base, dtype="float32") * (1 - alpha) + color * alpha
    buf = io.BytesIO()
    Image.fromarray(out.astype("uint8")).save(buf, format="PNG")
    return "data:image/png;base64," + base64.b64encode(buf.getvalue()).decode()


def _load(data: bytes) -> Image.Image:
    try:
        img = Image.open(io.BytesIO(data))
        img = ImageOps.exif_transpose(img)
        if img.mode in ("I;16", "I", "F"):
            arr = np.asarray(img, dtype="float32")
            arr = (arr - arr.min()) / max(float(arr.max() - arr.min()), 1e-6) * 255
            img = Image.fromarray(arr.astype("uint8"))
        return img.convert("RGB")
    except Exception as exc:  # noqa: BLE001
        raise InvalidImage("The file could not be read as an image.") from exc


def run_inference(data: bytes, modality: str) -> dict:
    key = MODALITY_KEY.get(modality)
    if key is None:
        raise UnsupportedModality(f"No trained model is available for '{modality}'.")
    bundle = _bundle(key)

    original = _load(data)
    x = np.asarray(original.resize(IMG_SIZE, Image.BILINEAR), dtype="float32")[None]
    probs = bundle.predict(x)
    top = int(np.argmax(probs))
    top_name = bundle.classes[top]
    confidence = float(probs[top]) * 100

    normal_p = float(probs[bundle.classes.index(NORMAL_CLASS[key])]) * 100
    abnormal_p = 100 - normal_p
    is_normal = top_name == NORMAL_CLASS[key]
    low = confidence < LOW_CONFIDENCE

    if low:
        prediction = "Inconclusive — needs review"
    elif is_normal:
        prediction = "No Abnormality Detected"
    else:
        prediction = f"Possible {DISPLAY[top_name]}"

    if is_normal and not low:
        priority = "Routine"
    else:
        priority = "Priority"

    if low:
        explanation = (
            f"The model's top class ({DISPLAY[top_name]}) had a confidence of only {confidence:.1f}%. "
            "The result is inconclusive and the image should be reviewed carefully by a clinician."
        )
    elif is_normal:
        explanation = f"The model did not identify image patterns associated with an abnormal finding ({modality})."
    else:
        explanation = (
            f"The model identified image patterns it associates with: {DISPLAY[top_name].lower()}. "
            "The highlighted regions show where the model focused. This is a screening aid, not a diagnosis."
        )

    heatmap = None
    try:
        heatmap = _overlay(original, bundle.gradcam(x, top))
    except Exception:  # noqa: BLE001 — heatmap is optional; never fail the prediction over it
        heatmap = None

    return {
        "prediction": prediction,
        "confidence": round(confidence, 1),
        "probabilities": {"normal": round(normal_p, 1), "abnormal": round(abnormal_p, 1)},
        "classProbabilities": [
            {"label": DISPLAY[c], "value": round(float(p) * 100, 1)} for c, p in zip(bundle.classes, probs)
        ],
        "priority": priority,
        "explanation": explanation,
        "heatmapUrl": heatmap,
        "modelVersion": f"{MODEL_NAME[key]} (Keras)",
        "mode": "real",
    }
