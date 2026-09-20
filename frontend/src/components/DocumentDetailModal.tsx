import React from 'react';
import { ProcessedDocument } from '../types/document.types';
import { apiService } from '../services/api.service';
import { ExtractedDataCard } from './ExtractedDataCard';
import { RawTextViewer } from './RawTextViewer';
import { X, ExternalLink, FileText } from 'lucide-react';

interface DocumentDetailModalProps {
  document: ProcessedDocument | null;
  onClose: () => void;
  onUpdate: (doc: ProcessedDocument) => void;
}

export const DocumentDetailModal: React.FC<DocumentDetailModalProps> = ({
  document,
  onClose,
  onUpdate,
}) => {
  if (!document) return null;

  const fileUrl = apiService.getFileUrl(document.fileName);
  const isImage = document.mimeType?.startsWith('image/');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-2xl overflow-y-auto animate-in fade-in duration-200">
      <div className="glass-card rounded-3xl w-full max-w-6xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col my-auto border border-white/10 relative">
        {/* Modal Header */}
        <div className="sticky top-0 z-10 bg-slate-950/80 backdrop-blur-2xl border-b border-white/10 p-5 px-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 text-indigo-300 border border-white/10 flex items-center justify-center font-bold font-mono shadow-lg">
              {document.documentType.toUpperCase()}
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">{document.originalName}</h3>
              <p className="text-xs text-slate-400 font-mono">
                Uploaded: {new Date(document.createdAt).toLocaleString()} • Size: {(document.fileSize / 1024).toFixed(1)} KB
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2.5 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 transition-all hover:scale-110"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Image Preview */}
          <div className="lg:col-span-5 glass-card rounded-2xl p-4 flex flex-col items-center justify-center min-h-[350px]">
            {isImage ? (
              <div className="relative group w-full h-full flex flex-col items-center">
                <img
                  src={fileUrl}
                  alt={document.originalName}
                  className="max-h-[500px] w-auto object-contain rounded-xl border border-white/10 shadow-2xl group-hover:scale-[1.02] transition-transform duration-300"
                />
                <a
                  href={fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 flex items-center gap-2 text-xs text-indigo-300 hover:text-white font-semibold underline decoration-indigo-500/30 hover:decoration-indigo-400 transition-all"
                >
                  <ExternalLink className="w-4 h-4" /> Open Full Resolution Image
                </a>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileText className="w-20 h-20 text-indigo-400 mb-4" />
                <p className="text-base font-bold text-white">PDF Document File</p>
                <a
                  href={fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-bold shadow-lg shadow-indigo-500/25 hover:scale-105 transition-transform"
                >
                  <ExternalLink className="w-4 h-4" /> Open PDF File
                </a>
              </div>
            )}
          </div>

          {/* Right Column: Extracted Data & Raw Text */}
          <div className="lg:col-span-7 flex flex-col space-y-4">
            <ExtractedDataCard document={document} onUpdate={onUpdate} />
            <RawTextViewer rawText={document.rawText} />
          </div>
        </div>
      </div>
    </div>
  );
};
