import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { useGetAdminMe } from "@workspace/api-client-react";
import { ArrowLeft, Star, CheckCircle2, XCircle, Trash2, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface Review {
  id: number;
  productId: number;
  customerName: string;
  rating: number;
  body: string | null;
  isApproved: boolean;
  createdAt: string;
}

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} className={cn("w-3.5 h-3.5", s <= rating ? "text-yellow-400 fill-yellow-400" : "text-white/20")} />
      ))}
    </div>
  );
}

export default function AdminReviews() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: session, isLoading: sessionLoading } = useGetAdminMe();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "approved">("pending");

  useEffect(() => {
    if (!sessionLoading && !session?.authenticated) setLocation("/golustore-control");
  }, [session, sessionLoading, setLocation]);

  useEffect(() => {
    if (!session?.authenticated) return;
    setLoading(true);
    fetch("/api/admin/reviews", { credentials: "include" })
      .then((r) => r.json())
      .then(setReviews)
      .catch(() => toast({ title: "Error", description: "Could not load reviews.", variant: "destructive" }))
      .finally(() => setLoading(false));
  }, [session]);

  async function setApproved(id: number, approved: boolean) {
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isApproved: approved }),
      });
      if (!res.ok) throw new Error();
      setReviews((prev) => prev.map((r) => r.id === id ? { ...r, isApproved: approved } : r));
      toast({ title: approved ? "Review approved" : "Review rejected" });
    } catch {
      toast({ title: "Error", variant: "destructive" });
    }
  }

  async function deleteReview(id: number) {
    if (!confirm("Delete this review?")) return;
    try {
      await fetch(`/api/admin/reviews/${id}`, { method: "DELETE", credentials: "include" });
      setReviews((prev) => prev.filter((r) => r.id !== id));
      toast({ title: "Review deleted" });
    } catch {
      toast({ title: "Error", variant: "destructive" });
    }
  }

  const filtered = reviews.filter((r) => {
    if (filter === "pending") return !r.isApproved;
    if (filter === "approved") return r.isApproved;
    return true;
  });

  const pendingCount = reviews.filter((r) => !r.isApproved).length;

  if (sessionLoading || !session?.authenticated) {
    return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" /></div>;
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <Link href="/golustore-control/dashboard" className="inline-flex items-center text-muted-foreground hover:text-white mb-8 transition-colors text-sm font-bold uppercase tracking-widest">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
      </Link>

      <div className="mb-8 flex items-center gap-4">
        <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center text-yellow-400"><Star className="w-6 h-6" /></div>
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight">Reviews</h1>
          <p className="text-sm text-muted-foreground font-mono">{pendingCount} awaiting moderation</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {(["pending", "approved", "all"] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={cn("px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border transition-colors",
            filter === f ? "bg-primary/20 border-primary/50 text-primary" : "bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10"
          )}>
            {f === "pending" ? `Pending (${pendingCount})` : f === "approved" ? `Approved (${reviews.filter(r => r.isApproved).length})` : `All (${reviews.length})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="h-28 rounded-xl bg-card border border-white/5 animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-white/10 rounded-2xl">
          <MessageSquare className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground font-mono text-sm">{filter === "pending" ? "No reviews awaiting moderation." : "No reviews here."}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((review) => (
            <div key={review.id} className={cn("bg-card border rounded-xl p-5", review.isApproved ? "border-emerald-500/20" : "border-yellow-500/20")}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-sm font-black shrink-0">
                      {review.customerName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-sm font-bold">{review.customerName}</div>
                      <StarRow rating={review.rating} />
                    </div>
                    <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold border ml-auto",
                      review.isApproved ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : "bg-yellow-500/10 border-yellow-500/30 text-yellow-400"
                    )}>
                      {review.isApproved ? "Approved" : "Pending"}
                    </span>
                  </div>
                  {review.body && <p className="text-sm text-muted-foreground leading-relaxed pl-11 mb-2">{review.body}</p>}
                  <div className="pl-11 text-xs text-muted-foreground font-mono">
                    Product #{review.productId} · {new Date(review.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {!review.isApproved && (
                    <button onClick={() => setApproved(review.id, true)} className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 transition-colors" title="Approve">
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                  )}
                  {review.isApproved && (
                    <button onClick={() => setApproved(review.id, false)} className="p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/20 transition-colors" title="Unapprove">
                      <XCircle className="w-4 h-4" />
                    </button>
                  )}
                  <button onClick={() => deleteReview(review.id)} className="p-2 rounded-lg bg-white/5 hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors" title="Delete">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
