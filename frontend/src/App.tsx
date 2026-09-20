import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { FileUploader } from './components/FileUploader';
import { ExtractedDataCard } from './components/ExtractedDataCard';
import { RawTextViewer } from './components/RawTextViewer';
import { DocumentHistoryTable } from './components/DocumentHistoryTable';
import { DocumentDetailModal } from './components/DocumentDetailModal';
import { ProcessedDocument, StatsSummary } from './types/document.types';
import { apiService } from './services/api.service';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'upload' | 'history'>('upload');
  const [latestDocument, setLatestDocument] = useState<ProcessedDocument | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<ProcessedDocument | null>(null);
  const [stats, setStats] = useState<StatsSummary | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  const fetchStats = async () => {
    try {
      const res = await apiService.getStats();
      setStats(res);
    } catch (err) {
      console.warn('Could not fetch stats summary:', err);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [refreshTrigger]);

  const handleUploadSuccess = (doc: ProcessedDocument) => {
    setLatestDocument(doc);
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleDocumentUpdate = (updatedDoc: ProcessedDocument) => {
    if (latestDocument?.id === updatedDoc.id) {
      setLatestDocument(updatedDoc);
    }
    if (selectedDocument?.id === updatedDoc.id) {
      setSelectedDocument(updatedDoc);
    }
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* KPI Analytics Dashboard */}
        <AnalyticsDashboard stats={stats} />

        {/* Tab 1: OCR Extractor */}
        {activeTab === 'upload' && (
          <div className="space-y-8">
            <FileUploader onSuccess={handleUploadSuccess} />

            {latestDocument && (
              <div className="space-y-6">
                <ExtractedDataCard
                  document={latestDocument}
                  onUpdate={handleDocumentUpdate}
                />
                <RawTextViewer rawText={latestDocument.rawText} />
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Document Vault & History */}
        {activeTab === 'history' && (
          <DocumentHistoryTable
            onSelectDocument={(doc) => setSelectedDocument(doc)}
            refreshTrigger={refreshTrigger}
          />
        )}
      </main>

      {/* Side-by-side Inspection Modal */}
      <DocumentDetailModal
        document={selectedDocument}
        onClose={() => setSelectedDocument(null)}
        onUpdate={handleDocumentUpdate}
      />

      <footer className="border-t border-slate-800 bg-slate-900/50 py-6 text-center text-xs text-slate-500">
        <p>Vehicle Document OCR & Structured Data Extraction Engine • Powered by NestJS, TypeORM, PaddleOCR & React</p>
      </footer>
    </div>
  );
};

export default App;
