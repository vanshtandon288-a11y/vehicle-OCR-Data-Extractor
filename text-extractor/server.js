const multer = require("multer");
const path = require("path");
const express = require("express");
const sharp = require("sharp");
const fs = require("fs");
const { spawn } = require("child_process");
const {
  extractRCData,
  extractInsuranceData,
  extractPUCData,
  extractPermitData,
  extractFitnessData,
} = require("./index");

if (!fs.existsSync("uploads")) fs.mkdirSync("uploads", { recursive: true });
if (!fs.existsSync("processed")) fs.mkdirSync("processed", { recursive: true });

const pythonExec = process.platform === "win32" ? "python" : "python3";
const python = spawn(pythonExec, ["ocr.py"]);

python.stderr.on("data", (data) => {
  console.error("Python OCR Error Log:", data.toString());
});

const app = express();

app.use(express.static("public"));
app.use(express.json());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

const dbFile = "documents_db.json";
function getDb() {
  if (fs.existsSync(dbFile)) {
    try { return JSON.parse(fs.readFileSync(dbFile, "utf-8")); } catch (e) {}
  }
  return [];
}
function saveDb(docs) {
  fs.writeFileSync(dbFile, JSON.stringify(docs, null, 2));
}

async function handleDocumentProcessing(req, res) {
  try {
    const fileObj = req.file || (req.files && req.files[0]);
    console.log("Document Type:", req.body.documentType);
    console.log("FILE RECEIVED:", fileObj);
    if (!fileObj) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    console.log("IMAGE PATH", fileObj.path);

    const ext = path.extname(fileObj.originalname).toLowerCase();
    let filePath = fileObj.path;

    if ([".jpg", ".jpeg", ".png", ".webp"].includes(ext)) {
      const resizedPath = "processed/" + Date.now() + ".jpg";
      await sharp(fileObj.path)
        .resize({
          width: 2400,
          withoutEnlargement: false,
        })
        .sharpen()
        .normalise()
        .jpeg({ quality: 95 })
        .toFile(resizedPath);
      filePath = resizedPath;
    } else if (ext === ".pdf") {
      filePath = fileObj.path;
    }

    console.log("FILE_PATH FOR OCR:", filePath);

    let output = "";
    python.stdin.write(filePath + "\n");

    await new Promise((resolve) => {
      const handler = (data) => {
        output += data.toString();
        if (output.includes("END_RESULT")) {
          python.stdout.off("data", handler);
          resolve();
        }
      };
      python.stdout.on("data", handler);
    });

    output = output.replace("END_RESULT", "").trim();
    console.log("RAW OCR OUTPUT:", output);
    let ocrText = [];
    try {
      ocrText = JSON.parse(output);
    } catch (e) {
      ocrText = [output];
    }

    const text = Array.isArray(ocrText) ? ocrText.join("\n") : String(ocrText);
    console.log("PARSED OCR TEXT:\n", text);

    const documentType = req.body.documentType || "rc";
    console.log("DOCUMENT TYPE = ", documentType);
    let extractedPayload = {};

    if (documentType === "rc") {
      extractedPayload = await extractRCData(text);
    } else if (documentType === "insurance") {
      extractedPayload = await extractInsuranceData(text);
    } else if (documentType === "puc") {
      extractedPayload = await extractPUCData(text);
    } else if (documentType === "permit") {
      extractedPayload = await extractPermitData(text);
    } else if (documentType === "fitness") {
      extractedPayload = await extractFitnessData(text);
    }

    console.log("EXTRACTED PAYLOAD =", extractedPayload);

    const docRecord = {
      id: "doc_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
      originalName: fileObj.originalname,
      fileName: path.basename(fileObj.path),
      filePath: fileObj.path,
      processedFilePath: filePath,
      mimeType: fileObj.mimetype,
      fileSize: fileObj.size,
      documentType,
      status: "COMPLETED",
      rawText: text,
      ocrEngineUsed: "PaddleOCR 3.0",
      extractedData: {
        id: "ext_" + Date.now(),
        documentId: "doc_" + Date.now(),
        ...extractedPayload,
        isChassisValid: extractedPayload.chassisNumber ? true : false,
        isEngineValid: extractedPayload.engineNumber ? true : false,
        isRegistrationValid: extractedPayload.registrationNumber ? true : false,
        isInsuranceNumberValid: extractedPayload.insuranceNumber ? true : false,
        isPucNumberValid: extractedPayload.pucNumber ? true : false,
        isPermitNumberValid: extractedPayload.permitNumber ? true : false,
        validationErrors: "[]",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const docs = getDb();
    docs.unshift(docRecord);
    saveDb(docs);

    res.json({
      ...docRecord,
      extractedData: docRecord.extractedData,
      rawText: text,
    });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: err.message, message: err.message });
  }
}

app.post("/upload", upload.any(), handleDocumentProcessing);
app.post("/api/documents/upload", upload.any(), handleDocumentProcessing);

app.get("/api/documents", (req, res) => {
  let docs = getDb();
  const { documentType, search, page = 1, limit = 10 } = req.query;

  if (documentType && documentType !== "all") {
    docs = docs.filter((d) => d.documentType === documentType);
  }
  if (search) {
    const q = search.toLowerCase();
    docs = docs.filter(
      (d) =>
        d.originalName.toLowerCase().includes(q) ||
        (d.rawText && d.rawText.toLowerCase().includes(q)),
    );
  }

  const p = parseInt(page);
  const l = parseInt(limit);
  const startIndex = (p - 1) * l;
  const paginated = docs.slice(startIndex, startIndex + l);

  res.json({
    data: paginated,
    total: docs.length,
    page: p,
    totalPages: Math.ceil(docs.length / l) || 1,
  });
});

app.get("/api/documents/stats/summary", (req, res) => {
  const docs = getDb();
  const byType = { rc: 0, insurance: 0, puc: 0, permit: 0, fitness: 0 };
  docs.forEach((d) => {
    if (byType[d.documentType] !== undefined) byType[d.documentType]++;
  });
  res.json({
    totalProcessed: docs.length,
    successRate: docs.length > 0 ? 100 : 100,
    byType,
    statusBreakdown: { completed: docs.length, failed: 0, processing: 0 },
  });
});

app.get("/api/documents/:id", (req, res) => {
  const docs = getDb();
  const doc = docs.find((d) => d.id === req.params.id);
  if (!doc) return res.status(404).json({ error: "Document not found" });
  res.json(doc);
});

app.patch("/api/documents/:id", (req, res) => {
  const docs = getDb();
  const idx = docs.findIndex((d) => d.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Document not found" });
  
  docs[idx].extractedData = {
    ...docs[idx].extractedData,
    ...req.body,
    updatedAt: new Date().toISOString(),
  };
  saveDb(docs);
  res.json(docs[idx]);
});

app.delete("/api/documents/:id", (req, res) => {
  let docs = getDb();
  docs = docs.filter((d) => d.id !== req.params.id);
  saveDb(docs);
  res.json({ success: true, message: "Deleted document" });
});

app.get("/api/documents/file/:filename", (req, res) => {
  const filename = req.params.filename;
  const p1 = path.join(__dirname, "uploads", filename);
  const p2 = path.join(__dirname, "processed", filename);
  if (fs.existsSync(p1)) return res.sendFile(p1);
  if (fs.existsSync(p2)) return res.sendFile(p2);
  res.status(404).send("File not found");
});

app.listen(3000, () => {
  console.log("🚀 High-Precision Sharp & PaddleOCR Server running on port 3000!");
});
