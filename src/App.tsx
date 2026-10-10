import { useMemo, useState } from 'react';
import FilterBar from './components/FilterBar';
import SummaryCards from './components/SummaryCards';
import TransactionForm from './components/TransactionForm';
import TransactionList from './components/TransactionList';
import { useTransactions } from './hooks/useTransactions';
import { DEFAULT_FILTERS, type Filters } from './types/filters';
import type { Transaction, TransactionFormData } from './types/transaction';
import { computeAggregations } from './utils/aggregations';
import { applyFilters } from './utils/filters';

export default function App() {
  const { transactions, addTransaction, deleteTransaction, editTransaction } =
    useTransactions();
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);

  const filteredTransactions = useMemo(
    () => applyFilters(transactions, filters),
    [transactions, filters]
  );

  const aggregations = useMemo(
    () => computeAggregations(filteredTransactions),
    [filteredTransactions]
  );

  function handleSubmit(data: TransactionFormData) {
    if (editingTransaction) {
      editTransaction(editingTransaction.id, data);
      setEditingTransaction(null);
    } else {
      addTransaction(data);
    }
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <header className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-4xl mx-auto px-4 py-5">
          <h1 className="text-2xl font-bold text-gray-100">Expense Tracker</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Track your income and expenses
          </p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <SummaryCards aggregations={aggregations} />

        <TransactionForm
          onSubmit={handleSubmit}
          editingTransaction={editingTransaction}
          onCancelEdit={() => setEditingTransaction(null)}
        />

        <FilterBar filters={filters} onChange={setFilters} />

        <TransactionList
          transactions={filteredTransactions}
          onDelete={deleteTransaction}
          onEdit={setEditingTransaction}
        />
      </main>
    </div>
  );
}
