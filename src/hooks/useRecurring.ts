import { useCallback, useEffect, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { RecurringRule } from '../types/recurring';
import { advanceDate } from '../types/recurring';
import type { Transaction } from '../types/transaction';
import { loadFromStorage, saveToStorage } from '../utils/storage';

const STORAGE_KEY = 'expense-tracker-recurring';

function todayISO(): string {
  return new Date().toISOString().split('T')[0];
}

export function useRecurring(addTransactions: (txns: Transaction[]) => void) {
  const [rules, setRules] = useState<RecurringRule[]>(() => {
    return loadFromStorage<RecurringRule[]>(STORAGE_KEY) ?? [];
  });

  const hasProcessed = useRef(false);

  useEffect(() => {
    saveToStorage(rules, STORAGE_KEY);
  }, [rules]);

  useEffect(() => {
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const today = todayISO();
    const generated: Transaction[] = [];
    let updated = false;

    const nextRules = rules.map((rule) => {
      if (!rule.enabled) return rule;

      let { nextDate } = rule;
      const end = rule.endDate || '';
      let count = 0;
      let expired = false;

      while (nextDate <= today && count < 365) {
        if (end && nextDate > end) {
          expired = true;
          break;
        }
        generated.push({
          id: uuidv4(),
          date: nextDate,
          title: rule.title,
          category: rule.category,
          amount: rule.amount,
          type: rule.type,
          paymentMethod: rule.paymentMethod,
          createdAt: new Date().toISOString(),
        });
        nextDate = advanceDate(nextDate, rule.frequency);
        count++;
        updated = true;
      }

      if (!expired && end && nextDate > end) {
        expired = true;
      }

      return { ...rule, nextDate, enabled: expired ? false : rule.enabled };
    });

    if (updated) {
      setRules(nextRules);
      addTransactions(generated);
    }
  }, []);

  const addRule = useCallback((rule: Omit<RecurringRule, 'id' | 'createdAt'>) => {
    setRules((prev) => [
      ...prev,
      { ...rule, id: uuidv4(), createdAt: new Date().toISOString() },
    ]);
  }, []);

  const removeRule = useCallback((id: string) => {
    setRules((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const toggleRule = useCallback((id: string) => {
    setRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r))
    );
  }, []);

  return { rules, addRule, removeRule, toggleRule };
}
