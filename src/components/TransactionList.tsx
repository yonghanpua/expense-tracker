import { useMemo, useState } from 'react';
import type { Transaction } from '../types/transaction';
import { formatCurrency, formatDate } from '../utils/format';

interface TransactionListProps {
  transactions: Transaction[];
  onDelete: (id: string) => void;
  onEdit: (transaction: Transaction) => void;
}

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

export default function TransactionList({
  transactions,
  onDelete,
  onEdit,
}: TransactionListProps) {
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const totalPages = Math.max(1, Math.ceil(transactions.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);

  const paginatedTransactions = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return transactions.slice(start, start + pageSize);
  }, [transactions, safePage, pageSize]);

  function handleDelete(id: string) {
    if (confirmDeleteId === id) {
      onDelete(id);
      setConfirmDeleteId(null);
    } else {
      setConfirmDeleteId(id);
    }
  }

  function handlePageSizeChange(size: number) {
    setPageSize(size);
    setCurrentPage(1);
  }

  if (transactions.length === 0) {
    return (
      <div className="rounded-xl bg-gray-900 p-8 border border-gray-800 text-center">
        <p className="text-gray-500 text-sm">
          No transactions yet. Add your first one above.
        </p>
      </div>
    );
  }

  const startItem = (safePage - 1) * pageSize + 1;
  const endItem = Math.min(safePage * pageSize, transactions.length);

  return (
    <div className="rounded-xl bg-gray-900 border border-gray-800 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-lg font-semibold text-gray-100">
          Transactions ({transactions.length})
        </h2>
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-gray-500">Show</span>
          {PAGE_SIZE_OPTIONS.map((size) => (
            <button
              key={size}
              onClick={() => handlePageSizeChange(size)}
              className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${
                pageSize === size
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      <ul className="divide-y divide-gray-800">
        {paginatedTransactions.map((t) => (
          <li
            key={t.id}
            className="px-6 py-4 flex items-center gap-4 hover:bg-gray-800/50 transition-colors"
          >
            <div
              className={`w-2 h-2 rounded-full shrink-0 ${
                t.type === 'income' ? 'bg-emerald-400' : 'bg-red-400'
              }`}
            />

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-100 truncate">
                {t.title}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                {formatDate(t.date)} &middot; {t.category} &middot;{' '}
                {t.paymentMethod}
              </p>
            </div>

            <span
              className={`text-sm font-semibold whitespace-nowrap ${
                t.type === 'income' ? 'text-emerald-400' : 'text-red-400'
              }`}
            >
              {t.type === 'income' ? '+' : '-'}
              {formatCurrency(t.amount)}
            </span>

            <div className="flex gap-1 shrink-0">
              <button
                onClick={() => onEdit(t)}
                className="p-1.5 rounded-md text-gray-500 hover:text-blue-400 hover:bg-blue-900/30 transition-colors"
                title="Edit"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-4 h-4"
                >
                  <path d="m5.433 13.917 1.262-3.155A4 4 0 0 1 7.58 9.42l6.92-6.918a2.121 2.121 0 0 1 3 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 0 1-.65-.65Z" />
                  <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0 0 10 3H4.75A2.75 2.75 0 0 0 2 5.75v9.5A2.75 2.75 0 0 0 4.75 18h9.5A2.75 2.75 0 0 0 17 15.25V10a.75.75 0 0 0-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5Z" />
                </svg>
              </button>
              <button
                onClick={() => handleDelete(t.id)}
                onBlur={() => setConfirmDeleteId(null)}
                className={`p-1.5 rounded-md transition-colors ${
                  confirmDeleteId === t.id
                    ? 'text-white bg-red-600 hover:bg-red-700'
                    : 'text-gray-500 hover:text-red-400 hover:bg-red-900/30'
                }`}
                title={
                  confirmDeleteId === t.id
                    ? 'Click again to confirm'
                    : 'Delete'
                }
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-4 h-4"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.519.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 0-1.5.06l.3 7.5a.75.75 0 1 0 1.5-.06l-.3-7.5Zm4.34.06a.75.75 0 1 0-1.5-.06l.3 7.5a.75.75 0 1 0 1.5.06l.3-7.5Z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </li>
        ))}
      </ul>

      {totalPages > 1 && (
        <div className="px-6 py-3 border-t border-gray-800 flex items-center justify-between">
          <span className="text-xs text-gray-500">
            {startItem}–{endItem} of {transactions.length}
          </span>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={safePage <= 1}
              className="px-2 py-1 rounded text-xs text-gray-400 hover:text-gray-200 hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              First
            </button>
            <button
              onClick={() => setCurrentPage(safePage - 1)}
              disabled={safePage <= 1}
              className="p-1 rounded text-gray-400 hover:text-gray-200 hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-4 h-4"
              >
                <path
                  fillRule="evenodd"
                  d="M11.78 5.22a.75.75 0 0 1 0 1.06L8.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
            <span className="px-2 text-xs text-gray-300 font-medium">
              {safePage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(safePage + 1)}
              disabled={safePage >= totalPages}
              className="p-1 rounded text-gray-400 hover:text-gray-200 hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-4 h-4"
              >
                <path
                  fillRule="evenodd"
                  d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={safePage >= totalPages}
              className="px-2 py-1 rounded text-xs text-gray-400 hover:text-gray-200 hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              Last
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
