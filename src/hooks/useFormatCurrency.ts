import { useCallback } from 'react';
import { useCurrencyCode } from '../contexts/CurrencyContext';
import { formatCurrency } from '../utils/format';

export function useFormatCurrency() {
  const currency = useCurrencyCode();
  return useCallback(
    (amount: number) => formatCurrency(amount, currency),
    [currency]
  );
}
