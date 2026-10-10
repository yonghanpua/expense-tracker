import type { Transaction } from '../types/transaction';
import { formatCurrency } from '../utils/format';

interface SummaryCardsProps {
  transactions: Transaction[];
}

export default function SummaryCards({ transactions }: SummaryCardsProps) {
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpense;

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
