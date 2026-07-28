import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";

// Kept as a plain object (not inside a component) so Vite HMR is happy
export const CURRENCIES = {
  INR: { symbol: "₹",    label: "INR — Indian Rupee" },
  USD: { symbol: "$",    label: "USD — US Dollar" },
  EUR: { symbol: "€",    label: "EUR — Euro" },
  GBP: { symbol: "£",    label: "GBP — British Pound" },
  AED: { symbol: "د.إ", label: "AED — UAE Dirham" },
  SAR: { symbol: "﷼",   label: "SAR — Saudi Riyal" },
  PKR: { symbol: "₨",   label: "PKR — Pakistani Rupee" },
  SGD: { symbol: "S$",   label: "SGD — Singapore Dollar" },
  AUD: { symbol: "A$",   label: "AUD — Australian Dollar" },
} as const satisfies Record<string, { symbol: string; label: string }>;

const CACHE_KEY = "gb_fx_rates";
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

interface CachedRates {
  base: string;
  rates: Record<string, number>;
  ts: number;
}

interface CurrencyCtx {
  currency: string;
  setCurrency: (c: string) => void;
  symbol: string;
  convert: (inr: number) => string;
  loading: boolean;
}

const CurrencyContext = createContext<CurrencyCtx>({
  currency: "INR",
  setCurrency: () => {},
  symbol: "₹",
  convert: (n) => `₹${n.toLocaleString("en-IN")}`,
  loading: false,
});

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<string>(() => {
    return localStorage.getItem("gb_currency") ?? "INR";
  });
  const [rates, setRates] = useState<Record<string, number>>({ INR: 1 });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchRates() {
      // Try cache first
      try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const parsed: CachedRates = JSON.parse(cached);
          if (Date.now() - parsed.ts < CACHE_TTL) {
            setRates(parsed.rates);
            return;
          }
        }
      } catch {}

      setLoading(true);
      try {
        const res = await fetch("https://open.er-api.com/v6/latest/INR");
        if (!res.ok) throw new Error("rate fetch failed");
        const data = await res.json();
        const freshRates: Record<string, number> = { INR: 1 };
        for (const key of Object.keys(CURRENCIES)) {
          if (data.rates?.[key]) freshRates[key] = data.rates[key];
        }
        setRates(freshRates);
        localStorage.setItem(CACHE_KEY, JSON.stringify({ base: "INR", rates: freshRates, ts: Date.now() }));
      } catch {
        // Keep using INR if fetch fails
      } finally {
        setLoading(false);
      }
    }
    fetchRates();
  }, []);

  const setCurrency = useCallback((c: string) => {
    setCurrencyState(c);
    localStorage.setItem("gb_currency", c);
  }, []);

  const convert = useCallback(
    (inr: number): string => {
      const rate = rates[currency] ?? 1;
      const amount = inr * rate;
      const sym = CURRENCIES[currency as keyof typeof CURRENCIES]?.symbol ?? "₹";
      if (currency === "INR") return `${sym}${amount.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
      return `${sym}${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    },
    [currency, rates],
  );

  return (
    <CurrencyContext.Provider
      value={{ currency, setCurrency, symbol: CURRENCIES[currency as keyof typeof CURRENCIES]?.symbol ?? "₹", convert, loading }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  return useContext(CurrencyContext);
}
