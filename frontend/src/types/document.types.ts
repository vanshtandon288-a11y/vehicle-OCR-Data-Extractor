export enum DocumentType {
  RC = 'rc',
  INSURANCE = 'insurance',
  PUC = 'puc',
  PERMIT = 'permit',
  FITNESS = 'fitness',
}

export enum ProcessingStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export interface ExtractedData {
  id: string;
  documentId: string;
  chassisNumber?: string;
  engineNumber?: string;
  registrationNumber?: string;
  insuranceNumber?: string;
  insuranceExpiryDate?: string;
  pucNumber?: string;
  pucExpiryDate?: string;
  permitNumber?: string;
  permitExpiryDate?: string;
  fitnessExpiryDate?: string;
  isChassisValid?: boolean;
  isEngineValid?: boolean;
  isRegistrationValid?: boolean;
  isInsuranceNumberValid?: boolean;
  isPucNumberValid?: boolean;
  isPermitNumberValid?: boolean;
  validationErrors?: string; // JSON string array
  createdAt: string;
  updatedAt: string;
}

export interface ProcessedDocument {
  id: string;
  originalName: string;
  fileName: string;
  filePath: string;
  processedFilePath?: string;
  mimeType: string;
  fileSize: number;
  documentType: DocumentType;
  status: ProcessingStatus;
  rawText?: string;
  ocrEngineUsed?: string;
  errorMessage?: string;
  extractedData?: ExtractedData;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentListResponse {
  data: ProcessedDocument[];
  total: number;
  page: number;
  totalPages: number;
}

export interface StatsSummary {
  totalProcessed: number;
  successRate: number;
  byType: Record<string, number>;
  statusBreakdown: {
    completed: number;
    failed: number;
    processing: number;
  };
}
