import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Gamepad2, LogIn, UserPlus, LogOut, User, Menu, X, Package } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGetStoreSettings } from "@workspace/api-client-react";
import { Show, useUser, useClerk } from "@clerk/react";
import CurrencySelector from "@/components/CurrencySelector";

export default function Navbar() {
  const [location] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const { data: settings } = useGetStoreSettings();
  const { user } = useUser();
  const { signOut } = useClerk();

  const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

  const links = [
    { href: "/", label: "Home" },
    { href: "/products", label: "Store" },
    { href: "/about", label: "About" },
  ];

  const storeName = settings?.storeName ?? "GoluBazaar";
  const logoUrl = settings?.logoUrl;

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-primary/20 bg-black/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group shrink-0" onClick={() => setMenuOpen(false)}>
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20 text-primary group-hover:bg-primary group-hover:text-black transition-all duration-300 overflow-hidden">
              {logoUrl ? (
                <img src={logoUrl} alt={storeName} className="h-full w-full object-cover" />
              ) : (
                <Gamepad2 className="h-6 w-6" />
              )}
            </div>
            <span className="text-xl font-bold tracking-tight">
              {settings?.storeName ? storeName : <>Golu<span className="text-primary drop-shadow-[0_0_10px_rgba(0,255,204,0.5)]">Bazaar</span></>}
            </span>
          </Link>

          {/* Desktop nav links */}
          <nav className="hidden md:flex items-center gap-6">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  location === link.href ? "text-primary drop-shadow-[0_0_8px_rgba(0,255,204,0.5)]" : "text-muted-foreground"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right side: currency + auth + hamburger */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Auth buttons — desktop */}
            <div className="hidden md:flex items-center gap-3">
              <Show when="signed-out">
                <Link href="/sign-in" className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-primary transition-colors">
                  <LogIn className="w-4 h-4" />
                  Sign In
                </Link>
                <CurrencySelector />
                <Link href="/sign-up" className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-primary/10 border border-primary/30 text-primary text-sm font-bold hover:bg-primary/20 transition-colors">
                  <UserPlus className="w-4 h-4" />
                  Sign Up
                </Link>
              </Show>
              <Show when="signed-in">
                <div className="flex items-center gap-3">
                  <Link
                    href="/orders"
                    className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Package className="w-4 h-4" />
                    My Orders
                  </Link>
                  <CurrencySelector />
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                    {user?.imageUrl ? (
                      <img src={user.imageUrl} alt={user.firstName ?? "User"} className="w-6 h-6 rounded-full object-cover" />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-primary/30 flex items-center justify-center">
                        <User className="w-3.5 h-3.5 text-primary" />
                      </div>
                    )}
                    <span className="text-sm font-semibold text-white max-w-[100px] truncate">
                      {user?.firstName ?? user?.emailAddresses?.[0]?.emailAddress?.split("@")[0] ?? "Account"}
                    </span>
                  </div>
                  <button
                    onClick={() => signOut({ redirectUrl: `${window.location.origin}${basePath}/` })}
                    className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-red-400 transition-colors"
                    title="Sign out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </Show>
            </div>

            {/* Sign In — visible on mobile header when signed out */}
            <Show when="signed-out">
              <Link
                href="/sign-in"
                className="md:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/30 text-primary text-sm font-bold hover:bg-primary/20 transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                <LogIn className="w-4 h-4" />
                Sign In
              </Link>
            </Show>

            {/* Currency selector — mobile, left of hamburger, when signed in */}
            <Show when="signed-in">
              <div className="md:hidden">
                <CurrencySelector />
              </div>
            </Show>

            {/* Hamburger — mobile */}
            <button
              className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
              onClick={() => setMenuOpen((o) => !o)}
              aria-label="Toggle menu"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu overlay */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 flex flex-col bg-black/95 backdrop-blur-xl md:hidden pt-16">
          <div className="flex flex-col flex-1 px-6 py-8 gap-2">
            {/* Nav links */}
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={cn(
                  "text-2xl font-black uppercase tracking-widest py-4 border-b border-white/5 transition-colors",
                  location === link.href ? "text-primary" : "text-white hover:text-primary"
                )}
              >
                {link.label}
              </Link>
            ))}

            {/* My Orders link (when signed in) */}
            <Show when="signed-in">
              <Link
                href="/orders"
                onClick={() => setMenuOpen(false)}
                className="text-2xl font-black uppercase tracking-widest py-4 border-b border-white/5 text-white hover:text-primary transition-colors"
              >
                My Orders
              </Link>
            </Show>

            {/* Currency */}
            <div className="pt-4">
              <div className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-3">Currency</div>
              <CurrencySelector />
            </div>

            {/* Auth buttons */}
            <div className="mt-auto pt-8 space-y-3">
              <Show when="signed-out">
                <Link href="/sign-in" onClick={() => setMenuOpen(false)} className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-white/10 text-white font-bold text-sm hover:bg-white/5 transition-colors">
                  <LogIn className="w-4 h-4" />
                  Sign In
                </Link>
                <Link href="/sign-up" onClick={() => setMenuOpen(false)} className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-primary/10 border border-primary/30 text-primary font-bold text-sm hover:bg-primary/20 transition-colors">
                  <UserPlus className="w-4 h-4" />
                  Sign Up
                </Link>
              </Show>
              <Show when="signed-in">
                <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-3">
                    {user?.imageUrl ? (
                      <img src={user.imageUrl} alt="" className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-primary/30 flex items-center justify-center">
                        <User className="w-5 h-5 text-primary" />
                      </div>
                    )}
                    <div>
                      <div className="font-bold text-white">{user?.firstName ?? "Account"}</div>
                      <div className="text-xs text-muted-foreground truncate max-w-[160px]">{user?.emailAddresses?.[0]?.emailAddress}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => { signOut({ redirectUrl: `${window.location.origin}${basePath}/` }); setMenuOpen(false); }}
                    className="p-2 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-colors"
                    title="Sign out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </Show>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
