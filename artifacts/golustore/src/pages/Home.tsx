import { Link } from "wouter";
import { useListFeaturedProducts, useListCategories, useGetStoreStats } from "@workspace/api-client-react";
import ProductCard from "@/components/ProductCard";
import { Gamepad2, ShieldCheck, Zap, Crown, MonitorPlay, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMeta } from "@/hooks/useMeta";
import { motion } from "framer-motion";

const heroVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 32, filter: "blur(4px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] } },
};

export default function Home() {
  useMeta({
    title: "Premium Digital Gaming Marketplace",
    description: "Buy gaming accounts, OTT subscriptions & Discord upgrades instantly. Verified, safe, delivered via Discord."
  });

  const { data: featuredProductsData, isLoading: isLoadingFeatured } = useListFeaturedProducts();
  const { data: categoriesData } = useListCategories();
  const { data: stats } = useGetStoreStats();

 const featuredProducts = Array.isArray(featuredProductsData) ? featuredProductsData : [];
 const categories = Array.isArray(categoriesData) ? categoriesData : [];
  
  return (
    <div className="flex flex-col min-h-screen">
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
        {/* Animated background glows */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full"
            style={{ background: "radial-gradient(circle, rgba(0,255,204,0.07) 0%, transparent 70%)" }}
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.4, ease: "easeOut" }}
          />
          <motion.div
            className="absolute top-1/3 right-0 w-[500px] h-[500px] rounded-full"
            style={{ background: "radial-gradient(circle, rgba(176,38,255,0.06) 0%, transparent 70%)" }}
            initial={{ x: 80, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 1.8, ease: "easeOut", delay: 0.3 }}
          />
          <motion.div
            className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full"
            style={{ background: "radial-gradient(circle, rgba(255,0,128,0.05) 0%, transparent 70%)" }}
            initial={{ x: -60, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 1.8, ease: "easeOut", delay: 0.5 }}
          />
        </div>

        <motion.div
          className="container mx-auto px-4 relative z-10 text-center"
          variants={heroVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Pill badge */}
          <motion.div variants={fadeUp}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm font-medium mb-8 backdrop-blur-sm">
              <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
              Premium Digital Services
            </div>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={fadeUp}
            className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter mb-6 leading-none"
          >
            BUY NOW FROM
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-accent drop-shadow-[0_0_30px_rgba(0,255,204,0.25)]">
              GOLU BAZAAR
            </span>
          </motion.h1>

          {/* Sub */}
          <motion.p
            variants={fadeUp}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Instant delivery on premium game accounts, OTT subscriptions, and Discord upgrades.{" "}
            <span className="text-white/60">Safe, secure, and ready to play.</span>
          </motion.p>

          {/* CTA */}
          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/products" className="group relative w-full sm:w-auto">
              <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-primary via-secondary to-primary opacity-60 blur group-hover:opacity-100 transition duration-500 group-hover:duration-200" />
              <div className="relative px-8 py-4 bg-black rounded-lg border border-white/10 text-foreground font-bold tracking-widest uppercase flex items-center justify-center gap-2 hover:bg-white/5 transition-colors">
                <Zap className="w-5 h-5 text-primary" />
                Browse Bazaar
              </div>
            </Link>
            <Link href="/about" className="w-full sm:w-auto px-8 py-4 rounded-lg border border-white/10 font-bold tracking-widest uppercase text-muted-foreground hover:text-white hover:bg-white/5 transition-colors flex items-center justify-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Learn More
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* ── Trust Badges ─────────────────────────────────────────────────── */}
      <section className="py-10 border-y border-white/5 bg-black/20 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { icon: Zap,         title: "Instant Delivery", desc: "Get it immediately" },
              { icon: ShieldCheck, title: "100% Secure",       desc: "Verified accounts" },
              { icon: Crown,       title: "Premium Quality",   desc: "Best in class" },
              { icon: MessageSquare, title: "24/7 Support",    desc: "We're here to help" },
            ].map((feature, i) => (
              <motion.div
                key={i}
                className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-white/5 transition-colors cursor-default"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 + i * 0.08, ease: "easeOut" }}
              >
                <feature.icon className="w-8 h-8 text-primary mb-2" />
                <h3 className="font-bold text-sm uppercase tracking-wider">{feature.title}</h3>
                <p className="text-xs text-muted-foreground">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Products ─────────────────────────────────────────────── */}
      <section className="py-24 relative">
        <div className="container mx-auto px-4">
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight mb-2">
                <span className="text-primary">Featured</span> Drops
              </h2>
              <p className="text-muted-foreground font-mono text-sm">Handpicked premium goods just for you</p>
            </div>
            <Link href="/products" className="hidden md:flex items-center gap-2 text-sm font-bold uppercase tracking-wider hover:text-primary transition-colors">
              View All <Zap className="w-4 h-4" />
            </Link>
          </div>

          {isLoadingFeatured ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-[400px] rounded-xl bg-card border border-white/5 animate-pulse" />
              ))}
            </div>
          ) : featuredProducts?.length ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.slice(0, 8).map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 border border-dashed border-white/10 rounded-2xl">
              <p className="text-muted-foreground">No featured products available at the moment.</p>
            </div>
          )}

          <div className="mt-10 md:hidden flex justify-center">
            <Link href="/products" className="px-6 py-3 rounded-lg border border-white/10 font-bold uppercase text-sm tracking-wider hover:bg-white/5 transition-colors">
              View All Products
            </Link>
          </div>
        </div>
      </section>

      {/* ── Categories ───────────────────────────────────────────────────── */}
      <section className="py-24 bg-card/50 border-t border-white/5">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight mb-12 text-center">
            Shop by <span className="text-secondary">Category</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { id: "gaming",  title: "Gaming",      icon: Gamepad2,     color: "text-primary",   bg: "bg-primary/10",   border: "border-primary/20",   hover: "group-hover:border-primary/50"   },
              { id: "discord", title: "Discord",     icon: MessageSquare, color: "text-secondary", bg: "bg-secondary/10", border: "border-secondary/20", hover: "group-hover:border-secondary/50" },
              { id: "ott",     title: "OTT Services", icon: MonitorPlay, color: "text-accent",    bg: "bg-accent/10",    border: "border-accent/20",    hover: "group-hover:border-accent/50"    },
            ].map((cat, i) => {
              const stat = categories?.find((c) => c.category === cat.id);
              return (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.55, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Link href={`/products?category=${cat.id}`} className={cn(
                    "group relative overflow-hidden rounded-2xl border bg-background p-8 block transition-all duration-300 hover:-translate-y-2",
                    cat.border, cat.hover,
                  )}>
                    <div className={cn("absolute -right-10 -top-10 w-40 h-40 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity", cat.bg)} />
                    <cat.icon className={cn("w-12 h-12 mb-6", cat.color)} />
                    <h3 className="text-2xl font-black uppercase tracking-wide mb-2">{cat.title}</h3>
                    <p className="text-muted-foreground mb-6">Browse premium {cat.title.toLowerCase()} accounts and upgrades.</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-mono font-bold bg-white/5 px-3 py-1 rounded-md border border-white/10">
                        {stat ? stat.count : 0} items
                      </span>
                      <span className={cn("font-bold text-sm uppercase tracking-wider group-hover:underline", cat.color)}>Explore</span>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Stats ────────────────────────────────────────────────────────── */}
      {stats && (
        <section className="py-20 border-t border-white/5">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { value: stats.totalProducts,                       label: "Total Goods",    color: "text-primary",   glow: "rgba(0,255,204,0.3)"   },
                { value: stats.inStockProducts,                     label: "In Stock",       color: "text-secondary", glow: "rgba(176,38,255,0.3)" },
                { value: stats.gamingProducts,                      label: "Gaming Accs",    color: "text-accent",    glow: "rgba(255,0,128,0.3)"  },
                { value: stats.discordProducts + stats.ottProducts, label: "Subscriptions",  color: "text-white",     glow: "rgba(255,255,255,0.1)" },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  className="text-center"
                  initial={{ opacity: 0, scale: 0.85 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.09, ease: "easeOut" }}
                >
                  <div
                    className={cn("text-4xl md:text-5xl font-black mb-2", stat.color)}
                    style={{ filter: `drop-shadow(0 0 10px ${stat.glow})` }}
                  >
                    {stat.value}
                  </div>
                  <div className="text-sm font-mono text-muted-foreground uppercase tracking-widest">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
