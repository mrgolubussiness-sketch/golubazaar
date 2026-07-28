import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { useGetAdminMe } from "@workspace/api-client-react";
import { ArrowLeft, Plus, Trash2, ToggleLeft, ToggleRight, Ticket, X, Loader2, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface Coupon {
  id: number;
  code: string;
  discountType: "percent" | "flat";
  discountValue: number;
  minOrderValue: number | null;
  maxUses: number | null;
  usedCount: number;
  isActive: boolean;
  expiresAt: string | null;
  createdAt: string;
}

const EMPTY: Omit<Coupon, "id" | "usedCount" | "createdAt"> = {
  code: "",
  discountType: "percent",
  discountValue: 10,
  minOrderValue: null,
  maxUses: null,
  isActive: true,
  expiresAt: null,
};

export default function AdminCoupons() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: session, isLoading: sessionLoading } = useGetAdminMe();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!sessionLoading && !session?.authenticated) setLocation("/golustore-control");
  }, [session, sessionLoading, setLocation]);

  async function fetchCoupons() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/coupons", { credentials: "include" });
      if (!res.ok) throw new Error();
      setCoupons(await res.json());
    } catch {
      toast({ title: "Error", description: "Could not load coupons.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { if (session?.authenticated) fetchCoupons(); }, [session]);

  async function saveCoupon(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          code: form.code.trim().toUpperCase(),
          discountValue: Number(form.discountValue),
          minOrderValue: form.minOrderValue ? Number(form.minOrderValue) : null,
          maxUses: form.maxUses ? Number(form.maxUses) : null,
          expiresAt: form.expiresAt || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      toast({ title: "Coupon created", description: `${data.code} is ready.` });
      setShowForm(false);
      setForm(EMPTY);
      fetchCoupons();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(coupon: Coupon) {
    try {
      await fetch(`/api/admin/coupons/${coupon.id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !coupon.isActive }),
      });
      setCoupons((prev) => prev.map((c) => c.id === coupon.id ? { ...c, isActive: !c.isActive } : c));
    } catch {
      toast({ title: "Error", variant: "destructive" });
    }
  }

  async function deleteCoupon(id: number, code: string) {
    if (!confirm(`Delete coupon "${code}"?`)) return;
    try {
      await fetch(`/api/admin/coupons/${id}`, { method: "DELETE", credentials: "include" });
      setCoupons((prev) => prev.filter((c) => c.id !== id));
      toast({ title: "Coupon deleted" });
    } catch {
      toast({ title: "Error", variant: "destructive" });
    }
  }

  if (sessionLoading || !session?.authenticated) {
    return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" /></div>;
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <Link href="/golustore-control/dashboard" className="inline-flex items-center text-muted-foreground hover:text-white mb-8 transition-colors text-sm font-bold uppercase tracking-widest">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
      </Link>

      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center text-primary"><Ticket className="w-6 h-6" /></div>
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tight">Coupons</h1>
            <p className="text-sm text-muted-foreground font-mono">{coupons.length} discount codes</p>
          </div>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground font-bold uppercase tracking-wider text-sm rounded-lg hover:bg-primary/90 transition-colors">
          <Plus className="w-4 h-4" /> New Coupon
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="bg-card border border-white/10 rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-black uppercase tracking-wide">New Coupon</h2>
            <button onClick={() => { setShowForm(false); setForm(EMPTY); }} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center"><X className="w-4 h-4" /></button>
          </div>
          <form onSubmit={saveCoupon} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-muted-foreground uppercase tracking-wider mb-1.5">Code <span className="text-red-400">*</span></label>
              <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="SAVE10" required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 text-sm outline-none focus:border-primary/50 transition-colors font-mono" />
            </div>
            <div>
              <label className="block text-xs font-mono text-muted-foreground uppercase tracking-wider mb-1.5">Type</label>
              <select value={form.discountType} onChange={(e) => setForm({ ...form, discountType: e.target.value as any })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-primary/50 transition-colors">
                <option value="percent">Percentage (%)</option>
                <option value="flat">Flat (₹)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-mono text-muted-foreground uppercase tracking-wider mb-1.5">Discount Value <span className="text-red-400">*</span></label>
              <input type="number" min="0.01" step="0.01" value={form.discountValue} onChange={(e) => setForm({ ...form, discountValue: Number(e.target.value) })} required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-primary/50 transition-colors" />
            </div>
            <div>
              <label className="block text-xs font-mono text-muted-foreground uppercase tracking-wider mb-1.5">Min Order Value (₹)</label>
              <input type="number" min="0" value={form.minOrderValue ?? ""} onChange={(e) => setForm({ ...form, minOrderValue: e.target.value ? Number(e.target.value) : null })} placeholder="No minimum" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 text-sm outline-none focus:border-primary/50 transition-colors" />
            </div>
            <div>
              <label className="block text-xs font-mono text-muted-foreground uppercase tracking-wider mb-1.5">Max Uses</label>
              <input type="number" min="1" value={form.maxUses ?? ""} onChange={(e) => setForm({ ...form, maxUses: e.target.value ? Number(e.target.value) : null })} placeholder="Unlimited" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 text-sm outline-none focus:border-primary/50 transition-colors" />
            </div>
            <div>
              <label className="block text-xs font-mono text-muted-foreground uppercase tracking-wider mb-1.5">Expires At</label>
              <input type="datetime-local" value={form.expiresAt ?? ""} onChange={(e) => setForm({ ...form, expiresAt: e.target.value || null })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-primary/50 transition-colors" />
            </div>
            <div className="sm:col-span-2 flex items-center justify-between">
              <label className="flex items-center gap-3 cursor-pointer">
                <span className="text-sm font-bold">Active</span>
                <button type="button" onClick={() => setForm({ ...form, isActive: !form.isActive })} className={cn("transition-colors", form.isActive ? "text-primary" : "text-muted-foreground")}>
                  {form.isActive ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6" />}
                </button>
              </label>
              <button type="submit" disabled={saving} className="px-6 py-2.5 bg-primary text-black font-black uppercase tracking-wider text-sm rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2">
                {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><CheckCircle2 className="w-4 h-4" /> Create Coupon</>}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-16 rounded-xl bg-card border border-white/5 animate-pulse" />)}</div>
      ) : coupons.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-white/10 rounded-2xl">
          <Ticket className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground font-mono text-sm">No coupons yet. Create one to offer discounts.</p>
        </div>
      ) : (
        <div className="bg-card border border-white/5 rounded-2xl overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="text-xs font-mono uppercase tracking-wider text-muted-foreground bg-white/5 border-b border-white/5">
              <tr>
                <th className="px-5 py-3">Code</th>
                <th className="px-5 py-3">Discount</th>
                <th className="px-5 py-3">Min Order</th>
                <th className="px-5 py-3">Uses</th>
                <th className="px-5 py-3">Expires</th>
                <th className="px-5 py-3 text-center">Active</th>
                <th className="px-5 py-3 text-center">Delete</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {coupons.map((c) => (
                <tr key={c.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-5 py-4 font-mono font-black text-primary">{c.code}</td>
                  <td className="px-5 py-4 font-bold">{c.discountType === "percent" ? `${c.discountValue}%` : `₹${c.discountValue}`}</td>
                  <td className="px-5 py-4 text-muted-foreground">{c.minOrderValue ? `₹${c.minOrderValue}` : "—"}</td>
                  <td className="px-5 py-4 font-mono text-muted-foreground">{c.usedCount}{c.maxUses ? ` / ${c.maxUses}` : ""}</td>
                  <td className="px-5 py-4 text-muted-foreground text-xs">{c.expiresAt ? new Date(c.expiresAt).toLocaleDateString("en-IN") : "Never"}</td>
                  <td className="px-5 py-4 text-center">
                    <button onClick={() => toggleActive(c)} className={cn("transition-colors", c.isActive ? "text-primary hover:text-primary/70" : "text-muted-foreground hover:text-white")}>
                      {c.isActive ? <ToggleRight className="w-5 h-5 mx-auto" /> : <ToggleLeft className="w-5 h-5 mx-auto" />}
                    </button>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <button onClick={() => deleteCoupon(c.id, c.code)} className="p-1.5 rounded bg-white/5 hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
