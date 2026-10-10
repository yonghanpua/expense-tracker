import type { Category } from './transaction';

export interface CategoryBudget {
  category: Category;
  limit: number;
}

export type BudgetMap = Record<string, number>;

export type BudgetStatus = 'under' | 'near' | 'over';

export function getBudgetStatus(spent: number, limit: number): BudgetStatus {
  const ratio = spent / limit;
  if (ratio >= 1) return 'over';
  if (ratio >= 0.8) return 'near';
  return 'under';
}
