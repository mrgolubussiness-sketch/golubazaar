import { useState, useEffect } from "react";
import { useRoute, Link } from "wouter";
import { useGetProduct, getGetProductQueryKey } from "@workspace/api-client-react";
import { useMeta } from "@/hooks/useMeta";
import {
  ArrowLeft, Gamepad2, MonitorPlay, MessageSquare, ShieldCheck, Zap, X,
  CheckCircle2, Loader2, AlertTriangle, Star,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUser, useAuth } from "@clerk/react";
import { useCurrency } from "@/contexts/CurrencyContext";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

// ─── Star row helper ──────────────────────────────────────────────────────────
function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} className={cn("w-3.5 h-3.5", s <= rating ? "text-yellow-400 fill-yellow-400" : "text-white/20")} />
      ))}
    </div>
  );
}

// ─── Reviews Section ──────────────────────────────────────────────────────────
interface Review { id: number; customerName: string; rating: number; body: string | null; createdAt: string; }

function ReviewsSection({ productId, productName }: { productId: number; productName: string }) {
  const { isSignedIn, user } = useUser();
  const { getToken } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [ratingInput, setRatingInput] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    fetch(`/api/products/${productId}/reviews`)
      .then((r) => r.json())
      .then(setReviews)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [productId]);

  const avg = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;

  async function submitReview(e: React.FormEvent) {
    e.preventDefault();
    if (!ratingInput) return;
    setSubmitting(true);
    setSubmitError("");
    try {
      const token = await getToken();
      const res = await fetch(`/api/products/${productId}/reviews`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({
          rating: ratingInput,
          body: body.trim() || null,
          customerName: user ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || "Customer" : "Customer",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to submit");
      setSubmitted(true);
    } catch (err: any) {
      setSubmitError(err.message ?? "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container mx-auto px-4 pb-20">
      <div className="border-t border-white/5 pt-14 max-w-3xl mx-auto">
        <div className="mb-8">
          <h2 className="text-2xl font-black uppercase tracking-tight mb-1">Customer Reviews</h2>
          {reviews.length > 0 && (
            <div className="flex items-center gap-3 mt-2">
              <StarRow rating={Math.round(avg)} />
              <span className="text-sm font-mono text-muted-foreground">
                {avg.toFixed(1)} · {reviews.length} review{reviews.length !== 1 ? "s" : ""}
              </span>
            </div>
          )}
        </div>

        {loading ? (
          <div className="space-y-3 mb-8">
            {[...Array(2)].map((_, i) => <div key={i} className="h-20 rounded-xl bg-card border border-white/5 animate-pulse" />)}
          </div>
        ) : reviews.length === 0 ? (
          <div className="py-10 text-center border border-dashed border-white/10 rounded-2xl mb-8">
            <Star className="w-9 h-9 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground font-mono text-sm">No reviews yet. Be the first!</p>
          </div>
        ) : (
          <div className="space-y-4 mb-8">
            {reviews.map((r) => (
              <div key={r.id} className="bg-card border border-white/5 rounded-xl p-5">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-sm font-black shrink-0">
                      {r.customerName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-sm font-bold">{r.customerName}</div>
                      <StarRow rating={r.rating} />
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground font-mono shrink-0">
                    {new Date(r.createdAt).toLocaleDateString("en-IN", { dateStyle: "medium" })}
                  </span>
                </div>
                {r.body && <p className="text-sm text-muted-foreground leading-relaxed pl-11">{r.body}</p>}
              </div>
            ))}
          </div>
        )}

        {/* Write a review */}
        <div className="bg-card border border-white/5 rounded-2xl p-6">
          <h3 className="text-base font-black uppercase tracking-wide mb-4">Write a Review</h3>
          {!isSignedIn ? (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-primary/5 border border-primary/20">
              <Star className="w-4 h-4 text-primary shrink-0" />
              <p className="text-sm">
                <Link href={`${basePath}/sign-in`} className="text-primary font-bold hover:underline">Sign in</Link>
                {" "}to leave a review for {productName}.
              </p>
            </div>
          ) : submitted ? (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <p className="text-sm text-emerald-300 font-bold">Thanks! Your review will appear after moderation.</p>
            </div>
          ) : (
            <form onSubmit={submitReview} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-muted-foreground uppercase tracking-wider mb-2">Your Rating</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button key={s} type="button" onClick={() => setRatingInput(s)} onMouseEnter={() => setHoverRating(s)} onMouseLeave={() => setHoverRating(0)} className="p-1 transition-transform hover:scale-110">
                      <Star className={cn("w-7 h-7 transition-colors", s <= (hoverRating || ratingInput) ? "text-yellow-400 fill-yellow-400" : "text-white/20")} />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-mono text-muted-foreground uppercase tracking-wider mb-1.5">Your Review (optional)</label>
                <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Share your experience..." rows={3} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 text-sm outline-none focus:border-primary/50 transition-colors resize-none" />
              </div>
              {submitError && <p className="text-xs text-red-400">{submitError}</p>}
              <button type="submit" disabled={!ratingInput || submitting} className="px-6 py-2.5 rounded-lg bg-primary text-black font-black text-sm uppercase tracking-wider hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</> : "Submit Review"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Order Modal ──────────────────────────────────────────────────────────────
function OrderModal({ product, onClose }: { product: any; onClose: () => void }) {
  const { isSignedIn, user } = useUser();
  const { convert } = useCurrency();
  const [step, setStep] = useState<"form" | "success" | "error">("form");
  const [submitting, setSubmitting] = useState(false);
  const [orderId, setOrderId] = useState<number | null>(null);

  const [name, setName] = useState(user ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() : "");
  const [email, setEmail] = useState(user?.primaryEmailAddress?.emailAddress ?? "");
  const [discord, setDiscord] = useState("");
  const [notes, setNotes] = useState("");

  const [couponInput, setCouponInput] = useState("");
  const [couponStatus, setCouponStatus] = useState<"idle" | "checking" | "valid" | "invalid">("idle");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponError, setCouponError] = useState("");

  const total = Math.max(0, product.price - couponDiscount);

  async function validateCoupon() {
    if (!couponInput.trim()) return;
    setCouponStatus("checking");
    setCouponError("");
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponInput.trim().toUpperCase(), orderTotal: product.price }),
      });
      const data = await res.json();
      if (!res.ok) { setCouponStatus("invalid"); setCouponError(data.error ?? "Invalid coupon"); return; }
      setCouponStatus("valid");
      setCouponDiscount(data.discount);
      setAppliedCoupon(data.coupon.code);
    } catch {
      setCouponStatus("invalid");
      setCouponError("Could not validate coupon");
    }
  }

  function removeCoupon() {
    setCouponInput(""); setCouponStatus("idle"); setCouponDiscount(0); setAppliedCoupon(null); setCouponError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!discord.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          productName: product.name,
          productPrice: product.price,
          customerName: name.trim() || "Guest",
          customerEmail: email.trim() || "not provided",
          customerDiscord: discord.trim(),
          quantity: 1,
          notes: notes.trim() || null,
          couponCode: appliedCoupon,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setOrderId(data.id);
      setStep("success");
    } catch { setStep("error"); } finally { setSubmitting(false); }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-[#0d0d1a] border border-white/10 rounded-2xl w-full max-w-md shadow-[0_0_60px_rgba(0,255,204,0.06)] overflow-hidden max-h-[92vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/5 shrink-0">
          <h2 className="text-xl font-black uppercase tracking-tight">
            {step === "success" ? "Order Placed! 🎉" : step === "error" ? "Something went wrong" : "Place Order"}
          </h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"><X className="w-4 h-4" /></button>
        </div>

        <div className="p-6 overflow-y-auto">
          {/* Product summary */}
          <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5 mb-6">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary shrink-0">
              {product.category === "discord" ? <MessageSquare className="w-6 h-6" /> : product.category === "ott" ? <MonitorPlay className="w-6 h-6" /> : <Gamepad2 className="w-6 h-6" />}
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-bold text-white truncate">{product.name}</div>
              <div className="flex items-baseline gap-3">
                <div className="text-2xl font-black text-primary">{convert(total)}</div>
                {couponDiscount > 0 && <div className="text-sm line-through text-muted-foreground">{convert(product.price)}</div>}
              </div>
            </div>
          </div>

          {step === "success" && (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4"><CheckCircle2 className="w-8 h-8 text-emerald-400" /></div>
              <p className="text-white font-bold mb-1">Order #{orderId} received!</p>
              <p className="text-muted-foreground text-sm mb-6">We've got your order. The seller will reach out to you on Discord at <span className="text-primary font-bold">{discord}</span> to complete the deal.</p>
              <button onClick={onClose} className="w-full py-3 rounded-xl bg-primary text-black font-black uppercase tracking-widest hover:bg-primary/90 transition-colors">Done</button>
            </div>
          )}

          {step === "error" && (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4"><AlertTriangle className="w-8 h-8 text-red-400" /></div>
              <p className="text-white font-bold mb-1">Couldn't place order</p>
              <p className="text-muted-foreground text-sm mb-6">Please try again or contact us on Discord.</p>
              <div className="flex gap-3">
                <button onClick={() => setStep("form")} className="flex-1 py-3 rounded-xl border border-white/10 font-bold text-sm hover:bg-white/5 transition-colors">Try Again</button>
                <button onClick={onClose} className="flex-1 py-3 rounded-xl bg-primary text-black font-bold text-sm hover:bg-primary/90 transition-colors">Close</button>
              </div>
            </div>
          )}

          {step === "form" && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-muted-foreground uppercase tracking-wider mb-1.5">Your Name</label>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 text-sm outline-none focus:border-primary/50 transition-colors" />
              </div>
              <div>
                <label className="block text-xs font-mono text-muted-foreground uppercase tracking-wider mb-1.5">Email</label>
                <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="your@email.com" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 text-sm outline-none focus:border-primary/50 transition-colors" />
              </div>
              <div>
                <label className="block text-xs font-mono text-muted-foreground uppercase tracking-wider mb-1.5">Discord Username <span className="text-red-400">*</span></label>
                <input value={discord} onChange={(e) => setDiscord(e.target.value)} placeholder="e.g. golu.bazaar" required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 text-sm outline-none focus:border-primary/50 transition-colors" />
                <p className="text-xs text-muted-foreground mt-1">The seller will contact you here to deliver your order.</p>
              </div>
              <div>
                <label className="block text-xs font-mono text-muted-foreground uppercase tracking-wider mb-1.5">Notes (optional)</label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any special requests..." rows={2} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 text-sm outline-none focus:border-primary/50 transition-colors resize-none" />
              </div>

              {/* Coupon code */}
              <div>
                <label className="block text-xs font-mono text-muted-foreground uppercase tracking-wider mb-1.5">Promo Code</label>
                {couponStatus === "valid" ? (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="text-sm text-emerald-300 font-bold flex-1">{appliedCoupon} — {convert(couponDiscount)} off!</span>
                    <button type="button" onClick={removeCoupon} className="text-muted-foreground hover:text-white transition-colors"><X className="w-4 h-4" /></button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      value={couponInput}
                      onChange={(e) => { setCouponInput(e.target.value.toUpperCase()); setCouponStatus("idle"); setCouponError(""); }}
                      onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); validateCoupon(); } }}
                      placeholder="PROMO CODE"
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 text-sm outline-none focus:border-primary/50 transition-colors font-mono"
                    />
                    <button type="button" onClick={validateCoupon} disabled={!couponInput.trim() || couponStatus === "checking"} className="px-4 rounded-xl bg-white/10 border border-white/10 text-sm font-bold hover:bg-white/20 transition-colors disabled:opacity-50">
                      {couponStatus === "checking" ? <Loader2 className="w-4 h-4 animate-spin" /> : "Apply"}
                    </button>
                  </div>
                )}
                {couponStatus === "invalid" && couponError && <p className="text-xs text-red-400 mt-1">{couponError}</p>}
              </div>

              {!isSignedIn && (
                <div className="flex items-start gap-3 p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                  <AlertTriangle className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-yellow-200">You're ordering as a guest.{" "}<Link href={`${basePath}/sign-in`} onClick={onClose} className="underline font-bold">Sign in</Link>{" "}to track your orders.</p>
                </div>
              )}

              {couponDiscount > 0 && (
                <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-sm">
                  <span className="text-muted-foreground">Total after discount</span>
                  <span className="text-emerald-400 font-black text-lg">{convert(total)}</span>
                </div>
              )}

              <button type="submit" disabled={submitting || !discord.trim()} className="w-full py-4 rounded-xl bg-primary text-black font-black uppercase tracking-widest hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Placing Order...</> : <><Zap className="w-4 h-4" /> Confirm — {convert(total)}</>}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function ProductDetail() {
  const [, params] = useRoute("/products/:id");
  const id = params?.id ? parseInt(params.id) : 0;
  const [orderOpen, setOrderOpen] = useState(false);

  const { data: product, isLoading, error } = useGetProduct(id, {
    query: { enabled: !!id, queryKey: getGetProductQueryKey(id) },
  });
  const { convert } = useCurrency();

  useMeta({
    title: product?.name,
    description: product?.description
      ? `${product.description.slice(0, 140)}…`
      : "Buy premium digital goods instantly on GoluBazaar. Safe, verified, delivered via Discord.",
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-20 animate-pulse">
        <div className="h-8 w-24 bg-white/5 rounded mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="aspect-[4/3] bg-white/5 rounded-2xl" />
          <div className="space-y-6">
            <div className="h-12 bg-white/5 rounded w-3/4" />
            <div className="h-24 bg-white/5 rounded w-full" />
            <div className="h-16 bg-white/5 rounded w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-32 text-center">
        <h2 className="text-3xl font-black uppercase tracking-tight mb-4">Product Not Found</h2>
        <p className="text-muted-foreground mb-8">This product doesn't exist or has been removed.</p>
        <Link href="/products" className="px-6 py-3 border border-white/10 rounded-lg hover:bg-white/5 font-bold uppercase tracking-wider text-sm transition-colors">Back to Catalog</Link>
      </div>
    );
  }

  const getCategoryColor = () => {
    switch (product.category) {
      case "discord": return "text-secondary border-secondary/50 bg-secondary/10";
      case "ott": return "text-accent border-accent/50 bg-accent/10";
      default: return "text-primary border-primary/50 bg-primary/10";
    }
  };

  const getCategoryIcon = () => {
    switch (product.category) {
      case "discord": return <MessageSquare className="w-24 h-24 text-secondary/50" />;
      case "ott": return <MonitorPlay className="w-24 h-24 text-accent/50" />;
      default: return <Gamepad2 className="w-24 h-24 text-primary/50" />;
    }
  };

  const isOutOfStock = product.stock === 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  return (
    <>
      <div className="container mx-auto px-4 py-12 md:py-20 animate-in fade-in slide-in-from-bottom-4">
        <Link href="/products" className="inline-flex items-center text-muted-foreground hover:text-white mb-8 transition-colors text-sm font-bold uppercase tracking-widest">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Catalog
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Left: Visuals */}
          <div className="relative group">
            <div className={cn("absolute -inset-4 blur-2xl opacity-20 rounded-[3rem] transition duration-1000",
              product.category === "discord" && "bg-secondary",
              product.category === "ott" && "bg-accent",
              product.category === "gaming" && "bg-primary",
            )} />
            <div className="relative aspect-[4/3] rounded-3xl overflow-hidden bg-card border border-white/10 flex items-center justify-center">
              {product.imageUrl ? (
                <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-background to-muted">{getCategoryIcon()}</div>
              )}
              {product.badge && (
                <div className="absolute top-6 left-6">
                  <span className={cn("px-4 py-2 text-xs uppercase tracking-widest font-black rounded-lg shadow-lg", getCategoryColor())}>{product.badge}</span>
                </div>
              )}
              {isLowStock && (
                <div className="absolute bottom-6 left-6">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs uppercase tracking-wider font-black rounded-lg bg-orange-500/20 border border-orange-500/40 text-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.3)]">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
                    Only {product.stock} left!
                  </span>
                </div>
              )}
              {isOutOfStock && (
                <div className="absolute inset-0 bg-background/80 backdrop-blur-md flex items-center justify-center z-10">
                  <span className="px-6 py-3 border-2 border-destructive text-destructive font-black text-2xl uppercase tracking-widest rounded-xl rotate-12 shadow-[0_0_30px_rgba(255,0,0,0.4)]">Sold Out</span>
                </div>
              )}
            </div>
          </div>

          {/* Right: Details */}
          <div className="flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-4">
              <span className={cn("px-3 py-1 text-xs font-mono font-bold uppercase tracking-wider rounded-md border", getCategoryColor())}>{product.category}</span>
              {product.subcategory && (
                <span className="px-3 py-1 text-xs font-mono uppercase tracking-wider rounded-md border border-white/10 bg-white/5 text-muted-foreground">{product.subcategory}</span>
              )}
            </div>

            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight mb-6 leading-tight">{product.name}</h1>

            <div className="flex items-baseline gap-4 mb-2 flex-wrap">
              <span className={cn("text-5xl md:text-6xl font-black tracking-tighter drop-shadow-lg",
                product.category === "discord" && "text-secondary drop-shadow-[0_0_15px_rgba(176,38,255,0.4)]",
                product.category === "ott" && "text-accent drop-shadow-[0_0_15px_rgba(255,0,128,0.4)]",
                product.category === "gaming" && "text-primary drop-shadow-[0_0_15px_rgba(0,255,204,0.4)]",
              )}>{convert(product.price)}</span>
              {product.originalPrice && product.originalPrice > product.price && (
                <>
                  <span className="text-xl md:text-2xl text-muted-foreground line-through font-bold">{convert(product.originalPrice)}</span>
                  <span className="self-center px-3 py-1 text-sm font-black text-emerald-400 bg-emerald-400/10 border border-emerald-400/30 rounded-lg tracking-wide shadow-[0_0_10px_rgba(52,211,153,0.2)]">
                    {Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
                  </span>
                </>
              )}
            </div>

            {isLowStock && (
              <div className="mb-6">
                <span className="inline-flex items-center gap-1.5 text-sm text-orange-400 font-bold">
                  <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
                  Only {product.stock} left in stock — order soon!
                </span>
              </div>
            )}

            <div className="prose prose-invert prose-p:text-muted-foreground mb-10 max-w-none">
              <p className="whitespace-pre-wrap font-mono text-sm leading-relaxed">{product.description}</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mb-10">
              {isOutOfStock ? (
                <button disabled className="px-8 py-4 bg-muted text-muted-foreground font-black uppercase tracking-widest rounded-xl cursor-not-allowed border border-white/5 flex-1">Out of Stock</button>
              ) : (
                <button onClick={() => setOrderOpen(true)} className="group relative flex-1 flex items-center justify-center">
                  <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-primary to-secondary opacity-70 blur group-hover:opacity-100 transition duration-300" />
                  <div className="relative w-full px-8 py-4 bg-background border border-white/10 rounded-xl font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-white/5 transition-colors">
                    <Zap className="w-5 h-5 text-primary" /> Place Order
                  </div>
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-primary"><ShieldCheck className="w-5 h-5" /></div>
                <div>
                  <div className="text-xs font-mono text-muted-foreground uppercase">Status</div>
                  <div className="font-bold text-sm">Verified & Safe</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-accent"><Zap className="w-5 h-5" /></div>
                <div>
                  <div className="text-xs font-mono text-muted-foreground uppercase">Delivery</div>
                  <div className="font-bold text-sm">Via Discord</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ReviewsSection productId={product.id} productName={product.name} />

      {orderOpen && <OrderModal product={product} onClose={() => setOrderOpen(false)} />}
    </>
  );
}
