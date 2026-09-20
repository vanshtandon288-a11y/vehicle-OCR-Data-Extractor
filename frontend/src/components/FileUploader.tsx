import React, { useState, useRef } from 'react';
import { DocumentType, ProcessedDocument } from '../types/document.types';
import { apiService } from '../services/api.service';
import { Upload, FileText, Image as ImageIcon, Loader2, Check, AlertCircle, Sparkles } from 'lucide-react';

interface FileUploaderProps {
  onSuccess: (document: ProcessedDocument) => void;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ onSuccess }) => {
  const [selectedType, setSelectedType] = useState<DocumentType>(DocumentType.RC);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const documentTypesList = [
    { type: DocumentType.RC, label: 'RC (Registration)', desc: 'Chassis, Engine, Reg No' },
    { type: DocumentType.INSURANCE, label: 'Insurance Policy', desc: 'Policy No & Expiry Date' },
    { type: DocumentType.PUC, label: 'PUC Certificate', desc: 'PUC No & Valid Till Date' },
    { type: DocumentType.PERMIT, label: 'Permit Certificate', desc: 'Permit No & Expiry Date' },
    { type: DocumentType.FITNESS, label: 'Fitness Certificate', desc: 'Fitness Expiry Date' },
  ];

  const handleFileSelect = (selectedFile: File) => {
    setErrorMessage(null);
    if (!selectedFile) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowedTypes.includes(selectedFile.type)) {
      setErrorMessage('Invalid file format. Please upload JPG, PNG, WEBP image or PDF file.');
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setErrorMessage('File size exceeds 10MB limit.');
      return;
    }

    setFile(selectedFile);
    if (selectedFile.type.startsWith('image/')) {
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    setErrorMessage(null);

    try {
      const doc = await apiService.uploadDocument(file, selectedType);
      setIsUploading(false);
      onSuccess(doc);
    } catch (err: any) {
      setIsUploading(false);
      const msg = err.response?.data?.message || 'Failed to process document OCR';
      setErrorMessage(Array.isArray(msg) ? msg.join(', ') : msg);
    }
  };

  return (
    <div className="glass-card rounded-3xl p-8 shadow-2xl relative overflow-hidden">
      {/* Background Ambient Glow */}
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex items-center justify-between mb-2">
        <h2 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
          <Upload className="w-6 h-6 text-indigo-400" />
          Document Ingestion & OCR Scanner
        </h2>
        <span className="flex items-center gap-1.5 text-xs text-indigo-300 font-medium bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/30">
          <Sparkles className="w-3.5 h-3.5" /> High-Precision Sharp Upscaling
        </span>
      </div>
      <p className="text-xs text-slate-400 mb-8">
        Select target document classification type and upload document image/PDF for automated OCR extraction.
      </p>

      {/* Document Type Selector Tabs with Hover Morph */}
      <div className="mb-8">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
          1. Select Document Type
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          {documentTypesList.map((item) => (
            <button
              key={item.type}
              type="button"
              onClick={() => setSelectedType(item.type)}
              className={`p-4 rounded-2xl text-left border transition-all duration-300 cursor-pointer ${
                selectedType === item.type
                  ? 'bg-gradient-to-br from-indigo-600/30 to-purple-600/20 border-indigo-500/80 text-white ring-2 ring-indigo-500/50 shadow-lg shadow-indigo-500/25 -translate-y-1.5 scale-[1.02]'
                  : 'bg-white/[0.02] border-white/10 text-slate-400 hover:border-indigo-500/40 hover:bg-white/[0.06] hover:-translate-y-1 hover:text-slate-200'
              }`}
            >
              <div className="font-bold text-sm flex items-center justify-between">
                {item.label.split(' ')[0]}
                {selectedType === item.type && (
                  <Check className="w-4 h-4 text-indigo-400" />
                )}
              </div>
              <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">{item.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Upload Drag & Drop Area with Glass Hover Morph */}
      <div className="mb-8">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
          2. Upload Document File
        </label>

        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-white/20 hover:border-indigo-500/60 bg-white/[0.02] hover:bg-white/[0.05] rounded-3xl p-10 text-center cursor-pointer transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_50px_rgba(99,102,241,0.2)] group relative overflow-hidden"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,application/pdf"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
          />

          {file ? (
            <div className="flex flex-col items-center justify-center">
              {previewUrl ? (
                <div className="w-48 h-36 mb-4 rounded-2xl overflow-hidden border border-white/20 shadow-2xl relative group-hover:scale-105 transition-transform duration-300">
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-slate-950/20" />
                </div>
              ) : (
                <div className="w-20 h-20 mb-4 rounded-3xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                  <FileText className="w-10 h-10" />
                </div>
              )}
              <p className="text-base font-bold text-white">{file.name}</p>
              <p className="text-xs text-slate-400 mt-1">
                {(file.size / 1024).toFixed(1)} KB • {file.type || 'PDF Document'}
              </p>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setFile(null);
                  setPreviewUrl(null);
                }}
                className="mt-4 text-xs text-rose-400 hover:text-rose-300 font-semibold underline decoration-rose-500/30 hover:decoration-rose-400 transition-all"
              >
                Change File
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-6">
              <div className="w-20 h-20 mb-4 rounded-3xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 text-indigo-300 border border-white/10 flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-xl shadow-indigo-500/10">
                <Upload className="w-10 h-10" />
              </div>
              <p className="text-base font-semibold text-slate-200">
                Drag and drop your document here, or <span className="text-indigo-400 hover:underline">browse</span>
              </p>
              <p className="text-xs text-slate-400 mt-2">
                Supports JPG, PNG, WEBP images or PDF files (Max 10MB)
              </p>
              <p className="text-[11px] text-indigo-300/80 mt-2 font-mono bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
                Automated 2400px Sharp upscaling & contrast sharpening
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="mb-8 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5 backdrop-blur-md shadow-lg">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Action Button with Hover Morphing Glow */}
      <button
        onClick={handleUpload}
        disabled={!file || isUploading}
        className={`w-full py-4 px-8 rounded-2xl font-bold text-base flex items-center justify-center gap-3 transition-all duration-300 shadow-xl ${
          !file || isUploading
            ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-white/5'
            : 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-[1.01] active:scale-[0.99]'
        }`}
      >
        {isUploading ? (
          <>
            <Loader2 className="w-6 h-6 animate-spin text-white" />
            <span>Processing Sharp 2400px Upscaling & PaddleOCR Extraction...</span>
          </>
        ) : (
          <>
            <ImageIcon className="w-6 h-6" />
            <span>Run OCR & Extract Structured Fields</span>
          </>
        )}
      </button>
    </div>
  );
};
