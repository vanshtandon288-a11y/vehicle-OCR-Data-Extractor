import axios from 'axios';
import { createWorker } from 'tesseract.js';
import {
  ProcessedDocument,
  DocumentListResponse,
  StatsSummary,
  DocumentType,
} from '../types/document.types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

const runBrowserOcr = async (file: File): Promise<string> => {
  try {
    const worker = await createWorker('eng');
    const ret = await worker.recognize(file);
    await worker.terminate();
    return ret.data.text || '';
  } catch (err) {
    console.warn('Browser OCR failed, falling back to server side OCR:', err);
    return '';
  }
};

export const apiService = {
  async uploadDocument(
    file: File,
    documentType: DocumentType,
  ): Promise<ProcessedDocument> {
    const base64File = await fileToBase64(file);
    let rawText = '';

    if (file.type.startsWith('image/')) {
      rawText = await runBrowserOcr(file);
    }

    try {
      const response = await axios.post<ProcessedDocument>(
        `${API_BASE_URL}/documents/upload-json`,
        {
          base64File,
          fileName: file.name,
          documentType,
          rawText,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
      return response.data;
    } catch (err) {
      console.warn('JSON upload failed, attempting multipart fallback:', err);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('documentType', documentType);
      if (rawText) formData.append('rawText', rawText);

      const response = await axios.post<ProcessedDocument>(
        `${API_BASE_URL}/documents/upload`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );
      return response.data;
    }
  },

  async getDocuments(
    page = 1,
    limit = 10,
    documentType?: DocumentType | 'all',
    search?: string,
  ): Promise<DocumentListResponse> {
    const params: Record<string, any> = { page, limit };
    if (documentType && documentType !== 'all') {
      params.documentType = documentType;
    }
    if (search) {
      params.search = search;
    }

    const response = await axios.get<DocumentListResponse>(
      `${API_BASE_URL}/documents`,
      { params },
    );
    return response.data;
  },

  async getDocumentById(id: string): Promise<ProcessedDocument> {
    const response = await axios.get<ProcessedDocument>(
      `${API_BASE_URL}/documents/${id}`,
    );
    return response.data;
  },

  async updateExtractedFields(
    id: string,
    fields: Record<string, any>,
  ): Promise<ProcessedDocument> {
    const response = await axios.patch<ProcessedDocument>(
      `${API_BASE_URL}/documents/${id}`,
      fields,
    );
    return response.data;
  },

  async deleteDocument(id: string): Promise<{ success: boolean; message: string }> {
    const response = await axios.delete<{ success: boolean; message: string }>(
      `${API_BASE_URL}/documents/${id}`,
    );
    return response.data;
  },

  async getStats(): Promise<StatsSummary> {
    const response = await axios.get<StatsSummary>(
      `${API_BASE_URL}/documents/stats/summary`,
    );
    return response.data;
  },

  getFileUrl(filename: string): string {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || '/api';
    return `${baseUrl}/documents/file/${filename}`;
  },
};
