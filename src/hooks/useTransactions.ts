import { useCallback, useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { Transaction, TransactionFormData } from '../types/transaction';
import { loadFromStorage, saveToStorage } from '../utils/storage';

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    return loadFromStorage<Transaction[]>() ?? [];
  });

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
  }, []);

  const deleteTransaction = useCallback((id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const editTransaction = useCallback((id: string, formData: TransactionFormData) => {
    setTransactions((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              date: formData.date,
              title: formData.title.trim(),
              category: formData.category,
              amount: parseFloat(formData.amount),
              type: formData.type,
              paymentMethod: formData.paymentMethod,
            }
          : t
      )
    );
  }, []);

  const importTransactions = useCallback((incoming: Transaction[]) => {
    setTransactions((prev) => {
      const existingIds = new Set(prev.map((t) => t.id));
      const newOnes = incoming.filter((t) => !existingIds.has(t.id));
      return [...newOnes, ...prev];
    });
  }, []);

  const clearTransactions = useCallback(() => {
    setTransactions([]);
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
  };
}
