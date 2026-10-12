import { useCallback, useEffect, useState } from 'react';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { loadFromStorage, saveToStorage } from '../utils/storage';

const STORAGE_KEY = 'expense-tracker-currency';

export const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  { code: 'KRW', symbol: '₩', name: 'South Korean Won' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
  { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit' },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc' },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real' },
  { code: 'MXN', symbol: 'MX$', name: 'Mexican Peso' },
  { code: 'THB', symbol: '฿', name: 'Thai Baht' },
  { code: 'PHP', symbol: '₱', name: 'Philippine Peso' },
] as const;

export type CurrencyCode = (typeof CURRENCIES)[number]['code'];

export function useCurrency() {
  const [currency, setCurrencyState] = useState<CurrencyCode>(() => {
    return loadFromStorage<CurrencyCode>(STORAGE_KEY) ?? 'USD';
  });

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    supabase
      .from('settings')
      .select('value')
      .eq('key', 'currency')
      .single()
      .then(({ data, error }) => {
        if (!error && data) {
          const code = data.value as CurrencyCode;
          setCurrencyState(code);
          saveToStorage(code, STORAGE_KEY);
        }
      });
  }, []);

  useEffect(() => {
    saveToStorage(currency, STORAGE_KEY);
  }, [currency]);

  const setCurrency = useCallback((code: CurrencyCode) => {
    setCurrencyState(code);

    if (isSupabaseConfigured()) {
      supabase
        .from('settings')
        .upsert({ key: 'currency', value: code })
        .select()
        .then(({ error }) => {
          if (error) console.error('[Supabase] upsert currency failed:', error);
        });
    }
  }, []);

  return { currency, setCurrency };
}
