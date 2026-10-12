import { useCallback, useEffect, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import type { RecurringRule } from '../types/recurring';
import { advanceDate } from '../types/recurring';
import type { Transaction } from '../types/transaction';
import { loadFromStorage, saveToStorage } from '../utils/storage';

const STORAGE_KEY = 'expense-tracker-recurring';

function toDbRow(r: RecurringRule) {
  return {
    id: r.id,
    title: r.title,
    amount: r.amount,
    category: r.category,
    type: r.type,
    payment_method: r.paymentMethod,
    frequency: r.frequency,
    next_date: r.nextDate,
    end_date: r.endDate || null,
    enabled: r.enabled,
    created_at: r.createdAt,
  };
}

function fromDbRow(row: Record<string, unknown>): RecurringRule {
  return {
    id: row.id as string,
    title: row.title as string,
    amount: Number(row.amount),
    category: row.category as string as RecurringRule['category'],
    type: row.type as RecurringRule['type'],
    paymentMethod: row.payment_method as string as RecurringRule['paymentMethod'],
    frequency: row.frequency as RecurringRule['frequency'],
    nextDate: row.next_date as string,
    endDate: (row.end_date as string) ?? '',
    enabled: row.enabled as boolean,
    createdAt: row.created_at as string,
  };
}

function todayISO(): string {
  return new Date().toISOString().split('T')[0];
}

export function useRecurring(addTransactions: (txns: Transaction[]) => void) {
  const [rules, setRules] = useState<RecurringRule[]>(() => {
    return loadFromStorage<RecurringRule[]>(STORAGE_KEY) ?? [];
  });

  const hasProcessed = useRef(false);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    supabase
      .from('recurring_rules')
      .select('*')
      .then(({ data, error }) => {
        if (!error && data) {
          const loaded = data.map(fromDbRow);
          setRules(loaded);
          saveToStorage(loaded, STORAGE_KEY);
        }
      });
  }, []);

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

      if (isSupabaseConfigured()) {
        for (const rule of nextRules) {
          supabase
            .from('recurring_rules')
            .update({
              next_date: rule.nextDate,
              enabled: rule.enabled,
            })
            .eq('id', rule.id)
            .select()
            .then(({ error }) => {
              if (error) console.error('[Supabase] update recurring rule failed:', error);
            });
        }
      }
    }
  }, []);

  const addRule = useCallback(
    (rule: Omit<RecurringRule, 'id' | 'createdAt'>) => {
      const newRule: RecurringRule = {
        ...rule,
        id: uuidv4(),
        createdAt: new Date().toISOString(),
      };
      setRules((prev) => [...prev, newRule]);

      if (isSupabaseConfigured()) {
        supabase
          .from('recurring_rules')
          .insert(toDbRow(newRule))
          .select()
          .then(({ error }) => {
            if (error) console.error('[Supabase] insert recurring rule failed:', error);
          });
      }
    },
    []
  );

  const removeRule = useCallback((id: string) => {
    setRules((prev) => prev.filter((r) => r.id !== id));

    if (isSupabaseConfigured()) {
      supabase
        .from('recurring_rules')
        .delete()
        .eq('id', id)
        .then(({ error }) => {
          if (error) console.error('[Supabase] delete recurring rule failed:', error);
        });
    }
  }, []);

  const toggleRule = useCallback((id: string) => {
    setRules((prev) => {
      const updated = prev.map((r) =>
        r.id === id ? { ...r, enabled: !r.enabled } : r
      );

      if (isSupabaseConfigured()) {
        const rule = updated.find((r) => r.id === id);
        if (rule) {
          supabase
            .from('recurring_rules')
            .update({ enabled: rule.enabled })
            .eq('id', id)
            .select()
            .then(({ error }) => {
              if (error) console.error('[Supabase] toggle recurring rule failed:', error);
            });
        }
      }

      return updated;
    });
  }, []);

  return { rules, addRule, removeRule, toggleRule };
}
