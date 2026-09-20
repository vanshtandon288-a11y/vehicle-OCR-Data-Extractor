const { createWorker } = require('C:/Users/vansh/vehicle-doc-ocr-system/backend/node_modules/tesseract.js');
const os = require('os');

async function test() {
  console.log("Starting Tesseract test without custom langPath...");
  const start = Date.now();
  try {
    const worker = await createWorker('eng', 1, {
      cachePath: os.tmpdir(),
      logger: m => console.log(m)
    });
    console.log("Worker created in", Date.now() - start, "ms");
    const ret = await worker.recognize('C:/Users/vansh/.gemini/antigravity/brain/a2f6e4cd-014d-4834-ac45-cd2922a90911/.user_uploaded/media_1789547607801.webp');
    console.log("OCR DONE IN", Date.now() - start, "ms");
    console.log("TEXT:\n", ret.data.text);
    await worker.terminate();
  } catch(e) {
    console.error("Worker error:", e);
  }
}

test();
