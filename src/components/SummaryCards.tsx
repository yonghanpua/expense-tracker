import { useFormatCurrency } from '../hooks/useFormatCurrency';
import type { Aggregations } from '../utils/aggregations';

interface SummaryCardsProps {
  aggregations: Aggregations;
}

export default function SummaryCards({ aggregations }: SummaryCardsProps) {
  const formatCurrency = useFormatCurrency();
  const { totalIncome, totalExpense, balance } = aggregations;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="rounded-xl bg-gray-900 p-5 border border-gray-800">
        <p className="text-sm font-medium text-gray-400">Total Income</p>
        <p className="mt-1 text-2xl font-bold text-emerald-400">
          {formatCurrency(totalIncome)}
        </p>
      </div>
      <div className="rounded-xl bg-gray-900 p-5 border border-gray-800">
        <p className="text-sm font-medium text-gray-400">Total Expenses</p>
        <p className="mt-1 text-2xl font-bold text-red-400">
          {formatCurrency(totalExpense)}
        </p>
      </div>
      <div className="rounded-xl bg-gray-900 p-5 border border-gray-800">
        <p className="text-sm font-medium text-gray-400">Net Balance</p>
        <p
          className={`mt-1 text-2xl font-bold ${
            balance >= 0 ? 'text-emerald-400' : 'text-red-400'
          }`}
        >
          {formatCurrency(balance)}
        </p>
      </div>
    </div>
  );
}
