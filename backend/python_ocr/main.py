import io
import sys
import os
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import numpy as np
import cv2
from PIL import Image

try:
    from paddleocr import PaddleOCR
    ocr = PaddleOCR(lang='en')
except Exception as e:
    ocr = None
    print(f"PaddleOCR Initialization Warning: {e}")

app = FastAPI(title="PaddleOCR 3.0 API Server")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {
        "status": "online",
        "engine": "PaddleOCR 3.0.0",
        "paddlepaddle": "3.1.1",
        "initialized": ocr is not None
    }

@app.post("/ocr")
async def process_ocr(file: UploadFile = File(...)):
    if ocr is None:
        raise HTTPException(status_code=500, detail="PaddleOCR engine not initialized")
    
    try:
        contents = await file.read()
        image = Image.open(io.BytesIO(contents)).convert('RGB')
        img_np = np.array(image)
        img_cv = cv2.cvtColor(img_np, cv2.COLOR_RGB2BGR)

        result = ocr.predict(img_cv)
        lines = []
        if isinstance(result, list) and len(result) > 0 and isinstance(result[0], dict) and "rec_texts" in result[0]:
            lines = result[0]["rec_texts"]
        elif isinstance(result, list) and len(result) > 0:
            for line in result[0]:
                if len(line) >= 2 and line[1]:
                    lines.append(line[1][0] if isinstance(line[1], (tuple, list)) else line[1])

        raw_text = "\n".join(lines)
        return {"rawText": raw_text, "lines": lines}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
