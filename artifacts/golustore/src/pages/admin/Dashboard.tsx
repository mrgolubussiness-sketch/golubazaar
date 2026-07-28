import { useEffect, useState } from "react";
import { useLocation, Link } from "wouter";
import {
  useGetAdminMe,
  useAdminListProducts,
  useAdminLogout,
  useGetStoreStats,
  useAdminDeleteProduct,
  getAdminListProductsQueryKey,
  getGetStoreStatsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import {
  LogOut, Plus, Edit2, Trash2, ShieldCheck, Box, Tag, AlertTriangle,
  Settings, TicketCheck, Download, BarChart2, Ticket, Star, HelpCircle,
  TrendingUp, CheckSquare, Square, ToggleLeft, ToggleRight,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

interface DailyStats { date: string; orders: number; revenue: number; }

// ─── Revenue chart ────────────────────────────────────────────────────────────
function RevenueChart({ adminAuthenticated }: { adminAuthenticated: boolean }) {
  const [stats, setStats] = useState<DailyStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!adminAuthenticated) return;
    fetch("/api/admin/order-stats", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => setStats(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [adminAuthenticated]);

  const totalRevenue = stats.reduce((s, d) => s + (d.revenue ?? 0), 0);
  const totalOrders = stats.reduce((s, d) => s + (d.orders ?? 0), 0);

  if (loading) {
    return <div className="bg-card border border-white/5 rounded-2xl p-6 h-64 animate-pulse mb-8" />;
  }

  if (stats.length === 0) {
    return (
      <div className="bg-card border border-white/5 rounded-2xl p-6 mb-8 flex items-center justify-center h-48">
        <div className="text-center">
          <BarChart2 className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
          <p className="text-muted-foreground font-mono text-sm">No orders in the last 30 days</p>
        </div>
      </div>
    );
  }

  const chartData = stats.map((d) => ({
    date: new Date(d.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
    revenue: Math.round(d.revenue ?? 0),
    orders: d.orders,
  }));

  return (
    <div className="bg-card border border-white/5 rounded-2xl p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold uppercase tracking-widest flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" /> Revenue — Last 30 Days
          </h2>
          <div className="flex gap-6 mt-2">
            <span className="text-2xl font-black text-primary">₹{totalRevenue.toLocaleString("en-IN")}</span>
            <span className="text-sm text-muted-foreground font-mono self-end pb-1">{totalOrders} orders</span>
          </div>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
          <defs>
            <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00ffcc" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#00ffcc" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="date" tick={{ fill: "#71717a", fontSize: 11, fontFamily: "monospace" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: "#71717a", fontSize: 11, fontFamily: "monospace" }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v}`} width={55} />
          <Tooltip
            contentStyle={{ background: "#0d0d1a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontFamily: "monospace" }}
            labelStyle={{ color: "#fafafa", fontWeight: 700 }}
            itemStyle={{ color: "#00ffcc" }}
            formatter={(v: any) => [`₹${Number(v).toLocaleString("en-IN")}`, "Revenue"]}
          />
          <Area type="monotone" dataKey="revenue" stroke="#00ffcc" strokeWidth={2} fill="url(#revenueGrad)" dot={false} activeDot={{ r: 4, fill: "#00ffcc" }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── Main dashboard ───────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [bulkUpdating, setBulkUpdating] = useState(false);

  const { data: session, isLoading: sessionLoading, error: sessionError } = useGetAdminMe();
  const { data: products, isLoading: productsLoading } = useAdminListProducts({
    query: { enabled: !!session?.authenticated, queryKey: getAdminListProductsQueryKey() },
  });
  const { data: stats } = useGetStoreStats({
    query: { enabled: !!session?.authenticated, queryKey: getGetStoreStatsQueryKey() },
  });

  useEffect(() => {
    if (!sessionLoading && (!session?.authenticated || sessionError)) setLocation("/golustore-control");
  }, [session, sessionLoading, sessionError, setLocation]);

  const logout = useAdminLogout({ mutation: { onSuccess: () => { queryClient.clear(); setLocation("/"); } } });
  const deleteProduct = useAdminDeleteProduct({
    mutation: {
      onSuccess: () => {
        toast({ title: "Product Deleted", description: "The product has been removed." });
        queryClient.invalidateQueries({ queryKey: getAdminListProductsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetStoreStatsQueryKey() });
      },
    },
  });

  const handleDelete = (id: number, name: string) => {
    if (confirm(`Delete "${name}"? This cannot be undone.`)) deleteProduct.mutate({ id });
  };

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (!products) return;
    if (selectedIds.size === products.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(products.map((p) => p.id)));
  };

  async function bulkSetActive(isActive: boolean) {
    if (selectedIds.size === 0) return;
    setBulkUpdating(true);
    try {
      await Promise.all(
        [...selectedIds].map((id) =>
          fetch(`/api/admin/products/${id}`, {
            method: "PATCH",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ isActive }),
          })
        )
      );
      toast({ title: `${selectedIds.size} products ${isActive ? "enabled" : "disabled"}` });
      setSelectedIds(new Set());
      queryClient.invalidateQueries({ queryKey: getAdminListProductsQueryKey() });
      queryClient.invalidateQueries({ queryKey: getGetStoreStatsQueryKey() });
    } catch {
      toast({ title: "Error", description: "Failed to update some products.", variant: "destructive" });
    } finally {
      setBulkUpdating(false);
    }
  }

  if (sessionLoading || !session?.authenticated) {
    return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" /></div>;
  }

  const lowStockProducts = products?.filter((p) => p.stock > 0 && p.stock <= 5) ?? [];

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center text-primary"><ShieldCheck className="w-6 h-6" /></div>
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tight">Command Center</h1>
            <p className="text-sm font-mono text-muted-foreground">System Administration</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap justify-center md:justify-end">
          <Link href="/golustore-control/products/new" className="px-4 py-2.5 bg-primary text-primary-foreground font-bold uppercase tracking-wider text-sm rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2">
            <Plus className="w-4 h-4" /> New Product
          </Link>
          <Link href="/golustore-control/orders" className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors text-muted-foreground hover:text-white" title="Orders"><TicketCheck className="w-4 h-4" /></Link>
          <Link href="/golustore-control/coupons" className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors text-muted-foreground hover:text-white" title="Coupons"><Ticket className="w-4 h-4" /></Link>
          <Link href="/golustore-control/reviews" className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors text-muted-foreground hover:text-white" title="Reviews"><Star className="w-4 h-4" /></Link>
          <Link href="/golustore-control/faq" className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors text-muted-foreground hover:text-white" title="FAQ"><HelpCircle className="w-4 h-4" /></Link>
          <Link href="/golustore-control/settings" className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors text-muted-foreground hover:text-white" title="Settings"><Settings className="w-4 h-4" /></Link>
          <button onClick={() => logout.mutate()} className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors text-muted-foreground hover:text-destructive" title="Logout"><LogOut className="w-4 h-4" /></button>
        </div>
      </div>

      {/* Revenue chart */}
      <RevenueChart adminAuthenticated={!!session?.authenticated} />

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Products", value: stats.totalProducts, icon: Box, color: "text-white" },
            { label: "In Stock", value: stats.inStockProducts, icon: Tag, color: "text-primary" },
            { label: "Gaming Accs", value: stats.gamingProducts, icon: ShieldCheck, color: "text-secondary" },
            { label: "Out of Stock", value: stats.totalProducts - stats.inStockProducts, icon: AlertTriangle, color: "text-destructive" },
          ].map((stat, i) => (
            <div key={i} className="bg-card border border-white/5 rounded-xl p-5 flex flex-col">
              <div className="flex items-center gap-3 mb-3">
                <stat.icon className={cn("w-4 h-4 opacity-70", stat.color)} />
                <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">{stat.label}</span>
              </div>
              <span className={cn("text-4xl font-black", stat.color)}>{stat.value}</span>
            </div>
          ))}
        </div>
      )}

      {/* Low-stock alert */}
      {lowStockProducts.length > 0 && (
        <div className="bg-orange-500/5 border border-orange-500/20 rounded-2xl p-5 mb-8">
          <div className="flex items-center gap-3 mb-3">
            <AlertTriangle className="w-5 h-5 text-orange-400" />
            <h3 className="text-sm font-black uppercase tracking-wider text-orange-400">Low Stock Alert — {lowStockProducts.length} product{lowStockProducts.length !== 1 ? "s" : ""} running low</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {lowStockProducts.map((p) => (
              <Link key={p.id} href={`/golustore-control/products/${p.id}/edit`} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-300 text-xs font-bold hover:bg-orange-500/20 transition-colors">
                {p.name}
                <span className="px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-400 font-black">{p.stock} left</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Inventory table */}
      <div className="bg-card border border-white/5 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-white/5 flex items-center justify-between gap-4 flex-wrap">
          <h2 className="text-base font-bold uppercase tracking-widest">Inventory Management</h2>
          <div className="flex items-center gap-3">
            {selectedIds.size > 0 && (
              <>
                <span className="text-xs text-muted-foreground font-mono">{selectedIds.size} selected</span>
                <button onClick={() => bulkSetActive(true)} disabled={bulkUpdating} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/30 text-primary text-xs font-bold hover:bg-primary/20 transition-colors disabled:opacity-50">
                  <ToggleRight className="w-4 h-4" /> Enable
                </button>
                <button onClick={() => bulkSetActive(false)} disabled={bulkUpdating} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-muted-foreground text-xs font-bold hover:bg-white/10 transition-colors disabled:opacity-50">
                  <ToggleLeft className="w-4 h-4" /> Disable
                </button>
              </>
            )}
            <a href="/api/admin/orders/export" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-muted-foreground hover:text-white text-xs font-bold hover:bg-white/10 transition-colors">
              <Download className="w-3.5 h-3.5" /> Export Orders
            </a>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs font-mono uppercase tracking-wider text-muted-foreground bg-white/5 border-b border-white/5">
              <tr>
                <th className="px-4 py-4">
                  <button onClick={selectAll} className="text-muted-foreground hover:text-white transition-colors">
                    {products && selectedIds.size === products.length && products.length > 0
                      ? <CheckSquare className="w-4 h-4 text-primary" />
                      : <Square className="w-4 h-4" />}
                  </button>
                </th>
                <th className="px-4 py-4">Status</th>
                <th className="px-4 py-4">Product Name</th>
                <th className="px-4 py-4">Category</th>
                <th className="px-4 py-4 text-right">Price</th>
                <th className="px-4 py-4 text-right">Stock</th>
                <th className="px-4 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {productsLoading ? (
                <tr><td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                  <div className="flex items-center justify-center gap-2"><div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin" /> Loading inventory...</div>
                </td></tr>
              ) : products?.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-12 text-center text-muted-foreground font-mono">No products found. Add your first product to start selling.</td></tr>
              ) : (
                products?.map((product) => {
                  const isLowStock = product.stock > 0 && product.stock <= 5;
                  const isSelected = selectedIds.has(product.id);
                  return (
                    <tr key={product.id} className={cn("hover:bg-white/[0.02] transition-colors", isSelected && "bg-primary/5", isLowStock && "border-l-2 border-l-orange-500/50")}>
                      <td className="px-4 py-4">
                        <button onClick={() => toggleSelect(product.id)} className="text-muted-foreground hover:text-white transition-colors">
                          {isSelected ? <CheckSquare className="w-4 h-4 text-primary" /> : <Square className="w-4 h-4" />}
                        </button>
                      </td>
                      <td className="px-4 py-4">
                        <div className={cn("w-2.5 h-2.5 rounded-full shadow-[0_0_8px_currentColor]",
                          product.isActive && product.stock > 0 ? "bg-primary text-primary" : "bg-muted text-muted",
                          product.stock === 0 && "bg-destructive text-destructive"
                        )} title={!product.isActive ? "Inactive" : product.stock === 0 ? "Out of Stock" : "Active"} />
                      </td>
                      <td className="px-4 py-4 font-bold max-w-[200px] truncate" title={product.name}>
                        {product.name}
                        {isLowStock && <span className="ml-2 text-[10px] text-orange-400 font-mono">LOW</span>}
                      </td>
                      <td className="px-4 py-4">
                        <span className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider rounded border border-white/10 bg-white/5">{product.subcategory || product.category}</span>
                      </td>
                      <td className="px-4 py-4 text-right font-mono font-bold text-white">₹{product.price.toLocaleString("en-IN")}</td>
                      <td className="px-4 py-4 text-right font-mono">
                        <span className={cn(product.stock === 0 && "text-destructive font-bold", isLowStock && "text-orange-400 font-bold")}>{product.stock}</span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <Link href={`/golustore-control/products/${product.id}/edit`} className="p-2 bg-white/5 hover:bg-secondary/20 text-muted-foreground hover:text-secondary rounded transition-colors" title="Edit"><Edit2 className="w-4 h-4" /></Link>
                          <button onClick={() => handleDelete(product.id, product.name)} disabled={deleteProduct.isPending} className="p-2 bg-white/5 hover:bg-destructive/20 text-muted-foreground hover:text-destructive rounded transition-colors disabled:opacity-50" title="Delete"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
