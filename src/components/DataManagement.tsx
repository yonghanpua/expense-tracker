import { useRef, useState } from 'react';
import type { Transaction } from '../types/transaction';
import { downloadFile, exportToCSV, exportToJSON } from '../utils/exportData';
import { importCSV, importJSON, type ImportResult } from '../utils/importData';

interface DataManagementProps {
  transactions: Transaction[];
  onImport: (transactions: Transaction[]) => void;
  onClearAll: () => void;
}

type ImportStage =
  | { step: 'idle' }
  | { step: 'preview'; result: ImportResult; filename: string }
  | { step: 'done'; result: ImportResult };

export default function DataManagement({
  transactions,
  onImport,
  onClearAll,
}: DataManagementProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [importStage, setImportStage] = useState<ImportStage>({ step: 'idle' });
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
        setImportStage({
          step: 'done',
          result: {
            transactions: [],
            errors: ['Unsupported file type. Please use .json or .csv'],
            skipped: 0,
          },
        });
        return;
      }

      if (result.transactions.length > 0) {
        setImportStage({ step: 'preview', result, filename: file.name });
      } else {
        setImportStage({ step: 'done', result });
      }
    };
    reader.readAsText(file);

    if (fileRef.current) fileRef.current.value = '';
  }

  function confirmImport() {
    if (importStage.step !== 'preview') return;
    onImport(importStage.result.transactions);
    setImportStage({ step: 'done', result: importStage.result });
  }

  function cancelImport() {
    setImportStage({ step: 'idle' });
  }

  function handleClear() {
    if (confirmClear) {
      onClearAll();
      setConfirmClear(false);
    } else {
      setConfirmClear(true);
    }
  }

  const categoryBreakdown = importStage.step === 'preview'
    ? summarizeByType(importStage.result.transactions)
    : null;

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

          {importStage.step === 'idle' && (
            <button
              onClick={() => fileRef.current?.click()}
              className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-600 text-gray-300 hover:bg-gray-800 transition-colors"
            >
              Choose File...
            </button>
          )}

          {/* Preview step */}
          {importStage.step === 'preview' && (
            <div className="rounded-lg border border-gray-700 bg-gray-800 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-4 h-4 text-blue-400 shrink-0"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-7-4a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM9 9a.75.75 0 0 0 0 1.5h.253a.25.25 0 0 1 .244.304l-.459 2.066A1.75 1.75 0 0 0 10.747 15H11a.75.75 0 0 0 0-1.5h-.253a.25.25 0 0 1-.244-.304l.459-2.066A1.75 1.75 0 0 0 9.253 9H9Z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-sm font-medium text-gray-200">
                  Ready to import from {importStage.filename}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-md bg-gray-900 p-2.5">
                  <p className="text-xs text-gray-500">Transactions</p>
                  <p className="text-lg font-bold text-gray-100">
                    {importStage.result.transactions.length}
                  </p>
                </div>
                {categoryBreakdown && (
                  <>
                    <div className="rounded-md bg-gray-900 p-2.5">
                      <p className="text-xs text-gray-500">Skipped</p>
                      <p className="text-lg font-bold text-gray-100">
                        {importStage.result.skipped}
                      </p>
                    </div>
                    <div className="rounded-md bg-gray-900 p-2.5">
                      <p className="text-xs text-gray-500">Income</p>
                      <p className="text-emerald-400 font-semibold">
                        {categoryBreakdown.income} transaction
                        {categoryBreakdown.income !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <div className="rounded-md bg-gray-900 p-2.5">
                      <p className="text-xs text-gray-500">Expenses</p>
                      <p className="text-red-400 font-semibold">
                        {categoryBreakdown.expense} transaction
                        {categoryBreakdown.expense !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </>
                )}
              </div>

              {importStage.result.errors.length > 0 && (
                <div className="text-xs">
                  <p className="text-yellow-400 mb-1">
                    {importStage.result.errors.length} warning
                    {importStage.result.errors.length !== 1 ? 's' : ''}:
                  </p>
                  <ul className="space-y-0.5 text-red-400">
                    {importStage.result.errors.slice(0, 3).map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                    {importStage.result.errors.length > 3 && (
                      <li>
                        ...and {importStage.result.errors.length - 3} more
                      </li>
                    )}
                  </ul>
                </div>
              )}

              <div className="flex gap-3 pt-1">
                <button
                  onClick={confirmImport}
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                >
                  Confirm Import
                </button>
                <button
                  onClick={cancelImport}
                  className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-600 text-gray-300 hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Done step */}
          {importStage.step === 'done' && (
            <div className="rounded-lg border border-gray-700 bg-gray-800 p-3 text-sm">
              {importStage.result.transactions.length > 0 && (
                <p className="text-emerald-400">
                  Imported {importStage.result.transactions.length} transaction
                  {importStage.result.transactions.length !== 1 && 's'}
                </p>
              )}
              {importStage.result.skipped > 0 && (
                <p className="text-yellow-400">
                  Skipped {importStage.result.skipped} row
                  {importStage.result.skipped !== 1 && 's'}
                </p>
              )}
              {importStage.result.errors.length > 0 &&
                importStage.result.transactions.length === 0 && (
                  <ul className="space-y-0.5 text-red-400 text-xs">
                    {importStage.result.errors.slice(0, 5).map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                    {importStage.result.errors.length > 5 && (
                      <li>
                        ...and {importStage.result.errors.length - 5} more
                        errors
                      </li>
                    )}
                  </ul>
                )}
              <button
                onClick={() => setImportStage({ step: 'idle' })}
                className="mt-2 text-xs text-blue-400 hover:text-blue-300 transition-colors"
              >
                Import another file
              </button>
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

function summarizeByType(transactions: Transaction[]) {
  let income = 0;
  let expense = 0;
  for (const t of transactions) {
    if (t.type === 'income') income++;
    else expense++;
  }
  return { income, expense };
}
