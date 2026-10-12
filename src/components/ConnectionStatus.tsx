import { useEffect, useState } from 'react';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { loadFromStorage } from '../utils/storage';

type Status = 'checking' | 'connected' | 'error' | 'not-configured';
type MigrateStatus = 'idle' | 'migrating' | 'done' | 'failed';

export default function ConnectionStatus() {
  const [status, setStatus] = useState<Status>('checking');
  const [detail, setDetail] = useState('');
  const [dbCount, setDbCount] = useState(0);
  const [migrateStatus, setMigrateStatus] = useState<MigrateStatus>('idle');
  const [migrateDetail, setMigrateDetail] = useState('');

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setStatus('not-configured');
      setDetail('No .env file — using localStorage only');
      return;
    }

    supabase
      .from('transactions')
      .select('id', { count: 'exact', head: true })
      .then(({ count, error }) => {
        if (error) {
          setStatus('error');
          setDetail(error.message);
        } else {
          const c = count ?? 0;
          setDbCount(c);
          setStatus('connected');
          setDetail(`${c} transactions in database`);
        }
      });
  }, []);

  async function handleMigrate() {
    setMigrateStatus('migrating');
    setMigrateDetail('');

    try {
      let totalMigrated = 0;

      const localTxns = loadFromStorage<Record<string, unknown>[]>('expense-tracker-transactions');
      if (localTxns && localTxns.length > 0) {
        const rows = localTxns.map((t) => ({
          id: t.id as string,
          date: t.date as string,
          title: t.title as string,
          category: t.category as string,
          amount: Number(t.amount),
          type: t.type as string,
          payment_method: (t.paymentMethod ?? t.payment_method) as string,
          created_at: (t.createdAt ?? t.created_at ?? new Date().toISOString()) as string,
        }));

        const batchSize = 100;
        for (let i = 0; i < rows.length; i += batchSize) {
          const batch = rows.slice(i, i + batchSize);
          const { error } = await supabase
            .from('transactions')
            .upsert(batch);
          if (error) throw new Error(`Transactions: ${error.message}`);
        }
        totalMigrated += rows.length;
      }

      const localBudgets = loadFromStorage<Record<string, number>>('expense-tracker-budgets');
      if (localBudgets && Object.keys(localBudgets).length > 0) {
        const rows = Object.entries(localBudgets).map(([category, limit_amount]) => ({
          category,
          limit_amount,
        }));
        const { error } = await supabase
          .from('budgets')
          .upsert(rows);
        if (error) throw new Error(`Budgets: ${error.message}`);
      }

      const localRules = loadFromStorage<Record<string, unknown>[]>('expense-tracker-recurring');
      if (localRules && localRules.length > 0) {
        const rows = localRules.map((r) => ({
          id: r.id as string,
          title: r.title as string,
          amount: Number(r.amount),
          category: r.category as string,
          type: r.type as string,
          payment_method: (r.paymentMethod ?? r.payment_method) as string,
          frequency: r.frequency as string,
          next_date: (r.nextDate ?? r.next_date) as string,
          end_date: ((r.endDate ?? r.end_date) as string) || null,
          enabled: r.enabled as boolean,
          created_at: (r.createdAt ?? r.created_at ?? new Date().toISOString()) as string,
        }));
        const { error } = await supabase
          .from('recurring_rules')
          .upsert(rows);
        if (error) throw new Error(`Recurring rules: ${error.message}`);
      }

      const localCurrency = loadFromStorage<string>('expense-tracker-currency');
      if (localCurrency) {
        const { error } = await supabase
          .from('settings')
          .upsert({ key: 'currency', value: localCurrency });
        if (error) throw new Error(`Settings: ${error.message}`);
      }

      setMigrateStatus('done');
      setMigrateDetail(
        `Migrated ${totalMigrated} transactions, ` +
          `${Object.keys(localBudgets ?? {}).length} budgets, ` +
          `${localRules?.length ?? 0} recurring rules`
      );

      const { count } = await supabase
        .from('transactions')
        .select('id', { count: 'exact', head: true });
      const c = count ?? 0;
      setDbCount(c);
      setDetail(`${c} transactions in database`);
    } catch (err) {
      setMigrateStatus('failed');
      setMigrateDetail(err instanceof Error ? err.message : 'Unknown error');
    }
  }

  const localCount =
    loadFromStorage<unknown[]>('expense-tracker-transactions')?.length ?? 0;
  const showMigrate =
    status === 'connected' && localCount > 0 && localCount > dbCount;

  const statusConfig = {
    checking: { dot: 'bg-yellow-400 animate-pulse', label: 'Checking...' },
    connected: { dot: 'bg-emerald-400', label: 'Connected' },
    error: { dot: 'bg-red-400', label: 'Error' },
    'not-configured': { dot: 'bg-gray-500', label: 'Not configured' },
  };

  const { dot, label } = statusConfig[status];

  return (
    <div className="rounded-xl bg-gray-900 border border-gray-800 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-800">
        <h2 className="text-lg font-semibold text-gray-100">Database</h2>
        <p className="text-xs text-gray-500 mt-0.5">
          Supabase connection status
        </p>
      </div>

      <div className="p-6 space-y-4">
        <div className="flex items-center gap-3">
          <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${dot}`} />
          <div>
            <p className="text-sm font-medium text-gray-200">{label}</p>
            <p className="text-xs text-gray-500 mt-0.5">{detail}</p>
          </div>
        </div>

        {showMigrate && migrateStatus === 'idle' && (
          <div className="rounded-lg bg-blue-900/20 border border-blue-800 p-4">
            <p className="text-sm text-blue-300 mb-2">
              {localCount} transactions in localStorage,{' '}
              {dbCount} in database
            </p>
            <button
              onClick={handleMigrate}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              Migrate Local Data to Supabase
            </button>
          </div>
        )}

        {migrateStatus === 'migrating' && (
          <div className="flex items-center gap-2 text-sm text-yellow-400">
            <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
            Migrating...
          </div>
        )}

        {migrateStatus === 'done' && (
          <div className="rounded-lg bg-emerald-900/20 border border-emerald-800 p-3 text-sm text-emerald-400">
            {migrateDetail}
          </div>
        )}

        {migrateStatus === 'failed' && (
          <div className="rounded-lg bg-red-900/20 border border-red-800 p-3 text-xs text-red-400">
            Migration failed: {migrateDetail}
          </div>
        )}

        {status === 'not-configured' && (
          <div className="rounded-lg bg-gray-800 p-3 text-xs text-gray-400 space-y-1">
            <p>To connect Supabase:</p>
            <ol className="list-decimal list-inside space-y-0.5 text-gray-500">
              <li>Create a project at supabase.com</li>
              <li>
                Run <code className="text-gray-300">supabase-schema.sql</code>{' '}
                in the SQL Editor
              </li>
              <li>
                Create <code className="text-gray-300">.env</code> with your URL
                and anon key
              </li>
              <li>Restart the dev server</li>
            </ol>
          </div>
        )}

        {status === 'error' && (
          <div className="rounded-lg bg-red-900/20 border border-red-800 p-3 text-xs text-red-400">
            Check your .env values and that the schema has been run in
            Supabase.
          </div>
        )}
      </div>
    </div>
  );
}
