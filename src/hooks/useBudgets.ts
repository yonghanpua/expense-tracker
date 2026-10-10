import { useCallback, useEffect, useState } from 'react';
import type { BudgetMap } from '../types/budget';
import type { Category } from '../types/transaction';
import { loadFromStorage, saveToStorage } from '../utils/storage';

const BUDGET_STORAGE_KEY = 'expense-tracker-budgets';

export function useBudgets() {
  const [budgets, setBudgets] = useState<BudgetMap>(() => {
    return loadFromStorage<BudgetMap>(BUDGET_STORAGE_KEY) ?? {};
  });

  useEffect(() => {
    saveToStorage(budgets, BUDGET_STORAGE_KEY);
  }, [budgets]);

  const setBudget = useCallback((category: Category, limit: number) => {
    setBudgets((prev) => ({ ...prev, [category]: limit }));
  }, []);

  const removeBudget = useCallback((category: Category) => {
    setBudgets((prev) => {
      const next = { ...prev };
      delete next[category];
      return next;
    });
  }, []);

  return { budgets, setBudget, removeBudget };
}
