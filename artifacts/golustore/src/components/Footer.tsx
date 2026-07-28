import { Link } from "wouter";
import { Zap } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-white/5 py-12 mt-auto bg-background/50 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-5 h-5 text-primary" />
              <span className="font-black text-base uppercase tracking-tight">GoluBazaar</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Premium digital goods — gaming accounts, OTT subscriptions, and Discord upgrades — delivered instantly via Discord.
            </p>
          </div>

          {/* Store */}
          <div>
            <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-4">Store</div>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/products" className="text-muted-foreground hover:text-white transition-colors">All Products</Link></li>
              <li><Link href="/products?category=gaming" className="text-muted-foreground hover:text-white transition-colors">Gaming</Link></li>
              <li><Link href="/products?category=discord" className="text-muted-foreground hover:text-white transition-colors">Discord</Link></li>
              <li><Link href="/products?category=ott" className="text-muted-foreground hover:text-white transition-colors">OTT Services</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-4">Support</div>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/orders" className="text-muted-foreground hover:text-white transition-colors">My Orders</Link></li>
              <li><Link href="/faq" className="text-muted-foreground hover:text-white transition-colors">FAQ</Link></li>
              <li><Link href="/about" className="text-muted-foreground hover:text-white transition-colors">About Us</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-4">Legal</div>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/terms" className="text-muted-foreground hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link href="/privacy" className="text-muted-foreground hover:text-white transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-muted-foreground text-sm">
            &copy; {new Date().getFullYear()} GoluBazaar. All rights reserved.
          </p>
          <p className="text-muted-foreground/40 text-xs">
            Not affiliated with Discord, Netflix, Riot Games, or any other mentioned brands.
          </p>
        </div>
      </div>
    </footer>
  );
}
