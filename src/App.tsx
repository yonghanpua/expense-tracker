import { useMemo, useState } from 'react';
import BudgetPanel from './components/BudgetPanel';
import CategoryChart from './components/CategoryChart';
import FilterBar from './components/FilterBar';
import MonthlyTrendChart from './components/MonthlyTrendChart';
import SummaryCards from './components/SummaryCards';
import TransactionForm from './components/TransactionForm';
import TransactionList from './components/TransactionList';
import { useBudgets } from './hooks/useBudgets';
import { useTransactions } from './hooks/useTransactions';
import { DEFAULT_FILTERS, type Filters } from './types/filters';
import type { Transaction, TransactionFormData } from './types/transaction';
import { computeAggregations } from './utils/aggregations';
import { applyFilters } from './utils/filters';

export default function App() {
  const { transactions, addTransaction, deleteTransaction, editTransaction } =
    useTransactions();
  const { budgets, setBudget, removeBudget } = useBudgets();
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

  const currentMonthSpending = useMemo(() => {
    const now = new Date();
    const prefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const monthTransactions = transactions.filter(
      (t) => t.date.startsWith(prefix) && t.type === 'expense'
    );
    return computeAggregations(monthTransactions).categoryTotals;
  }, [transactions]);

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
        <div className="max-w-5xl mx-auto px-4 py-5">
          <h1 className="text-2xl font-bold text-gray-100">Expense Tracker</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Track your income and expenses
          </p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        <SummaryCards aggregations={aggregations} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CategoryChart categoryTotals={aggregations.categoryTotals} />
          <MonthlyTrendChart transactions={transactions} />
        </div>

        <BudgetPanel
          budgets={budgets}
          categorySpending={currentMonthSpending}
          onSetBudget={setBudget}
          onRemoveBudget={removeBudget}
        />

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
