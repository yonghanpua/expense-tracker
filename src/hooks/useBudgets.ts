import { useCallback, useEffect, useState } from 'react';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import type { BudgetMap } from '../types/budget';
import type { Category } from '../types/transaction';
import { loadFromStorage, saveToStorage } from '../utils/storage';

const BUDGET_STORAGE_KEY = 'expense-tracker-budgets';

export function useBudgets() {
  const [budgets, setBudgets] = useState<BudgetMap>(() => {
    return loadFromStorage<BudgetMap>(BUDGET_STORAGE_KEY) ?? {};
  });

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    supabase
      .from('budgets')
      .select('*')
      .then(({ data, error }) => {
        if (error) {
          console.error('[Supabase] fetch budgets failed:', error);
        } else if (data) {
          const map: BudgetMap = {};
          for (const row of data) {
            map[row.category] = Number(row.limit_amount);
          }
          setBudgets(map);
          saveToStorage(map, BUDGET_STORAGE_KEY);
        }
      });
  }, []);

  useEffect(() => {
    saveToStorage(budgets, BUDGET_STORAGE_KEY);
  }, [budgets]);

  const setBudget = useCallback((category: Category, limit: number) => {
    setBudgets((prev) => ({ ...prev, [category]: limit }));

    if (isSupabaseConfigured()) {
      supabase
        .from('budgets')
        .upsert({ category, limit_amount: limit })
        .select()
        .then(({ error }) => {
          if (error) console.error('[Supabase] upsert budget failed:', error);
        });
    }
  }, []);

  const removeBudget = useCallback((category: Category) => {
    setBudgets((prev) => {
      const next = { ...prev };
      delete next[category];
      return next;
    });

    if (isSupabaseConfigured()) {
      supabase
        .from('budgets')
        .delete()
        .eq('category', category)
        .then(({ error }) => {
          if (error) console.error('[Supabase] delete budget failed:', error);
        });
    }
  }, []);

  return { budgets, setBudget, removeBudget };
}
