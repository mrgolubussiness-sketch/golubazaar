import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { useUser, useAuth } from "@clerk/react";
import { useMeta } from "@/hooks/useMeta";
import { Package, Clock, CheckCircle2, XCircle, Loader2, ShoppingBag, ArrowLeft, MessageSquare, Tag } from "lucide-react";
import { cn } from "@/lib/utils";

type OrderStatus = "pending" | "in_progress" | "completed" | "cancelled";

interface Order {
  id: number;
  productName: string;
  productPrice: number;
  quantity: number;
  status: OrderStatus;
  customerName: string;
  customerEmail: string;
  customerDiscord: string;
  notes: string | null;
  couponCode: string | null;
  discountAmount: number | null;
  createdAt: string;
}

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; icon: React.ElementType }> = {
  pending:     { label: "Pending",     color: "text-yellow-400 bg-yellow-400/10 border-yellow-400/30", icon: Clock },
  in_progress: { label: "In Progress", color: "text-blue-400 bg-blue-400/10 border-blue-400/30",      icon: Loader2 },
  completed:   { label: "Completed",   color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/30", icon: CheckCircle2 },
  cancelled:   { label: "Cancelled",   color: "text-red-400 bg-red-400/10 border-red-400/30",          icon: XCircle },
};

function OrderSkeleton() {
  return (
    <div className="bg-card border border-white/5 rounded-2xl p-6 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="h-4 w-8 bg-white/10 rounded" />
          <div className="h-6 w-24 bg-white/10 rounded-full" />
        </div>
        <div className="h-4 w-28 bg-white/5 rounded" />
      </div>
      <div className="h-6 w-48 bg-white/10 rounded mb-2" />
      <div className="h-4 w-32 bg-white/5 rounded mb-4" />
      <div className="h-4 w-64 bg-white/5 rounded" />
    </div>
  );
}

export default function MyOrders() {
  useMeta({ title: "My Orders", description: "View and track all your GoluBazaar orders.", noIndex: true });
  const [, setLocation] = useLocation();
  const { isSignedIn, isLoaded } = useUser();
  const { getToken } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (isLoaded && !isSignedIn) setLocation("/sign-in");
  }, [isLoaded, isSignedIn, setLocation]);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    getToken()
      .then((token) =>
        fetch("/api/my-orders", {
          credentials: "include",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        })
      )
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then((data) => setOrders(data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [isLoaded, isSignedIn]);

  if (!isLoaded || !isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative z-10 container mx-auto px-4 py-12 max-w-4xl">
      <Link href="/" className="inline-flex items-center text-muted-foreground hover:text-white mb-8 transition-colors text-sm font-bold uppercase tracking-widest">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Store
      </Link>

      <div className="mb-8 flex items-center gap-4">
        <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center text-primary">
          <Package className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight">My Orders</h1>
          {!loading && <p className="text-sm text-muted-foreground font-mono">{orders.length} order{orders.length !== 1 ? "s" : ""} placed</p>}
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => <OrderSkeleton key={i} />)}
        </div>
      ) : error ? (
        <div className="text-center py-24 text-red-400 font-mono">Failed to load orders. Please try again.</div>
      ) : orders.length === 0 ? (
        <div className="text-center py-24 space-y-4 border border-dashed border-white/10 rounded-2xl bg-card/30">
          <div className="w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto">
            <ShoppingBag className="w-10 h-10 text-primary/50" />
          </div>
          <div>
            <h3 className="text-xl font-black uppercase tracking-tight mb-2">No orders yet</h3>
            <p className="text-muted-foreground font-mono text-sm max-w-xs mx-auto">
              You haven't placed any orders. Browse the store to find something you like.
            </p>
          </div>
          <Link href="/products" className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-primary/10 border border-primary/30 text-primary text-sm font-bold hover:bg-primary/20 transition-colors">
            Browse the Store
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const cfg = STATUS_CONFIG[order.status];
            const Icon = cfg.icon;
            const subtotal = order.productPrice * order.quantity;
            const total = subtotal - (order.discountAmount ?? 0);
            return (
              <div key={order.id} className="bg-card border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-colors">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-muted-foreground">#{order.id}</span>
                    <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border", cfg.color)}>
                      <Icon className={cn("w-3 h-3", order.status === "in_progress" && "animate-spin")} />
                      {cfg.label}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground font-mono shrink-0">
                    {new Date(order.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                  </span>
                </div>

                <h3 className="font-black text-xl mb-1">{order.productName}</h3>
                <div className="flex items-center gap-3 mb-1">
                  <p className="text-primary font-bold font-mono">
                    ₹{order.productPrice.toLocaleString("en-IN")} × {order.quantity}
                  </p>
                  {order.discountAmount ? (
                    <>
                      <span className="text-muted-foreground text-sm">−</span>
                      <span className="inline-flex items-center gap-1 text-emerald-400 text-sm font-bold">
                        <Tag className="w-3.5 h-3.5" />{order.couponCode} (−₹{order.discountAmount})
                      </span>
                      <span className="text-muted-foreground text-sm">= ₹{total.toLocaleString("en-IN")}</span>
                    </>
                  ) : (
                    <span className="text-muted-foreground text-sm">= ₹{subtotal.toLocaleString("en-IN")}</span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-3">
                  <MessageSquare className="w-3.5 h-3.5 text-secondary shrink-0" />
                  <span className="font-mono text-secondary font-bold">{order.customerDiscord}</span>
                  <span className="text-muted-foreground/50">— the seller will reach out on Discord</span>
                </div>

                {order.notes && (
                  <div className="mt-3 p-3 rounded-lg bg-white/5 border border-white/5 text-sm text-muted-foreground">
                    <span className="font-bold text-white">Your notes: </span>{order.notes}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
