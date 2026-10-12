import { useMemo, useState } from 'react';
import BudgetOverview from './components/BudgetOverview';
import BudgetPanel from './components/BudgetPanel';
import CategoryChart from './components/CategoryChart';
import ConnectionStatus from './components/ConnectionStatus';
import CurrencySelector from './components/CurrencySelector';
import DataManagement from './components/DataManagement';
import FilterBar from './components/FilterBar';
import InsightCards from './components/InsightCards';
import RecurringPanel from './components/RecurringPanel';
import SummaryCards from './components/SummaryCards';
import ToastContainer from './components/Toast';
import TransactionForm from './components/TransactionForm';
import TransactionList from './components/TransactionList';
import TrendChart from './components/TrendChart';
import { CurrencyProvider } from './contexts/CurrencyContext';
import { useBudgets } from './hooks/useBudgets';
import { useCurrency } from './hooks/useCurrency';
import { useRecurring } from './hooks/useRecurring';
import { useToast } from './hooks/useToast';
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
  const { currency, setCurrency } = useCurrency();
  const { budgets, setBudget, removeBudget } = useBudgets();
  const { rules, addRule, removeRule, toggleRule } =
    useRecurring(importTransactions);
  const { toasts, toast, dismiss } = useToast();
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
      toast('Transaction updated');
    } else {
      addTransaction(data);
      toast('Transaction added');
    }
  }

  function handleDelete(id: string) {
    deleteTransaction(id);
    toast('Transaction deleted');
  }

  function handleImport(imported: Transaction[]) {
    importTransactions(imported);
    toast(`${imported.length} transaction${imported.length !== 1 ? 's' : ''} imported`);
  }

  function handleClearAll() {
    clearTransactions();
    toast('All transactions cleared', 'info');
  }

  function handleSetBudget(category: Parameters<typeof setBudget>[0], limit: number) {
    setBudget(category, limit);
    toast(`Budget set for ${category}`);
  }

  function handleRemoveBudget(category: Parameters<typeof removeBudget>[0]) {
    removeBudget(category);
    toast(`Budget removed for ${category}`, 'info');
  }

  function handleAddRule(rule: Parameters<typeof addRule>[0]) {
    addRule(rule);
    toast('Recurring rule added');
  }

  function handleRemoveRule(id: string) {
    removeRule(id);
    toast('Recurring rule removed', 'info');
  }

  return (
    <CurrencyProvider value={currency}>
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
              onDelete={handleDelete}
              onEdit={setEditingTransaction}
            />
          </>
        )}

        {page === 'settings' && (
          <>
            <RecurringPanel
              rules={rules}
              onAdd={handleAddRule}
              onRemove={handleRemoveRule}
              onToggle={toggleRule}
            />

            <BudgetPanel
              budgets={budgets}
              categorySpending={currentMonthSpending}
              onSetBudget={handleSetBudget}
              onRemoveBudget={handleRemoveBudget}
            />

            <CurrencySelector
              currency={currency}
              onChange={setCurrency}
            />

            <ConnectionStatus />

            <DataManagement
              transactions={transactions}
              onImport={handleImport}
              onClearAll={handleClearAll}
            />
          </>
        )}
      </main>

      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </div>
    </CurrencyProvider>
  );
}
