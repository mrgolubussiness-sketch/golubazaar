import { useCurrency, CURRENCIES } from "@/contexts/CurrencyContext";
import { ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

export default function CurrencySelector() {
  const { currency, setCurrency, symbol } = useCurrency();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-sm font-mono font-bold hover:bg-white/10 transition-colors"
      >
        <span className="text-primary">{symbol}</span>
        <span className="text-white/70">{currency}</span>
        <ChevronDown className={cn("w-3 h-3 text-muted-foreground transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 z-[60] w-52 rounded-xl bg-[#0d0d1a] border border-white/10 shadow-xl overflow-hidden py-1">
          {Object.entries(CURRENCIES).map(([code, { symbol: sym, label }]) => (
            <button
              key={code}
              onClick={() => { setCurrency(code); setOpen(false); }}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left hover:bg-white/5 transition-colors",
                code === currency && "bg-primary/10 text-primary"
              )}
            >
              <span className="font-mono font-bold w-6 text-center">{sym}</span>
              <span className={cn("text-xs", code === currency ? "text-primary" : "text-muted-foreground")}>{label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
