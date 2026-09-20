import React, { useState, useEffect } from 'react';
import { ProcessedDocument, DocumentType, ProcessingStatus } from '../types/document.types';
import { apiService } from '../services/api.service';
import { Search, Filter, Eye, Trash2, ChevronLeft, ChevronRight, FileCheck, RefreshCw } from 'lucide-react';

interface DocumentHistoryTableProps {
  onSelectDocument: (doc: ProcessedDocument) => void;
  refreshTrigger: number;
}

export const DocumentHistoryTable: React.FC<DocumentHistoryTableProps> = ({
  onSelectDocument,
  refreshTrigger,
}) => {
  const [documents, setDocuments] = useState<ProcessedDocument[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const res = await apiService.getDocuments(
        page,
        10,
        selectedType as any,
        searchQuery,
      );
      setDocuments(res.data);
      setTotalPages(res.totalPages);
      setTotalItems(res.total);
      setLoading(false);
    } catch (err) {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [page, selectedType, searchQuery, refreshTrigger]);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this processed document record?')) return;
    try {
      await apiService.deleteDocument(id);
      fetchDocuments();
    } catch (err) {
      alert('Failed to delete document');
    }
  };

  const getStatusBadge = (status: ProcessingStatus) => {
    switch (status) {
      case ProcessingStatus.COMPLETED:
        return (
          <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 backdrop-blur-md flex items-center gap-1 w-fit shadow-sm">
            Completed
          </span>
        );
      case ProcessingStatus.PROCESSING:
        return (
          <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 backdrop-blur-md flex items-center gap-1 w-fit animate-pulse shadow-sm">
            Processing
          </span>
        );
      case ProcessingStatus.FAILED:
        return (
          <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30 backdrop-blur-md flex items-center gap-1 w-fit shadow-sm">
            Failed
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="glass-card rounded-3xl p-8 shadow-2xl">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <FileCheck className="w-6 h-6 text-indigo-400" />
            Processed Documents Vault
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Total {totalItems} verified vehicle records stored in MySQL schema.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Search Bar */}
          <div className="relative min-w-[220px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search filename or text..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              className="w-full bg-slate-950/60 border border-white/10 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/80 transition-all backdrop-blur-md"
            />
          </div>

          {/* Filter Dropdown */}
          <div className="flex items-center gap-2 bg-slate-950/60 border border-white/10 rounded-2xl px-4 py-2 backdrop-blur-md">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={selectedType}
              onChange={(e) => {
                setSelectedType(e.target.value);
                setPage(1);
              }}
              className="bg-transparent text-xs text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="all">All Doc Types</option>
              <option value="rc">RC (Registration)</option>
              <option value="insurance">Insurance</option>
              <option value="puc">PUC</option>
              <option value="permit">Permit</option>
              <option value="fitness">Fitness</option>
            </select>
          </div>

          {/* Refresh Button */}
          <button
            onClick={fetchDocuments}
            className="p-2.5 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-all hover:scale-105"
            title="Refresh List"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Table with Glass Hover Morph */}
      <div className="overflow-x-auto rounded-2xl border border-white/10 backdrop-blur-md">
        <table className="w-full text-left text-xs">
          <thead className="bg-white/[0.03] text-slate-400 uppercase tracking-wider font-bold border-b border-white/10">
            <tr>
              <th className="px-5 py-4">Document File</th>
              <th className="px-5 py-4">Doc Type</th>
              <th className="px-5 py-4">Extracted Summary</th>
              <th className="px-5 py-4">OCR Engine</th>
              <th className="px-5 py-4">Status</th>
              <th className="px-5 py-4">Uploaded Date</th>
              <th className="px-5 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-slate-300">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-5 py-10 text-center text-slate-500 font-medium">
                  Loading documents database...
                </td>
              </tr>
            ) : documents.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-10 text-center text-slate-500 font-medium">
                  No documents found matching your filter criteria.
                </td>
              </tr>
            ) : (
              documents.map((doc) => {
                const data = doc.extractedData || {} as any;
                return (
                  <tr
                    key={doc.id}
                    onClick={() => onSelectDocument(doc)}
                    className="hover:bg-white/[0.08] hover:-translate-y-0.5 cursor-pointer transition-all duration-200"
                  >
                    <td className="px-5 py-4 font-semibold text-white max-w-[200px] truncate">
                      {doc.originalName}
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-mono font-bold uppercase text-indigo-300 bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/30">
                        {doc.documentType}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-mono text-[11px]">
                      {doc.documentType === DocumentType.RC && (
                        <span>
                          {data.registrationNumber || 'No Reg'} • {data.chassisNumber ? 'Chassis ✓' : 'No Chassis'}
                        </span>
                      )}
                      {doc.documentType === DocumentType.INSURANCE && (
                        <span>
                          Policy: {data.insuranceNumber || 'N/A'} • Exp: {data.insuranceExpiryDate || 'N/A'}
                        </span>
                      )}
                      {doc.documentType === DocumentType.PUC && (
                        <span>
                          PUC: {data.pucNumber || 'N/A'} • Exp: {data.pucExpiryDate || 'N/A'}
                        </span>
                      )}
                      {doc.documentType === DocumentType.PERMIT && (
                        <span>
                          Permit: {data.permitNumber || 'N/A'} • Exp: {data.permitExpiryDate || 'N/A'}
                        </span>
                      )}
                      {doc.documentType === DocumentType.FITNESS && (
                        <span>Fitness Exp: {data.fitnessExpiryDate || 'N/A'}</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-slate-400">
                      {doc.ocrEngineUsed || 'PaddleOCR 3.0'}
                    </td>
                    <td className="px-5 py-4">{getStatusBadge(doc.status)}</td>
                    <td className="px-5 py-4 text-slate-400 font-mono">
                      {new Date(doc.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectDocument(doc);
                          }}
                          className="p-2 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/30 transition-all hover:scale-110"
                          title="View / Edit Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => handleDelete(e, doc.id)}
                          className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 transition-all hover:scale-110"
                          title="Delete Record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/10 text-xs text-slate-400">
          <span>
            Page {page} of {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 text-white border border-white/10 transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 text-white border border-white/10 transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
