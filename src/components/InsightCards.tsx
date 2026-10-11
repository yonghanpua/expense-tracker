import { useFormatCurrency } from '../hooks/useFormatCurrency';
import type { Transaction } from '../types/transaction';

interface InsightCardsProps {
  transactions: Transaction[];
}

interface Insight {
  label: string;
  value: string;
  detail?: string;
}

function computeInsights(
  transactions: Transaction[],
  formatCurrency: (n: number) => string
): Insight[] {
  if (transactions.length === 0) return [];

  const expenses = transactions.filter((t) => t.type === 'expense');
  const incomes = transactions.filter((t) => t.type === 'income');
  const insights: Insight[] = [];

  if (expenses.length > 0) {
    const avg = expenses.reduce((s, t) => s + t.amount, 0) / expenses.length;
    insights.push({
      label: 'Avg Expense',
      value: formatCurrency(avg),
      detail: `across ${expenses.length} transactions`,
    });

    const biggest = expenses.reduce((max, t) =>
      t.amount > max.amount ? t : max
    );
    insights.push({
      label: 'Biggest Expense',
      value: formatCurrency(biggest.amount),
      detail: biggest.title,
    });

    const categoryTotals = new Map<string, number>();
    for (const t of expenses) {
      categoryTotals.set(
        t.category,
        (categoryTotals.get(t.category) ?? 0) + t.amount
      );
    }
    let topCategory = '';
    let topAmount = 0;
    for (const [cat, amount] of categoryTotals) {
      if (amount > topAmount) {
        topCategory = cat;
        topAmount = amount;
      }
    }
    if (topCategory) {
      insights.push({
        label: 'Top Category',
        value: topCategory,
        detail: formatCurrency(topAmount),
      });
    }
  }

  if (incomes.length > 0 && expenses.length > 0) {
    const totalIncome = incomes.reduce((s, t) => s + t.amount, 0);
    const totalExpense = expenses.reduce((s, t) => s + t.amount, 0);
    if (totalIncome > 0) {
      const savingsRate = ((totalIncome - totalExpense) / totalIncome) * 100;
      insights.push({
        label: 'Savings Rate',
        value: `${savingsRate.toFixed(0)}%`,
        detail: savingsRate >= 0 ? 'of income saved' : 'spending exceeds income',
      });
    }
  }

  return insights;
}

export default function InsightCards({ transactions }: InsightCardsProps) {
  const formatCurrency = useFormatCurrency();
  const insights = computeInsights(transactions, formatCurrency);

  if (insights.length === 0) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {insights.map((insight) => (
        <div
          key={insight.label}
          className="rounded-xl bg-gray-900 border border-gray-800 p-4"
        >
          <p className="text-xs font-medium text-gray-500">{insight.label}</p>
          <p className="mt-1 text-lg font-bold text-gray-100 truncate">
            {insight.value}
          </p>
          {insight.detail && (
            <p className="text-xs text-gray-500 mt-0.5 truncate">
              {insight.detail}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
