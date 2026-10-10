import type { Category, Transaction } from '../types/transaction';

export interface Aggregations {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  categoryTotals: Map<Category, number>;
}

export function computeAggregations(transactions: Transaction[]): Aggregations {
  let totalIncome = 0;
  let totalExpense = 0;
  const categoryTotals = new Map<Category, number>();

  for (const t of transactions) {
    if (t.type === 'income') {
      totalIncome += t.amount;
    } else {
      totalExpense += t.amount;
    }

    const current = categoryTotals.get(t.category) ?? 0;
    categoryTotals.set(
      t.category,
      t.type === 'expense' ? current + t.amount : current - t.amount
    );
  }

  return {
    totalIncome,
    totalExpense,
    balance: totalIncome - totalExpense,
    categoryTotals,
  };
}
