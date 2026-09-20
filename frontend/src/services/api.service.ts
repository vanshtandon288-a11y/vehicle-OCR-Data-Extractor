import axios from 'axios';
import {
  ProcessedDocument,
  DocumentListResponse,
  StatsSummary,
  DocumentType,
} from '../types/document.types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export const apiService = {
  async uploadDocument(
    file: File,
    documentType: DocumentType,
  ): Promise<ProcessedDocument> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentType', documentType);

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
