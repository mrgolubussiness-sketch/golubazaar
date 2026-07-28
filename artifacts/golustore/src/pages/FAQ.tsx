import { useState, useEffect } from "react";
import { Link } from "wouter";
import { ArrowLeft, ChevronDown, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMeta } from "@/hooks/useMeta";

interface FaqItem {
  id: number;
  question: string;
  answer: string;
  displayOrder: number;
  isActive: boolean;
}

function SkeletonItem() {
  return (
    <div className="bg-card border border-white/5 rounded-2xl p-6 animate-pulse">
      <div className="h-5 bg-white/10 rounded w-3/4 mb-2" />
      <div className="h-3 bg-white/5 rounded w-1/2" />
    </div>
  );
}

export default function FAQ() {
  useMeta({ title: "Frequently Asked Questions", description: "Find answers to common questions about GoluBazaar — ordering, delivery, Discord, payments, and more." });
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<number | null>(null);

  useEffect(() => {
    async function fetchFaqs() {
      try {
        const res = await fetch("/api/faq", { credentials: "include" });
        if (!res.ok) throw new Error("Failed to load FAQs");
        const data: FaqItem[] = await res.json();
        setFaqs(data.filter((f) => f.isActive).sort((a, b) => a.displayOrder - b.displayOrder));
      } catch {
        // silent – empty state handles it
      } finally {
        setLoading(false);
      }
    }
    fetchFaqs();
  }, []);

  const toggle = (id: number) => setOpenId((prev) => (prev === id ? null : id));

  return (
    <div className="relative z-10 min-h-screen">
      {/* Glow blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 right-0 w-[400px] h-[400px] bg-secondary/5 rounded-full blur-[100px]" />
      </div>

      <div className="container mx-auto px-4 py-12 max-w-3xl">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-white transition-colors text-sm font-bold uppercase tracking-widest mb-10"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        {/* Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 text-primary mb-6">
            <HelpCircle className="w-7 h-7" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight mb-3">
            Frequently Asked{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
              Questions
            </span>
          </h1>
          <p className="text-muted-foreground font-mono text-sm uppercase tracking-widest">
            Got questions? We&apos;ve got answers.
          </p>
        </div>

        {/* FAQ List */}
        <div className="space-y-3">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => <SkeletonItem key={i} />)
          ) : faqs.length === 0 ? (
            <div className="text-center py-20 bg-card border border-white/5 rounded-2xl">
              <HelpCircle className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground font-mono text-sm uppercase tracking-widest">
                No FAQs available yet. Check back soon.
              </p>
            </div>
          ) : (
            faqs.map((faq) => {
              const isOpen = openId === faq.id;
              return (
                <div
                  key={faq.id}
                  className={cn(
                    "bg-card border rounded-2xl overflow-hidden transition-colors duration-200",
                    isOpen ? "border-primary/40" : "border-white/5 hover:border-white/10"
                  )}
                >
                  <button
                    onClick={() => toggle(faq.id)}
                    className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
                  >
                    <span className="font-bold text-base leading-snug">{faq.question}</span>
                    <ChevronDown
                      className={cn(
                        "w-5 h-5 text-muted-foreground shrink-0 transition-transform duration-300",
                        isOpen && "rotate-180 text-primary"
                      )}
                    />
                  </button>

                  {/* Smooth expand using max-height */}
                  <div
                    style={{
                      maxHeight: isOpen ? "800px" : "0px",
                      overflow: "hidden",
                      transition: "max-height 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
                    }}
                  >
                    <div className="px-6 pb-6 text-muted-foreground leading-relaxed text-sm border-t border-white/5 pt-4">
                      {faq.answer}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
