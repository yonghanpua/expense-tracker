import { useMemo, useState } from 'react';
import BudgetOverview from './components/BudgetOverview';
import BudgetPanel from './components/BudgetPanel';
import CategoryChart from './components/CategoryChart';
import DataManagement from './components/DataManagement';
import FilterBar from './components/FilterBar';
import RecurringPanel from './components/RecurringPanel';
import InsightCards from './components/InsightCards';
import SummaryCards from './components/SummaryCards';
import TransactionForm from './components/TransactionForm';
import TransactionList from './components/TransactionList';
import TrendChart from './components/TrendChart';
import { useBudgets } from './hooks/useBudgets';
import { useRecurring } from './hooks/useRecurring';
import { useTransactions } from './hooks/useTransactions';
import { DEFAULT_FILTERS, type Filters } from './types/filters';
import type { Transaction, TransactionFormData } from './types/transaction';
import { computeAggregations } from './utils/aggregations';
import { applyFilters } from './utils/filters';

type Page = 'dashboard' | 'settings';

export default function App() {
  const {
    transactions,
    addTransaction,
    deleteTransaction,
    editTransaction,
    importTransactions,
    clearTransactions,
  } = useTransactions();
  const { budgets, setBudget, removeBudget } = useBudgets();
  const { rules, addRule, removeRule, toggleRule } =
    useRecurring(importTransactions);
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [page, setPage] = useState<Page>('dashboard');

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
        <div className="max-w-5xl mx-auto px-4">
          <div className="py-5">
            <h1 className="text-2xl font-bold text-gray-100">
              Expense Tracker
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">
              Track your income and expenses
            </p>
          </div>

          <nav className="flex gap-1 -mb-px">
            <button
              onClick={() => setPage('dashboard')}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                page === 'dashboard'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-600'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setPage('settings')}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                page === 'settings'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-600'
              }`}
            >
              Settings
            </button>
          </nav>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {page === 'dashboard' && (
          <>
            <FilterBar filters={filters} onChange={setFilters} />

            <SummaryCards aggregations={aggregations} />

            <InsightCards transactions={filteredTransactions} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <CategoryChart categoryTotals={aggregations.categoryTotals} />
              <TrendChart
                transactions={filteredTransactions}
                timePeriod={filters.timePeriod}
              />
            </div>

            <BudgetOverview
              budgets={budgets}
              categorySpending={currentMonthSpending}
              onNavigateToSettings={() => setPage('settings')}
            />

            <TransactionForm
              onSubmit={handleSubmit}
              editingTransaction={editingTransaction}
              onCancelEdit={() => setEditingTransaction(null)}
            />

            <TransactionList
              transactions={filteredTransactions}
              onDelete={deleteTransaction}
              onEdit={setEditingTransaction}
            />
          </>
        )}

        {page === 'settings' && (
          <>
            <RecurringPanel
              rules={rules}
              onAdd={addRule}
              onRemove={removeRule}
              onToggle={toggleRule}
            />

            <BudgetPanel
              budgets={budgets}
              categorySpending={currentMonthSpending}
              onSetBudget={setBudget}
              onRemoveBudget={removeBudget}
            />

            <DataManagement
              transactions={transactions}
              onImport={importTransactions}
              onClearAll={clearTransactions}
            />
          </>
        )}
      </main>
    </div>
  );
}
