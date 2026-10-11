import { useRef, useState } from 'react';
import type { Transaction } from '../types/transaction';
import { downloadFile, exportToCSV, exportToJSON } from '../utils/exportData';
import { importCSV, importJSON, type ImportResult } from '../utils/importData';

interface DataManagementProps {
  transactions: Transaction[];
  onImport: (transactions: Transaction[]) => void;
  onClearAll: () => void;
}

export default function DataManagement({
  transactions,
  onImport,
  onClearAll,
}: DataManagementProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);

  function handleExport(format: 'json' | 'csv') {
    const date = new Date().toISOString().split('T')[0];
    if (format === 'json') {
      downloadFile(
        exportToJSON(transactions),
        `expenses-${date}.json`,
        'application/json'
      );
    } else {
      downloadFile(
        exportToCSV(transactions),
        `expenses-${date}.csv`,
        'text/csv'
      );
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const content = reader.result as string;
      let result: ImportResult;

      if (file.name.endsWith('.json')) {
        result = importJSON(content);
      } else if (file.name.endsWith('.csv')) {
        result = importCSV(content);
      } else {
        setImportResult({
          transactions: [],
          errors: ['Unsupported file type. Please use .json or .csv'],
          skipped: 0,
        });
        return;
      }

      setImportResult(result);
      if (result.transactions.length > 0) {
        onImport(result.transactions);
      }
    };
    reader.readAsText(file);

    if (fileRef.current) fileRef.current.value = '';
  }

  function handleClear() {
    if (confirmClear) {
      onClearAll();
      setConfirmClear(false);
    } else {
      setConfirmClear(true);
    }
  }

  return (
    <div className="rounded-xl bg-gray-900 border border-gray-800 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-800">
        <h2 className="text-lg font-semibold text-gray-100">Data Management</h2>
        <p className="text-xs text-gray-500 mt-0.5">
          Export, import, or clear your transaction data
        </p>
      </div>

      <div className="p-6 space-y-6">
        {/* Export */}
        <div>
          <h3 className="text-sm font-medium text-gray-300 mb-2">
            Export Transactions ({transactions.length})
          </h3>
          <div className="flex gap-3">
            <button
              onClick={() => handleExport('json')}
              disabled={transactions.length === 0}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Export JSON
            </button>
            <button
              onClick={() => handleExport('csv')}
              disabled={transactions.length === 0}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-700 text-gray-200 hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Export CSV
            </button>
          </div>
        </div>

        {/* Import */}
        <div>
          <h3 className="text-sm font-medium text-gray-300 mb-2">
            Import Transactions
          </h3>
          <p className="text-xs text-gray-500 mb-3">
            Import from a JSON or CSV file. CSV must have headers: Date, Title,
            Category, Amount, Type, Payment Method.
          </p>
          <input
            ref={fileRef}
            type="file"
            accept=".json,.csv"
            onChange={handleFileSelect}
            className="hidden"
          />
          <button
            onClick={() => fileRef.current?.click()}
            className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-600 text-gray-300 hover:bg-gray-800 transition-colors"
          >
            Choose File...
          </button>

          {importResult && (
            <div className="mt-3 rounded-lg border border-gray-700 bg-gray-800 p-3 text-sm">
              {importResult.transactions.length > 0 && (
                <p className="text-emerald-400">
                  Imported {importResult.transactions.length} transaction
                  {importResult.transactions.length !== 1 && 's'}
                </p>
              )}
              {importResult.skipped > 0 && (
                <p className="text-yellow-400">
                  Skipped {importResult.skipped} row
                  {importResult.skipped !== 1 && 's'}
                </p>
              )}
              {importResult.errors.length > 0 && (
                <ul className="mt-1 space-y-0.5 text-red-400 text-xs">
                  {importResult.errors.slice(0, 5).map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                  {importResult.errors.length > 5 && (
                    <li>...and {importResult.errors.length - 5} more errors</li>
                  )}
                </ul>
              )}
            </div>
          )}
        </div>

        {/* Clear */}
        <div className="border-t border-gray-800 pt-6">
          <h3 className="text-sm font-medium text-red-400 mb-2">Danger Zone</h3>
          <button
            onClick={handleClear}
            onBlur={() => setConfirmClear(false)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              confirmClear
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'border border-red-800 text-red-400 hover:bg-red-900/30'
            }`}
          >
            {confirmClear
              ? 'Click again to confirm'
              : 'Clear All Transactions'}
          </button>
        </div>
      </div>
    </div>
  );
}
