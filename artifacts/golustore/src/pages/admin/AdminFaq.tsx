import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { useGetAdminMe } from "@workspace/api-client-react";
import { ArrowLeft, HelpCircle, Plus, Trash2, Edit2, CheckCircle2, X, Loader2, ToggleLeft, ToggleRight, GripVertical } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface FaqItem {
  id: number;
  question: string;
  answer: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
}

const EMPTY = { question: "", answer: "", displayOrder: 0, isActive: true };

export default function AdminFaqPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: session, isLoading: sessionLoading } = useGetAdminMe();
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!sessionLoading && !session?.authenticated) setLocation("/golustore-control");
  }, [session, sessionLoading, setLocation]);

  async function fetchFaqs() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/faq", { credentials: "include" });
      if (!res.ok) throw new Error();
      const data: FaqItem[] = await res.json();
      setFaqs(data.sort((a, b) => a.displayOrder - b.displayOrder));
    } catch {
      toast({ title: "Error", description: "Could not load FAQs.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { if (session?.authenticated) fetchFaqs(); }, [session]);

  async function saveFaq(e: React.FormEvent) {
    e.preventDefault();
    if (!form.question.trim() || !form.answer.trim()) return;
    setSaving(true);
    try {
      const url = editingId ? `/api/admin/faq/${editingId}` : "/api/admin/faq";
      const method = editingId ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, displayOrder: Number(form.displayOrder) || 0 }),
      });
      if (!res.ok) throw new Error();
      toast({ title: editingId ? "FAQ updated" : "FAQ created" });
      setEditingId(null);
      setShowNew(false);
      setForm(EMPTY);
      fetchFaqs();
    } catch {
      toast({ title: "Error", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  async function deleteFaq(id: number) {
    if (!confirm("Delete this FAQ?")) return;
    try {
      await fetch(`/api/admin/faq/${id}`, { method: "DELETE", credentials: "include" });
      setFaqs((prev) => prev.filter((f) => f.id !== id));
      toast({ title: "FAQ deleted" });
    } catch {
      toast({ title: "Error", variant: "destructive" });
    }
  }

  async function toggleActive(faq: FaqItem) {
    try {
      await fetch(`/api/admin/faq/${faq.id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !faq.isActive }),
      });
      setFaqs((prev) => prev.map((f) => f.id === faq.id ? { ...f, isActive: !f.isActive } : f));
    } catch {
      toast({ title: "Error", variant: "destructive" });
    }
  }

  function startEdit(faq: FaqItem) {
    setEditingId(faq.id);
    setShowNew(false);
    setForm({ question: faq.question, answer: faq.answer, displayOrder: faq.displayOrder, isActive: faq.isActive });
  }

  function cancelEdit() {
    setEditingId(null);
    setShowNew(false);
    setForm(EMPTY);
  }

  if (sessionLoading || !session?.authenticated) {
    return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" /></div>;
  }

  const FaqForm = ({ title }: { title: string }) => (
    <form onSubmit={saveFaq} className="bg-card border border-white/10 rounded-2xl p-6 mb-4">
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-black uppercase tracking-wide text-base">{title}</h2>
        <button type="button" onClick={cancelEdit} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center"><X className="w-4 h-4" /></button>
      </div>
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-mono text-muted-foreground uppercase tracking-wider mb-1.5">Question <span className="text-red-400">*</span></label>
          <input value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} placeholder="How does delivery work?" required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 text-sm outline-none focus:border-primary/50 transition-colors" />
        </div>
        <div>
          <label className="block text-xs font-mono text-muted-foreground uppercase tracking-wider mb-1.5">Answer <span className="text-red-400">*</span></label>
          <textarea value={form.answer} onChange={(e) => setForm({ ...form, answer: e.target.value })} placeholder="We deliver via Discord DM within..." required rows={4} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 text-sm outline-none focus:border-primary/50 transition-colors resize-none" />
        </div>
        <div className="flex items-center gap-6">
          <div className="flex-1">
            <label className="block text-xs font-mono text-muted-foreground uppercase tracking-wider mb-1.5">Sort Order</label>
            <input type="number" value={form.displayOrder} onChange={(e) => setForm({ ...form, displayOrder: Number(e.target.value) })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-primary/50 transition-colors" />
          </div>
          <label className="flex items-center gap-2 cursor-pointer mt-5">
            <span className="text-sm font-bold">Active</span>
            <button type="button" onClick={() => setForm({ ...form, isActive: !form.isActive })} className={cn("transition-colors", form.isActive ? "text-primary" : "text-muted-foreground")}>
              {form.isActive ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6" />}
            </button>
          </label>
        </div>
        <div className="flex justify-end">
          <button type="submit" disabled={saving} className="px-6 py-2.5 bg-primary text-black font-black uppercase tracking-wider text-sm rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2">
            {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><CheckCircle2 className="w-4 h-4" /> Save FAQ</>}
          </button>
        </div>
      </div>
    </form>
  );

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <Link href="/golustore-control/dashboard" className="inline-flex items-center text-muted-foreground hover:text-white mb-8 transition-colors text-sm font-bold uppercase tracking-widest">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
      </Link>

      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center text-primary"><HelpCircle className="w-6 h-6" /></div>
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tight">FAQ</h1>
            <p className="text-sm text-muted-foreground font-mono">{faqs.length} questions · <Link href="/faq" className="text-primary hover:underline">View public page →</Link></p>
          </div>
        </div>
        {!showNew && !editingId && (
          <button onClick={() => { setShowNew(true); setEditingId(null); setForm(EMPTY); }} className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground font-bold uppercase tracking-wider text-sm rounded-lg hover:bg-primary/90 transition-colors">
            <Plus className="w-4 h-4" /> Add FAQ
          </button>
        )}
      </div>

      {showNew && !editingId && <FaqForm title="New FAQ" />}

      {loading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-20 rounded-xl bg-card border border-white/5 animate-pulse" />)}</div>
      ) : faqs.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-white/10 rounded-2xl">
          <HelpCircle className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground font-mono text-sm">No FAQs yet. Add your first question.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {faqs.map((faq) => (
            <div key={faq.id}>
              {editingId === faq.id ? (
                <FaqForm title="Edit FAQ" />
              ) : (
                <div className={cn("bg-card border rounded-2xl p-5 transition-colors", faq.isActive ? "border-white/5" : "border-white/5 opacity-50")}>
                  <div className="flex items-start gap-3">
                    <GripVertical className="w-4 h-4 text-muted-foreground/30 shrink-0 mt-1" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-sm leading-snug">{faq.question}</h3>
                        {!faq.isActive && <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-muted-foreground font-mono uppercase">Hidden</span>}
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">{faq.answer}</p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button onClick={() => toggleActive(faq)} className={cn("p-1.5 rounded transition-colors", faq.isActive ? "text-primary hover:text-primary/70" : "text-muted-foreground hover:text-white")} title={faq.isActive ? "Hide" : "Show"}>
                        {faq.isActive ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                      </button>
                      <button onClick={() => startEdit(faq)} className="p-1.5 rounded bg-white/5 hover:bg-secondary/20 text-muted-foreground hover:text-secondary transition-colors" title="Edit"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => deleteFaq(faq.id)} className="p-1.5 rounded bg-white/5 hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors" title="Delete"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
