from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import zipfile
import os

# --- NEW: Auto-Unzip Logic ---
ZIP_PATH = "models/RandomForest.zip"
EXTRACTED_PATH = "models/RandomForest.joblib"

# Check if the .joblib file exists; if not, try to unzip it
if not os.path.exists(EXTRACTED_PATH):
    if os.path.exists(ZIP_PATH):
        print(f"Unzipping {ZIP_PATH}...")
        with zipfile.ZipFile(ZIP_PATH, 'r') as zip_ref:
            zip_ref.extractall("models/")
        print("Unzip complete.")
    else:
        # If neither file exists, stop the server with an error
        raise FileNotFoundError(f"Model file missing! Could not find {EXTRACTED_PATH} or {ZIP_PATH}")

# Load the model normally
model = joblib.load(EXTRACTED_PATH)
# -----------------------------

app = FastAPI()

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class NewsItem(BaseModel):
    text: str

@app.get("/")
def root():
    return {"message": "API running"}

@app.post("/predict")
def predict(news: NewsItem):
    text = (news.text or "").strip()
    if not text:
        return {"label": "Unknown", "confidence": 0.0}

    # Guard: no known words -> Unknown
    tfidf = model.named_steps.get("tfidf")
    if tfidf is not None:
        X = tfidf.transform([text])
        if X.nnz == 0:
            return {
                "label": "Unknown",
                "confidence": 0.0,
                "note": "No known vocabulary words",
            }

    pred = int(model.predict([text])[0])  # 1=True/Real, 0=Fake (must match training)
    label = "Real" if pred == 1 else "Fake"

    confidence = 1.0
    if hasattr(model, "predict_proba"):
        probs = model.predict_proba([text])[0]
        classes = model.classes_.tolist()
        if pred in classes:
            confidence = float(probs[classes.index(pred)])

    return {"label": label, "confidence": confidence}