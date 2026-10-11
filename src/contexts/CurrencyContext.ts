import { createContext, useContext } from 'react';

const CurrencyContext = createContext<string>('USD');

export const CurrencyProvider = CurrencyContext.Provider;

export function useCurrencyCode(): string {
  return useContext(CurrencyContext);
}
