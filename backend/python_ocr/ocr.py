import sys
import json

def get_ocr_engine():
    try:
        from paddleocr import PaddleOCR
        ocr = PaddleOCR(use_angle_cls=True, lang='en', show_log=False)
        def run_ocr(image_path):
            res = ocr.ocr(image_path, cls=True)
            lines = []
            if res and isinstance(res, list):
                for page in res:
                    if page:
                        for line in page:
                            if len(line) >= 2 and line[1]:
                                text = line[1][0] if isinstance(line[1], (tuple, list)) else line[1]
                                if text:
                                    lines.append(str(text))
            return lines
        return run_ocr
    except Exception:
        pass

    try:
        from rapidocr_onnxruntime import RapidOCR
        engine = RapidOCR()
        def run_ocr(image_path):
            res, _ = engine(image_path)
            lines = []
            if res:
                for line in res:
                    if len(line) >= 2 and line[1]:
                        text = line[1]
                        if text:
                            lines.append(str(text))
            return lines
        return run_ocr
    except Exception as e:
        def run_ocr(image_path):
            return {"error": f"OCR Engine initialization failed: {str(e)}"}
        return run_ocr

run_ocr = get_ocr_engine()

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
