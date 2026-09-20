import sys
import json

# Primary: PaddleOCR as defined in internship code
try:
    from paddleocr import PaddleOCR
    ocr = PaddleOCR(lang='en')
    def run_paddle_ocr(image_path):
        result = ocr.predict(image_path)
        if isinstance(result, list) and len(result) > 0 and isinstance(result[0], dict) and "rec_texts" in result[0]:
            return result[0]["rec_texts"]
        elif isinstance(result, list) and len(result) > 0:
            lines = []
            for line in result[0]:
                if len(line) >= 2 and line[1]:
                    lines.append(line[1][0] if isinstance(line[1], (tuple, list)) else line[1])
            return lines
        return []
except Exception as p_err:
    # Secondary: RapidOCR (Official ONNX Engine for PaddleOCR models PP-OCRv4/v3)
    try:
        from rapidocr_onnxruntime import RapidOCR
        engine = RapidOCR()
        def run_paddle_ocr(image_path):
            result, _ = engine(image_path)
            if result:
                return [line[1] for line in result]
            return []
    except Exception as r_err:
        def run_paddle_ocr(image_path):
            return {"error": f"PaddleOCR/RapidOCR engine initialization error: {p_err} | {r_err}"}

while True:
    image_path = sys.stdin.readline().strip()
    if not image_path:
        continue
    try:
        texts = run_paddle_ocr(image_path)
        print(json.dumps(texts))
        print("END_RESULT")
        sys.stdout.flush()
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        print("END_RESULT")
        sys.stdout.flush()
