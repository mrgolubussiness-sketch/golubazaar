import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { useGetAdminMe } from "@workspace/api-client-react";
import { ArrowLeft, ShieldCheck, Clock, CheckCircle2, XCircle, Loader2, MessageSquare, RefreshCw, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type OrderStatus = "pending" | "in_progress" | "completed" | "cancelled";

interface Order {
  id: number;
  productName: string;
  productPrice: number;
  customerName: string;
  customerEmail: string;
  customerDiscord: string;
  quantity: number;
  status: OrderStatus;
  notes: string | null;
  createdAt: string;
}

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; icon: React.ElementType }> = {
  pending:     { label: "Pending",     color: "text-yellow-400 bg-yellow-400/10 border-yellow-400/30",  icon: Clock },
  in_progress: { label: "In Progress", color: "text-blue-400 bg-blue-400/10 border-blue-400/30",        icon: Loader2 },
  completed:   { label: "Completed",   color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/30", icon: CheckCircle2 },
  cancelled:   { label: "Cancelled",   color: "text-red-400 bg-red-400/10 border-red-400/30",            icon: XCircle },
};

const ALL_STATUSES: OrderStatus[] = ["pending", "in_progress", "completed", "cancelled"];

export default function AdminOrders() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: session, isLoading: sessionLoading } = useGetAdminMe();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<OrderStatus | "all">("all");
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  useEffect(() => {
    if (!sessionLoading && !session?.authenticated) setLocation("/golustore-control");
  }, [session, sessionLoading, setLocation]);

  async function fetchOrders() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/orders", { credentials: "include" });
      if (!res.ok) throw new Error();
      setOrders(await res.json());
    } catch {
      toast({ title: "Error", description: "Could not load orders.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (session?.authenticated) fetchOrders();
  }, [session]);

  async function updateStatus(id: number, status: OrderStatus) {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error();
      setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
      toast({ title: "Status updated", description: `Order #${id} → ${STATUS_CONFIG[status].label}` });
    } catch {
      toast({ title: "Error", description: "Could not update status.", variant: "destructive" });
    } finally {
      setUpdatingId(null);
    }
  }

  const filtered = filterStatus === "all" ? orders : orders.filter((o) => o.status === filterStatus);

  if (sessionLoading || !session?.authenticated) {
    return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" /></div>;
  }

  return (
    <div className="relative z-10 container mx-auto px-4 py-12 max-w-6xl">
      <Link href="/golustore-control/dashboard" className="inline-flex items-center text-muted-foreground hover:text-white mb-8 transition-colors text-sm font-bold uppercase tracking-widest">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
      </Link>

      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center text-primary">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tight">Orders</h1>
            <p className="text-sm text-muted-foreground font-mono">{orders.length} total orders</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <a href="/api/admin/orders/export" className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 hover:bg-white/5 text-sm font-bold transition-colors text-muted-foreground hover:text-white">
            <Download className="w-4 h-4" /> Export CSV
          </a>
          <button onClick={fetchOrders} className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 hover:bg-white/5 text-sm font-bold transition-colors">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>
      </div>

      {/* Status filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {(["all", ...ALL_STATUSES] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={cn(
              "px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border transition-colors",
              filterStatus === s ? "bg-primary/20 border-primary/50 text-primary" : "bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10"
            )}
          >
            {s === "all" ? `All (${orders.length})` : `${STATUS_CONFIG[s].label} (${orders.filter(o => o.status === s).length})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground font-mono">No orders yet.</div>
      ) : (
        <div className="space-y-4">
          {filtered.map((order) => {
            const cfg = STATUS_CONFIG[order.status];
            const Icon = cfg.icon;
            return (
              <div key={order.id} className="bg-card border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  {/* Order info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-xs font-mono text-muted-foreground">#{order.id}</span>
                      <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border", cfg.color)}>
                        <Icon className="w-3 h-3" />
                        {cfg.label}
                      </span>
                      <span className="text-xs text-muted-foreground ml-auto sm:ml-0">
                        {new Date(order.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                      </span>
                    </div>

                    <h3 className="font-black text-lg mb-1 truncate">{order.productName}</h3>
                    <p className="text-primary font-bold font-mono mb-3">
                      ₹{order.productPrice.toLocaleString("en-IN")} × {order.quantity}
                      <span className="text-muted-foreground ml-2">= ₹{(order.productPrice * order.quantity).toLocaleString("en-IN")}</span>
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
                      <div>
                        <div className="text-xs font-mono text-muted-foreground uppercase mb-0.5">Customer</div>
                        <div className="font-semibold truncate">{order.customerName}</div>
                      </div>
                      <div>
                        <div className="text-xs font-mono text-muted-foreground uppercase mb-0.5">Email</div>
                        <div className="font-semibold truncate">{order.customerEmail}</div>
                      </div>
                      <div>
                        <div className="text-xs font-mono text-muted-foreground uppercase mb-0.5">Discord</div>
                        <div className="flex items-center gap-1.5 font-bold text-secondary">
                          <MessageSquare className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{order.customerDiscord}</span>
                        </div>
                      </div>
                    </div>

                    {order.notes && (
                      <div className="mt-3 p-3 rounded-lg bg-white/5 border border-white/5 text-sm text-muted-foreground">
                        <span className="font-bold text-white">Notes: </span>{order.notes}
                      </div>
                    )}
                  </div>

                  {/* Status changer */}
                  <div className="shrink-0">
                    <div className="text-xs font-mono text-muted-foreground uppercase mb-2">Update Status</div>
                    <div className="flex flex-col gap-1.5">
                      {ALL_STATUSES.filter(s => s !== order.status).map((s) => {
                        const c = STATUS_CONFIG[s];
                        return (
                          <button
                            key={s}
                            disabled={updatingId === order.id}
                            onClick={() => updateStatus(order.id, s)}
                            className={cn(
                              "px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors flex items-center gap-1.5 disabled:opacity-50",
                              c.color, "hover:opacity-80"
                            )}
                          >
                            <c.icon className="w-3 h-3" />
                            {c.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
