import { useState } from "react";
import { useLocation } from "wouter";
import { useAdminLogin } from "@workspace/api-client-react";
import { ShieldAlert, Mail, KeyRound, Loader2, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const login = useAdminLogin({
    mutation: {
      onSuccess: () => {
        toast({ title: "Access Granted", description: "Welcome to the command center." });
        window.location.href = "/golustore-control/dashboard";
      },
      onError: (err: any) => {
        const msg = err?.response?.data?.error ?? "Invalid email or password.";
        toast({ variant: "destructive", title: "Access Denied", description: msg });
        setPassword("");
      },
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    login.mutate({ email, password });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-background">
      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10 animate-in zoom-in-95 duration-500">
        <div className="bg-card border border-white/10 p-8 md:p-12 rounded-3xl shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />

          <div className="flex flex-col items-center text-center mb-10">
            <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mb-6 text-primary shadow-[0_0_20px_rgba(0,255,204,0.2)]">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-black uppercase tracking-widest mb-2">Restricted Area</h1>
            <p className="text-sm font-mono text-muted-foreground uppercase tracking-widest">Admin Authorization Required</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="relative group">
              <div className="absolute inset-0 bg-primary/20 blur opacity-0 group-focus-within:opacity-100 transition-opacity rounded-xl" />
              <div className="relative flex items-center bg-background border border-white/10 rounded-xl px-4 py-3">
                <Mail className="w-5 h-5 text-muted-foreground mr-3 shrink-0" />
                <input
                  type="email"
                  placeholder="Admin Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-transparent border-none outline-none text-white placeholder:text-muted-foreground"
                  disabled={login.isPending}
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="relative group">
              <div className="absolute inset-0 bg-primary/20 blur opacity-0 group-focus-within:opacity-100 transition-opacity rounded-xl" />
              <div className="relative flex items-center bg-background border border-white/10 rounded-xl px-4 py-3">
                <KeyRound className="w-5 h-5 text-muted-foreground mr-3 shrink-0" />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-transparent border-none outline-none font-mono tracking-widest text-white placeholder:text-muted-foreground"
                  disabled={login.isPending}
                  autoComplete="current-password"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={login.isPending || !email || !password}
              className="w-full py-4 mt-2 bg-primary text-primary-foreground font-black uppercase tracking-widest rounded-xl hover:bg-primary/90 transition-all hover:shadow-[0_0_20px_rgba(0,255,204,0.4)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {login.isPending ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Authenticating...</>
              ) : (
                <><Lock className="w-4 h-4" /> Authorize Access</>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/5">
            <p className="text-center text-xs text-muted-foreground/40 font-mono uppercase tracking-widest mb-3">
              5 failed attempts = 15 min lockout
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
