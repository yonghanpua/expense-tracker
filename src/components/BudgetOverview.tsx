import type { BudgetMap, BudgetStatus } from '../types/budget';
import { getBudgetStatus } from '../types/budget';
import type { Category } from '../types/transaction';
import { CATEGORIES } from '../types/transaction';
import { formatCurrency } from '../utils/format';

interface BudgetOverviewProps {
  budgets: BudgetMap;
  categorySpending: Map<Category, number>;
  onNavigateToSettings: () => void;
}

const BAR_COLORS: Record<BudgetStatus, string> = {
  under: 'bg-emerald-500',
  near: 'bg-yellow-500',
  over: 'bg-red-500',
};

const EXPENSE_CATEGORIES = CATEGORIES.filter(
  (c) => c !== 'Salary' && c !== 'Freelance'
);

export default function BudgetOverview({
  budgets,
  categorySpending,
  onNavigateToSettings,
}: BudgetOverviewProps) {
  const activeBudgets = EXPENSE_CATEGORIES.filter(
    (c) => budgets[c] !== undefined && budgets[c] > 0
  );

  if (activeBudgets.length === 0) {
    return (
      <div className="rounded-xl bg-gray-900 border border-gray-800 p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-100">
            Budget Status
          </h2>
          <button
            onClick={onNavigateToSettings}
            className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
          >
            Set up budgets
          </button>
        </div>
        <p className="text-sm text-gray-500 text-center py-4">
          No budgets configured yet
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-gray-900 border border-gray-800 p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-100">Budget Status</h2>
        <button
          onClick={onNavigateToSettings}
          className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
        >
          Edit budgets
        </button>
      </div>

      <div className="space-y-3">
        {activeBudgets.map((category) => {
          const limit = budgets[category]!;
          const spent = Math.max(0, categorySpending.get(category) ?? 0);
          const status = getBudgetStatus(spent, limit);
          const pct = Math.min((spent / limit) * 100, 100);

          return (
            <div key={category}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-300">{category}</span>
                <span className="text-xs text-gray-400">
                  {formatCurrency(spent)} / {formatCurrency(limit)}
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-gray-800 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${BAR_COLORS[status]}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
