import sys
import json

# Primary: PaddleOCR as specified in requirements.txt
try:
    from paddleocr import PaddleOCR
    ocr = PaddleOCR(lang='en')
    def run_ocr(image_path):
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
    # Secondary: RapidOCR (Official ONNX Engine for PaddleOCR PP-OCRv4 models)
    try:
        from rapidocr_onnxruntime import RapidOCR
        engine = RapidOCR()
        def run_ocr(image_path):
            result, _ = engine(image_path)
            if result:
                return [line[1] for line in result]
            return []
    except Exception as r_err:
        def run_ocr(image_path):
            return {"error": f"OCR Engine initialization failed: {p_err} | {r_err}"}

if __name__ == "__main__":
    while True:
        try:
            line = sys.stdin.readline()
            if not line:
                break
            image_path = line.strip()
            if not image_path:
                continue
            
            res = run_ocr(image_path)
            print(json.dumps(res))
            print("END_RESULT")
            sys.stdout.flush()
        except KeyboardInterrupt:
            break
        except Exception as e:
            print(json.dumps({"error": str(e)}))
            print("END_RESULT")
            sys.stdout.flush()
