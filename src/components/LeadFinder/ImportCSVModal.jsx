/**
 * ImportCSVModal.jsx
 * Parse + preview + import CSV file into contacts table.
 * Supports drag-and-drop, column mapping, live preview table.
 */
import React, { useState, useRef, useCallback } from 'react';
import { X, Upload, FileText, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';

const EXAMPLE_CSV = `name,email,company,title,phone,location
John Doe,john@acmecorp.com,Acme Corp,VP Sales,+1 555 0001,New York
Jane Smith,jane@techco.com,TechCo,CTO,+1 555 0002,San Francisco`;

const parseCSV = (text) => {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return { headers: [], rows: [] };
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/\s+/g, '_'));
  const rows = lines.slice(1).map(line => {
    const vals = line.split(',');
    const obj = {};
    headers.forEach((h, i) => { obj[h] = vals[i]?.trim() || ''; });
    return obj;
  }).filter(r => r.email);
  return { headers, rows };
};

const Step = ({ active, done, num, label }) => (
  <div className={`flex items-center gap-2 ${active ? 'text-gray-900' : done ? 'text-primary' : 'text-gray-400'}`}>
    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0
      ${done ? 'bg-primary text-black' : active ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-400'}`}>
      {done ? '✓' : num}
    </div>
    <span className="text-sm font-medium">{label}</span>
  </div>
);

const ImportCSVModal = ({ onClose, onImport, isSaving }) => {
  const [step, setStep] = useState(1); // 1=upload, 2=preview, 3=done
  const [parsed, setParsed] = useState(null);
  const [importResult, setImportResult] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileRef = useRef();

  const handleFile = useCallback((file) => {
    if (!file || !file.name.endsWith('.csv')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = parseCSV(e.target.result);
      setParsed(result);
      setStep(2);
    };
    reader.readAsText(file);
  }, []);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  }, [handleFile]);

  const handleImport = async () => {
    if (!parsed?.rows?.length) return;
    const result = await onImport(parsed.rows);
    setImportResult(result);
    setStep(3);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl border border-gray-100 overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-base font-bold text-gray-900">Import Leads from CSV</h2>
            <p className="text-xs text-gray-400 mt-0.5">Upload a CSV file to bulk-import contacts</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center">
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        {/* Steps */}
        <div className="flex items-center gap-6 px-6 py-3 border-b border-gray-50 bg-gray-50/50">
          <Step num={1} label="Upload File" active={step === 1} done={step > 1} />
          <ArrowRight className="w-4 h-4 text-gray-300" />
          <Step num={2} label="Preview" active={step === 2} done={step > 2} />
          <ArrowRight className="w-4 h-4 text-gray-300" />
          <Step num={3} label="Done" active={step === 3} done={false} />
        </div>

        <div className="px-6 py-6">
          {/* Step 1: Upload */}
          {step === 1 && (
            <div className="space-y-4">
              {/* Drop zone */}
              <div
                onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={onDrop}
                onClick={() => fileRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all
                  ${isDragging ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/50'}`}
              >
                <input ref={fileRef} type="file" accept=".csv" className="hidden"
                  onChange={e => handleFile(e.target.files[0])} />
                <Upload className={`w-10 h-10 mx-auto mb-3 ${isDragging ? 'text-primary' : 'text-gray-300'}`} />
                <p className="font-semibold text-gray-700 mb-1">Drop your CSV here</p>
                <p className="text-sm text-gray-400">or click to browse · .csv files only</p>
              </div>

              {/* Example format */}
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs font-semibold text-gray-500 mb-2 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" />
                  Expected CSV format:
                </p>
                <pre className="text-[11px] text-gray-600 overflow-x-auto font-mono leading-relaxed">
                  {EXAMPLE_CSV}
                </pre>
              </div>
              <p className="text-xs text-gray-400 text-center">
                Supported columns: name, email, company, title, phone, location, linkedin, website, notes, status, tags
              </p>
            </div>
          )}

          {/* Step 2: Preview */}
          {step === 2 && parsed && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-100 rounded-xl">
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                <span className="text-sm text-green-700 font-medium">
                  Found <strong>{parsed.rows.length}</strong> valid contacts. Review below before importing.
                </span>
              </div>

              {/* Preview table */}
              <div className="border border-gray-100 rounded-xl overflow-hidden">
                <div className="overflow-x-auto max-h-60">
                  <table className="w-full text-xs">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        {['name', 'email', 'company', 'title', 'location'].map(h => (
                          <th key={h} className="px-3 py-2 text-left font-semibold text-gray-500 capitalize">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {parsed.rows.slice(0, 10).map((row, i) => (
                        <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50">
                          <td className="px-3 py-2 text-gray-800 font-medium truncate max-w-[120px]">{row.name || '—'}</td>
                          <td className="px-3 py-2 text-gray-600 truncate max-w-[160px]">{row.email}</td>
                          <td className="px-3 py-2 text-gray-500 truncate max-w-[100px]">{row.company || '—'}</td>
                          <td className="px-3 py-2 text-gray-500 truncate max-w-[100px]">{row.title || '—'}</td>
                          <td className="px-3 py-2 text-gray-500 truncate max-w-[90px]">{row.location || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {parsed.rows.length > 10 && (
                  <div className="px-3 py-2 bg-gray-50 text-xs text-gray-400 text-center">
                    + {parsed.rows.length - 10} more rows
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50">
                  Re-upload
                </button>
                <button onClick={handleImport} disabled={isSaving}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-primary text-black text-sm font-bold hover:bg-primary/90 disabled:opacity-50">
                  {isSaving ? 'Importing...' : `Import ${parsed.rows.length} Contacts`}
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Done */}
          {step === 3 && importResult && (
            <div className="text-center py-6">
              {importResult.success ? (
                <>
                  <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-500" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">Import Complete!</h3>
                  <p className="text-sm text-gray-500 mb-2">
                    <strong className="text-green-600">{importResult.imported}</strong> contacts imported successfully
                    {importResult.skipped > 0 && `, ${importResult.skipped} skipped (duplicates)`}
                  </p>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
                    <AlertCircle className="w-8 h-8 text-red-400" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">Import Failed</h3>
                  <p className="text-sm text-red-500">{importResult.error}</p>
                </>
              )}
              <button onClick={onClose}
                className="mt-5 px-8 py-2.5 rounded-xl bg-primary text-black text-sm font-bold hover:bg-primary/90">
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImportCSVModal;
