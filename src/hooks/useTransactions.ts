import { useCallback, useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import type { Transaction, TransactionFormData } from '../types/transaction';
import { loadFromStorage, saveToStorage } from '../utils/storage';

function toDbRow(t: Transaction) {
  return {
    id: t.id,
    date: t.date,
    title: t.title,
    category: t.category,
    amount: t.amount,
    type: t.type,
    payment_method: t.paymentMethod,
    created_at: t.createdAt,
  };
}

function fromDbRow(row: Record<string, unknown>): Transaction {
  return {
    id: row.id as string,
    date: row.date as string,
    title: row.title as string,
    category: row.category as string as Transaction['category'],
    amount: Number(row.amount),
    type: row.type as Transaction['type'],
    paymentMethod: row.payment_method as string as Transaction['paymentMethod'],
    createdAt: row.created_at as string,
  };
}

function logError(operation: string, error: unknown) {
  console.error(`[Supabase] ${operation} failed:`, error);
}

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    return loadFromStorage<Transaction[]>() ?? [];
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    setLoading(true);
    supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          logError('fetch transactions', error);
        } else if (data) {
          const txns = data.map(fromDbRow);
          setTransactions(txns);
          saveToStorage(txns);
        }
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    saveToStorage(transactions);
  }, [transactions]);

  const addTransaction = useCallback((formData: TransactionFormData) => {
    const transaction: Transaction = {
      id: uuidv4(),
      date: formData.date,
      title: formData.title.trim(),
      category: formData.category,
      amount: parseFloat(formData.amount),
      type: formData.type,
      paymentMethod: formData.paymentMethod,
      createdAt: new Date().toISOString(),
    };
    setTransactions((prev) => [transaction, ...prev]);

    if (isSupabaseConfigured()) {
      supabase
        .from('transactions')
        .insert(toDbRow(transaction))
        .select()
        .then(({ error }) => {
          if (error) logError('insert transaction', error);
        });
    }
  }, []);

  const deleteTransaction = useCallback((id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));

    if (isSupabaseConfigured()) {
      supabase
        .from('transactions')
        .delete()
        .eq('id', id)
        .then(({ error }) => {
          if (error) logError('delete transaction', error);
        });
    }
  }, []);

  const editTransaction = useCallback(
    (id: string, formData: TransactionFormData) => {
      const updates = {
        date: formData.date,
        title: formData.title.trim(),
        category: formData.category,
        amount: parseFloat(formData.amount),
        type: formData.type,
        payment_method: formData.paymentMethod,
      };

      setTransactions((prev) =>
        prev.map((t) =>
          t.id === id
            ? {
                ...t,
                date: updates.date,
                title: updates.title,
                category: updates.category as Transaction['category'],
                amount: updates.amount,
                type: updates.type as Transaction['type'],
                paymentMethod:
                  updates.payment_method as Transaction['paymentMethod'],
              }
            : t
        )
      );

      if (isSupabaseConfigured()) {
        supabase
          .from('transactions')
          .update(updates)
          .eq('id', id)
          .select()
          .then(({ error }) => {
            if (error) logError('update transaction', error);
          });
      }
    },
    []
  );

  const importTransactions = useCallback((incoming: Transaction[]) => {
    setTransactions((prev) => {
      const existingIds = new Set(prev.map((t) => t.id));
      const newOnes = incoming.filter((t) => !existingIds.has(t.id));

      if (isSupabaseConfigured() && newOnes.length > 0) {
        supabase
          .from('transactions')
          .upsert(newOnes.map(toDbRow))
          .select()
          .then(({ error }) => {
            if (error) logError('import transactions', error);
          });
      }

      return [...newOnes, ...prev];
    });
  }, []);

  const clearTransactions = useCallback(() => {
    setTransactions([]);

    if (isSupabaseConfigured()) {
      supabase
        .from('transactions')
        .delete()
        .neq('id', '')
        .then(({ error }) => {
          if (error) logError('clear transactions', error);
        });
    }
  }, []);

  const sortedTransactions = [...transactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return {
    transactions: sortedTransactions,
    addTransaction,
    deleteTransaction,
    editTransaction,
    importTransactions,
    clearTransactions,
    loading,
  };
}
