import { useState } from 'react';
import { useFormatCurrency } from '../hooks/useFormatCurrency';
import type { BudgetMap, BudgetStatus } from '../types/budget';
import { getBudgetStatus } from '../types/budget';
import type { Category } from '../types/transaction';
import { CATEGORIES } from '../types/transaction';

interface BudgetPanelProps {
  budgets: BudgetMap;
  categorySpending: Map<Category, number>;
  onSetBudget: (category: Category, limit: number) => void;
  onRemoveBudget: (category: Category) => void;
}

const STATUS_STYLES: Record<BudgetStatus, { badge: string; bar: string }> = {
  under: {
    badge: 'bg-emerald-900/50 text-emerald-400 border border-emerald-800',
    bar: 'bg-emerald-500',
  },
  near: {
    badge: 'bg-yellow-900/50 text-yellow-400 border border-yellow-800',
    bar: 'bg-yellow-500',
  },
  over: {
    badge: 'bg-red-900/50 text-red-400 border border-red-800',
    bar: 'bg-red-500',
  },
};

const STATUS_LABELS: Record<BudgetStatus, string> = {
  under: 'Under Budget',
  near: 'Near Limit',
  over: 'Over Budget',
};

const EXPENSE_CATEGORIES = CATEGORIES.filter(
  (c) => c !== 'Salary' && c !== 'Freelance'
);

export default function BudgetPanel({
  budgets,
  categorySpending,
  onSetBudget,
  onRemoveBudget,
}: BudgetPanelProps) {
  const formatCurrency = useFormatCurrency();
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editValue, setEditValue] = useState('');

  function startEdit(category: Category) {
    setEditingCategory(category);
    setEditValue(budgets[category]?.toString() ?? '');
  }

  function saveEdit(category: Category) {
    const val = parseFloat(editValue);
    if (!isNaN(val) && val > 0) {
      onSetBudget(category, val);
    }
    setEditingCategory(null);
    setEditValue('');
  }

  function handleKeyDown(e: React.KeyboardEvent, category: Category) {
    if (e.key === 'Enter') saveEdit(category);
    if (e.key === 'Escape') setEditingCategory(null);
  }

  return (
    <div className="rounded-xl bg-gray-900 border border-gray-800 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-800">
        <h2 className="text-lg font-semibold text-gray-100">
          Monthly Budgets
        </h2>
        <p className="text-xs text-gray-500 mt-0.5">
          Set spending caps per category for the current month
        </p>
      </div>

      <ul className="divide-y divide-gray-800">
        {EXPENSE_CATEGORIES.map((category) => {
          const limit = budgets[category];
          const spent = Math.max(0, categorySpending.get(category) ?? 0);
          const hasBudget = limit !== undefined && limit > 0;
          const status = hasBudget ? getBudgetStatus(spent, limit) : null;
          const pct = hasBudget ? Math.min((spent / limit) * 100, 100) : 0;

          return (
            <li key={category} className="px-6 py-3.5">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-gray-200 min-w-0 truncate">
                  {category}
                </span>

                <div className="flex items-center gap-2 shrink-0">
                  {hasBudget && status && (
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${STATUS_STYLES[status].badge}`}
                    >
                      {STATUS_LABELS[status]}
                    </span>
                  )}

                  {editingCategory === category ? (
                    <div className="flex items-center gap-1">
                      <span className="text-sm text-gray-400">$</span>
                      <input
                        type="number"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, category)}
                        onBlur={() => saveEdit(category)}
                        autoFocus
                        className="w-24 rounded border border-gray-600 bg-gray-800 px-2 py-1 text-sm text-gray-100 outline-none focus:border-blue-500"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      {hasBudget && (
                        <span className="text-sm text-gray-400">
                          {formatCurrency(spent)} / {formatCurrency(limit)}
                        </span>
                      )}
                      <button
                        onClick={() => startEdit(category)}
                        className="p-1 rounded text-gray-500 hover:text-blue-400 hover:bg-blue-900/30 transition-colors"
                        title={hasBudget ? 'Edit budget' : 'Set budget'}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          className="w-3.5 h-3.5"
                        >
                          <path d="m5.433 13.917 1.262-3.155A4 4 0 0 1 7.58 9.42l6.92-6.918a2.121 2.121 0 0 1 3 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 0 1-.65-.65Z" />
                          <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0 0 10 3H4.75A2.75 2.75 0 0 0 2 5.75v9.5A2.75 2.75 0 0 0 4.75 18h9.5A2.75 2.75 0 0 0 17 15.25V10a.75.75 0 0 0-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5Z" />
                        </svg>
                      </button>
                      {hasBudget && (
                        <button
                          onClick={() => onRemoveBudget(category)}
                          className="p-1 rounded text-gray-500 hover:text-red-400 hover:bg-red-900/30 transition-colors"
                          title="Remove budget"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            className="w-3.5 h-3.5"
                          >
                            <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
                          </svg>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {hasBudget && (
                <div className="mt-2 h-1.5 rounded-full bg-gray-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${STATUS_STYLES[status!].bar}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
