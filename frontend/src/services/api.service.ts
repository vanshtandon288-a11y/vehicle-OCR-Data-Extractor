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

const preprocessImageInBrowser = (file: File): Promise<Blob | File> => {
  return new Promise((resolve) => {
    if (!file.type.startsWith('image/')) return resolve(file);
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement('canvas');
      const maxDim = 1800;
      let width = img.width;
      let height = img.height;

      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return resolve(file);

      // Contrast boost and grayscale for high accuracy document OCR
      ctx.filter = 'contrast(140%) grayscale(100%) brightness(105%)';
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          resolve(blob || file);
        },
        'image/jpeg',
        0.92,
      );
    };
    img.onerror = () => resolve(file);
    img.src = url;
  });
};

const runBrowserOcr = async (file: File): Promise<string> => {
  try {
    const preprocessedBlob = await preprocessImageInBrowser(file);
    const worker = await createWorker('eng');
    const ret = await worker.recognize(preprocessedBlob);
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
