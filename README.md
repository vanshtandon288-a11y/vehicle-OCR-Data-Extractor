# Vehicle Document OCR & Structured Data Extraction System

An end-to-end full-stack Enterprise Solution for automated document classification, optical character recognition (OCR), regex-based field extraction, and data validation for vehicle compliance documents: **RC (Registration Certificate)**, **Insurance Policy**, **PUC (Pollution Under Control)**, **Goods Permit**, and **Fitness Certificate**.

---

## Technical Stack & Architecture

### Backend
- **Framework**: NestJS (TypeScript, Node.js)
- **Database ORM**: TypeORM supporting **MySQL** (production) and **SQLite** (offline development/testing fallback)
- **Validation**: `class-validator` & `class-transformer`
- **File Preprocessing**: `sharp` (image resizing to width 1200px, JPEG quality 80)
- **API Architecture**: REST APIs with DTOs, centralized error filters, static file serving

### OCR & Extraction Engine
- **Primary Engine**: Python PaddleOCR 3.0.0 worker child process (`python_ocr/ocr.py`)
- **Fallback Engine**: `tesseract.js` Node.js OCR engine
- **Extraction Logic**: Strategy pattern extractors for `rc`, `insurance`, `puc`, `permit`, and `fitness` documents using exact keyword arrays, window matching, date normalization (`formatDate`), and regex validators (`isValidChassis`, `isValidEngine`, `isValidRegistration`, `isValidInsuranceNumber`, `isValidPUCNumber`, `isValidPermitNumber`, `isValidDate`).

### Frontend
- **Framework**: React 18 + Vite 5 + TypeScript
- **Styling**: Tailwind CSS + Lucide React Icons
- **HTTP Client**: Axios with REST API integration
- **Features**: Document Type Selection, Drag & Drop Upload, Live OCR Processing Badges, Editable Extracted Schema Card, Raw OCR Output Viewer, Document History Vault, Search & Filter, Side-by-Side Document Details Inspection Modal.

---

## Project Structure

```
c:/Users/vansh/OneDrive/Desktop/clientProject/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── typeorm.config.ts
│   │   ├── database/
│   │   │   └── entities/
│   │   │       ├── document.entity.ts
│   │   │       └── extracted-data.entity.ts
│   │   ├── modules/
│   │   │   ├── ocr/
│   │   │   │   └── ocr.service.ts
│   │   │   ├── extraction/
│   │   │   │   ├── extraction.service.ts
│   │   │   │   ├── extractors/
│   │   │   │   │   ├── rc.extractor.ts
│   │   │   │   │   ├── insurance.extractor.ts
│   │   │   │   │   ├── puc.extractor.ts
│   │   │   │   │   ├── permit.extractor.ts
│   │   │   │   │   └── fitness.extractor.ts
│   │   │   │   └── utils/
│   │   │   │       ├── date-formatter.ts
│   │   │   │       ├── keywords.ts
│   │   │   │       └── validators.ts
│   │   │   └── documents/
│   │   │       ├── dto/
│   │   │       ├── documents.controller.ts
│   │   │       └── documents.service.ts
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── python_ocr/
│   │   ├── ocr.py
│   │   └── requirements.txt
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.tsx
│   │   │   ├── AnalyticsDashboard.tsx
│   │   │   ├── FileUploader.tsx
│   │   │   ├── ExtractedDataCard.tsx
│   │   │   ├── RawTextViewer.tsx
│   │   │   ├── DocumentHistoryTable.tsx
│   │   │   └── DocumentDetailModal.tsx
│   │   ├── services/
│   │   │   └── api.service.ts
│   │   ├── types/
│   │   │   └── document.types.ts
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
└── README.md
```

---

## Installation & Setup Guide

### 1. Prerequisites
- Node.js (v18+)
- Python (3.9+)
- MySQL Server (Optional, defaults to SQLite if MySQL is not active)

### 2. Backend Installation
```bash
cd backend
npm install
```

#### Environment Variables (`backend/.env`)
```ini
# Server Config
PORT=3000
NODE_ENV=development

# Database Config (MySQL or SQLite)
DB_TYPE=sqlite
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=root
DB_DATABASE=vehicle_doc_ocr
DB_SYNCHRONIZE=true

# OCR Engine Config
PYTHON_PATH=python
PADDLEOCR_ENABLED=true
TESSERACT_ENABLED=true

# Upload Config
UPLOAD_DIR=uploads
PROCESSED_DIR=processed
MAX_FILE_SIZE_MB=10
```

#### Run Backend Server
```bash
# Start in development mode with auto-reload
npm run start:dev

# Run unit tests for extraction service
npm test
```

### 3. Frontend Installation
```bash
cd frontend
npm install
```

#### Run Frontend Dev Server
```bash
npm run dev
# React App available at http://localhost:5173
```

---

## REST API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/documents/upload` | Upload image/PDF file & `documentType` (`rc`, `insurance`, `puc`, `permit`, `fitness`) -> run OCR -> extract -> validate -> store in DB |
| `GET` | `/api/documents` | Retrieve paginated documents with search and document type filter |
| `GET` | `/api/documents/stats/summary` | Get KPI dashboard metrics (total processed, success rate, distribution) |
| `GET` | `/api/documents/:id` | Get detailed document record with raw OCR text and extracted fields |
| `PATCH` | `/api/documents/:id` | Update extracted field values & re-run regex validation rules |
| `DELETE` | `/api/documents/:id` | Delete document record and associated upload files |
| `GET` | `/api/documents/file/:filename` | Serve uploaded or processed document image binary |

---

## Complete Workflow Diagram

```
[USER UPLOADS FILE & SELECTS TYPE]
                 │
                 ▼
[NESTJS FILE VALIDATION (Multer max 10MB, JPG/PNG/PDF)]
                 │
                 ▼
[SHARP IMAGE PREPROCESSING (Resize to width 1200, JPEG quality 80)]
                 │
                 ▼
[PADDLEOCR PYTHON WORKER / TESSERACT.JS OCR ENGINE]
                 │
                 ▼
[RAW RECOGNIZED TEXT LINES]
                 │
                 ▼
[STRATEGY EXTRACTOR (RC / Insurance / PUC / Permit / Fitness)]
                 │
                 ▼
[KEYWORD & WINDOW MATCHING + DATE FORMATTING + REGEX VALIDATORS]
                 │
                 ▼
[STORE IN MYSQL DATABASE (ProcessedDocument & ExtractedData entities)]
                 │
                 ▼
[REACT FRONTEND DISPLAY & EDITABLE FIELD FORM]
```

---

## Troubleshooting

1. **Python PaddleOCR Module Not Found**:
   - If Python `paddleocr` is not installed, the system automatically falls back to `tesseract.js` without interrupting workflow.
2. **Database Connection Issues**:
   - Set `DB_TYPE=sqlite` in `backend/.env` for zero-configuration local database execution.
