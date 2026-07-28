import { useState, useEffect } from "react";
import { useListProducts } from "@workspace/api-client-react";
import ProductCard from "@/components/ProductCard";
import { Search, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocation } from "wouter";
import { useMeta } from "@/hooks/useMeta";

export default function Products() {
  useMeta({ title: "Browse Products", description: "Shop premium gaming accounts, OTT subscriptions, and Discord upgrades. Instant delivery, verified and safe." });
  const [location] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const initialCategory = searchParams.get("category") || undefined;

  const [category, setCategory] = useState<string | undefined>(initialCategory);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(timer);
  }, [search]);

  const { data: products, isLoading } = useListProducts({ 
    category, 
    search: debouncedSearch || undefined 
  });

  const categories = [
    { id: undefined, label: "All Drops" },
    { id: "gaming", label: "Gaming" },
    { id: "discord", label: "Discord" },
    { id: "ott", label: "OTT" },
  ] as const;

  return (
    <div className="container mx-auto px-4 py-12 md:py-20 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
        <div>
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-4">
            The <span className="text-primary">Vault</span>
          </h1>
          <p className="text-muted-foreground font-mono">Browse all our premium digital assets.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="relative group w-full sm:w-64">
            <div className="absolute inset-0 bg-primary/20 blur-md rounded-lg opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
            <div className="relative flex items-center bg-card border border-white/10 rounded-lg px-3 py-2">
              <Search className="w-5 h-5 text-muted-foreground mr-2" />
              <input 
                type="text" 
                placeholder="Search..." 
                className="bg-transparent border-none outline-none w-full text-sm font-mono placeholder:text-muted-foreground focus:ring-0 text-white"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 no-scrollbar border-b border-white/5">
        <SlidersHorizontal className="w-5 h-5 text-muted-foreground mr-2 shrink-0" />
        {categories.map(c => (
          <button
            key={c.id || "all"}
            onClick={() => setCategory(c.id)}
            className={cn(
              "px-5 py-2 rounded-full text-sm font-bold uppercase tracking-wider whitespace-nowrap transition-all duration-300",
              category === c.id 
                ? "bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.3)]" 
                : "text-muted-foreground hover:bg-white/10 hover:text-white"
            )}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-[400px] rounded-xl bg-card border border-white/5 animate-pulse" />
          ))}
        </div>
      ) : products?.length ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>
      ) : (
        <div className="py-32 flex flex-col items-center justify-center text-center border border-dashed border-white/10 rounded-2xl bg-card/50">
          <Search className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
          <h3 className="text-xl font-bold uppercase tracking-wide mb-2">No matches found</h3>
          <p className="text-muted-foreground font-mono text-sm max-w-sm">
            We couldn't find any products matching your filters. Try adjusting your search or category.
          </p>
          <button 
            onClick={() => { setSearch(""); setCategory(undefined); }}
            className="mt-6 px-6 py-2 border border-primary/50 text-primary font-bold uppercase text-sm rounded-lg hover:bg-primary/10 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  )
}
