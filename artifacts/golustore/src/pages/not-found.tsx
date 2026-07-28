import { Link } from "wouter";
import { AlertTriangle, Zap } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-destructive/10 text-destructive mb-6 shadow-[0_0_30px_rgba(255,0,0,0.2)]">
          <AlertTriangle className="w-10 h-10" />
        </div>
        
        <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-4 text-transparent bg-clip-text bg-gradient-to-r from-destructive to-accent">
          404
        </h1>
        
        <h2 className="text-2xl font-bold uppercase tracking-widest mb-6">Area Restricted</h2>
        
        <p className="text-muted-foreground font-mono mb-10 max-w-md mx-auto">
          The sector you are trying to access does not exist or has been moved to a different coordinate.
        </p>

        <Link href="/" className="inline-flex items-center gap-2 px-8 py-4 bg-background border border-primary text-primary font-black uppercase tracking-widest rounded-xl hover:bg-primary/10 transition-colors shadow-[0_0_15px_rgba(0,255,204,0.2)]">
          <Zap className="w-5 h-5" /> Return to Base
        </Link>
      </div>
    </div>
  );
}
