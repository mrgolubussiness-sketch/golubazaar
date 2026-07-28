import { Link } from "wouter";
import { Product } from "@workspace/api-client-react";
import { cn } from "@/lib/utils";
import { Gamepad2, MonitorPlay, MessageSquare } from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";

interface ProductCardProps {
  product: Product;
  index?: number;
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const getCategoryIcon = () => {
    switch (product.category) {
      case "discord": return <MessageSquare className="w-12 h-12 text-secondary" />;
      case "ott": return <MonitorPlay className="w-12 h-12 text-accent" />;
      case "gaming": return <Gamepad2 className="w-12 h-12 text-primary" />;
      default: return <Gamepad2 className="w-12 h-12 text-primary" />;
    }
  };

  const { convert } = useCurrency();
  const isOutOfStock = product.stock === 0;

  return (
    <Link href={`/products/${product.id}`} className="group relative block animate-in fade-in slide-in-from-bottom-4 fill-mode-both" style={{ animationDelay: `${index * 50}ms` }}>
      {/* Glow Effect */}
      <div className={cn(
        "absolute -inset-0.5 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500",
        product.category === 'discord' && "bg-secondary/50",
        product.category === 'ott' && "bg-accent/50",
        product.category === 'gaming' && "bg-primary/50",
      )} />
      
      <div className="relative h-full flex flex-col rounded-xl bg-card border border-white/5 overflow-hidden transition-all duration-300 group-hover:-translate-y-1">
        {/* Image / Fallback Container */}
        <div className="aspect-[4/3] relative bg-muted/30 flex items-center justify-center overflow-hidden">
          {product.imageUrl ? (
            <img 
              src={product.imageUrl} 
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-background to-muted/50">
              {getCategoryIcon()}
            </div>
          )}
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {product.badge && (
              <span className="px-2.5 py-1 text-[10px] uppercase tracking-wider font-bold rounded-md bg-secondary text-secondary-foreground shadow-[0_0_10px_rgba(176,38,255,0.4)]">
                {product.badge}
              </span>
            )}
            {product.stock > 0 && product.stock <= 5 && (
              <span className="px-2.5 py-1 text-[10px] uppercase tracking-wider font-bold rounded-md bg-orange-500/20 border border-orange-500/40 text-orange-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse inline-block" />
                Only {product.stock} left!
              </span>
            )}
          </div>
          
          {isOutOfStock && (
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-10">
              <span className="px-4 py-2 border-2 border-destructive text-destructive font-bold uppercase tracking-widest rounded-lg rotate-12 shadow-[0_0_15px_rgba(255,0,0,0.3)]">
                Out of Stock
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col flex-1">
          <div className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-2">
            {product.subcategory || product.category}
          </div>
          <h3 className="font-bold text-lg leading-tight mb-4 group-hover:text-primary transition-colors line-clamp-2">
            {product.name}
          </h3>
          
          <div className="mt-auto flex items-end justify-between">
            <div className="flex flex-col gap-0.5">
              {product.originalPrice && product.originalPrice > product.price && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground line-through">
                    {convert(product.originalPrice)}
                  </span>
                  <span className="text-[10px] font-black text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-1.5 py-0.5 rounded-md tracking-wide">
                    {Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
                  </span>
                </div>
              )}
              <span className={cn(
                "text-2xl font-black tracking-tight",
                product.category === 'discord' && "text-secondary",
                product.category === 'ott' && "text-accent",
                product.category === 'gaming' && "text-primary"
              )}>
                {convert(product.price)}
              </span>
            </div>
            
            <span className={cn(
              "text-xs font-medium border px-2 py-1 rounded-md",
              product.stock === 0
                ? "text-destructive border-destructive/30 bg-destructive/10"
                : product.stock <= 5
                ? "text-orange-400 border-orange-500/30 bg-orange-500/10"
                : "text-muted-foreground border-white/10 bg-white/5"
            )}>
              {product.stock === 0 ? "Sold out" : product.stock <= 5 ? `${product.stock} left` : `${product.stock} in stock`}
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
