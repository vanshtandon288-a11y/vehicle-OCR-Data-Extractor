import React, { useState, useEffect } from 'react';
import { ProcessedDocument, DocumentType } from '../types/document.types';
import { apiService } from '../services/api.service';
import { CheckCircle2, AlertCircle, Save, FileText, Check, Edit3, Sparkles } from 'lucide-react';

interface ExtractedDataCardProps {
  document: ProcessedDocument;
  onUpdate: (updatedDoc: ProcessedDocument) => void;
}

export const ExtractedDataCard: React.FC<ExtractedDataCardProps> = ({ document, onUpdate }) => {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  const data = document.extractedData || {} as any;

  useEffect(() => {
    const ext = document?.extractedData || {} as any;
    setFormData({
      chassisNumber: ext.chassisNumber || '',
      engineNumber: ext.engineNumber || '',
      registrationNumber: ext.registrationNumber || '',
      insuranceNumber: ext.insuranceNumber || '',
      insuranceExpiryDate: ext.insuranceExpiryDate || '',
      pucNumber: ext.pucNumber || '',
      pucExpiryDate: ext.pucExpiryDate || '',
      permitNumber: ext.permitNumber || '',
      permitExpiryDate: ext.permitExpiryDate || '',
      fitnessExpiryDate: ext.fitnessExpiryDate || '',
    });
  }, [document, document?.extractedData]);

  const handleChange = (field: string, val: string) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      const updated = await apiService.updateExtractedFields(document.id, formData);
      setIsSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      onUpdate(updated);
    } catch (err) {
      setIsSaving(false);
    }
  };

  const parseValidationErrors = (): string[] => {
    if (!data.validationErrors) return [];
    try {
      return JSON.parse(data.validationErrors);
    } catch (e) {
      return [];
    }
  };

  const validationErrors = parseValidationErrors();

  const renderField = (
    label: string,
    fieldKey: string,
    isValid?: boolean,
    placeholder = '',
  ) => {
    const fieldValue = formData[fieldKey] !== undefined && formData[fieldKey] !== '' 
      ? formData[fieldKey] 
      : (data[fieldKey] || '');
    const hasValue = Boolean(fieldValue && String(fieldValue).trim().length > 0);

    return (
      <div className="glass-card-morph p-5 rounded-2xl border border-white/10 group">
        <div className="flex items-center justify-between mb-2.5">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            {label}
          </label>
          <div className="flex items-center gap-2">
            {hasValue ? (
              <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Extracted
              </span>
            ) : (
              <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30">
                Manual Entry Needed
              </span>
            )}
            {isValid !== undefined && hasValue && (
              <span
                className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1 backdrop-blur-md ${
                  isValid
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                    : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                }`}
              >
                {isValid ? 'Valid Format' : 'Review Format'}
              </span>
            )}
          </div>
        </div>
        <div className="relative">
          <input
            type="text"
            value={fieldValue}
            onChange={(e) => handleChange(fieldKey, e.target.value)}
            placeholder={placeholder || `Click to enter ${label}`}
            className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-white font-mono font-bold placeholder:text-slate-500 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/30 transition-all shadow-inner"
          />
        </div>
      </div>
    );
  };

  return (
    <div className="glass-card rounded-3xl p-8 shadow-2xl">
      {/* Card Header */}
      <div className="flex items-center justify-between mb-6 pb-6 border-b border-white/10">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white uppercase tracking-wider flex items-center gap-2.5">
              {document.documentType} Extracted Schema
              <span className="text-xs font-normal normal-case text-slate-300 bg-white/5 px-3 py-1 rounded-full border border-white/10 font-mono backdrop-blur-md">
                {document.ocrEngineUsed || 'PaddleOCR 3.0'}
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-1 font-mono">ID: {document.id}</p>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-indigo-500/25 hover:scale-105 active:scale-95"
        >
          {saveSuccess ? (
            <>
              <Check className="w-4 h-4 text-emerald-300" /> Saved!
            </>
          ) : (
            <>
              <Save className="w-4 h-4" /> Save Field Edits
            </>
          )}
        </button>
      </div>

      {/* Polite Apology & Assisted Guidance Banner */}
      <div className="mb-6 p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-200 text-xs backdrop-blur-md flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
        <div>
          <div className="font-bold text-indigo-300 mb-0.5 text-sm">
            Automated OCR Extraction & Assisted Verification
          </div>
          <p className="text-slate-300 leading-relaxed">
            We apologize if any character was misread due to lighting or card condition. Extracted values are populated below—you can make quick edits directly in any field and click <strong className="text-white">"Save Field Edits"</strong> to update MySQL.
          </p>
        </div>
      </div>

      {/* Validation Banner */}
      {validationErrors.length > 0 ? (
        <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs backdrop-blur-md">
          <div className="font-semibold mb-1 flex items-center gap-2 text-amber-400">
            <AlertCircle className="w-4 h-4" /> Extraction Validation Alerts:
          </div>
          <ul className="list-disc list-inside space-y-1 text-amber-200/90 pl-1">
            {validationErrors.map((err, idx) => (
              <li key={idx}>{err}</li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2.5 font-semibold backdrop-blur-md">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>All extracted fields passed validation checks!</span>
        </div>
      )}

      {/* Fields Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {document.documentType === DocumentType.RC && (
          <>
            {renderField('Chassis Number', 'chassisNumber', data.isChassisValid, 'Click to enter Chassis Number')}
            {renderField('Engine Number', 'engineNumber', data.isEngineValid, 'Click to enter Engine Number')}
            {renderField('Registration Number', 'registrationNumber', data.isRegistrationValid, 'Click to enter Registration Number')}
          </>
        )}

        {document.documentType === DocumentType.INSURANCE && (
          <>
            {renderField('Policy Number', 'insuranceNumber', data.isInsuranceNumberValid, 'Click to enter Policy Number')}
            {renderField('Insurance Expiry Date', 'insuranceExpiryDate', undefined, 'YYYY/MM/DD')}
          </>
        )}

        {document.documentType === DocumentType.PUC && (
          <>
            {renderField('PUC Certificate Number', 'pucNumber', data.isPucNumberValid, 'Click to enter PUC Number')}
            {renderField('PUC Expiry Date', 'pucExpiryDate', undefined, 'YYYY/MM/DD')}
          </>
        )}

        {document.documentType === DocumentType.PERMIT && (
          <>
            {renderField('Permit Number', 'permitNumber', data.isPermitNumberValid, 'Click to enter Permit Number')}
            {renderField('Permit Expiry Date', 'permitExpiryDate', undefined, 'YYYY/MM/DD')}
          </>
        )}

        {document.documentType === DocumentType.FITNESS && (
          <>
            {renderField('Fitness Expiry Date', 'fitnessExpiryDate', undefined, 'YYYY/MM/DD')}
          </>
        )}
      </div>

      <div className="mt-8 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
        <span className="flex items-center gap-1.5">
          <Edit3 className="w-3.5 h-3.5 text-indigo-400" /> Fields can be edited inline and saved directly to MySQL.
        </span>
        <span className="font-mono">Created: {new Date(document.createdAt).toLocaleString()}</span>
      </div>
    </div>
  );
};
