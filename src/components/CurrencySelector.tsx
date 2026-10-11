import { CURRENCIES, type CurrencyCode } from '../hooks/useCurrency';

interface CurrencySelectorProps {
  currency: CurrencyCode;
  onChange: (code: CurrencyCode) => void;
}

export default function CurrencySelector({
  currency,
  onChange,
}: CurrencySelectorProps) {
  return (
    <div className="rounded-xl bg-gray-900 border border-gray-800 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-800">
        <h2 className="text-lg font-semibold text-gray-100">Currency</h2>
        <p className="text-xs text-gray-500 mt-0.5">
          Choose how amounts are displayed across the app
        </p>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {CURRENCIES.map((c) => (
            <button
              key={c.code}
              onClick={() => onChange(c.code)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                currency === c.code
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              <span className="font-semibold text-base w-8 text-center shrink-0">
                {c.symbol}
              </span>
              <span className="truncate">{c.code}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
