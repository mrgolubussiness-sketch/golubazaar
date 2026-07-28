import { useGetStoreSettings } from "@workspace/api-client-react";
import { useMeta } from "@/hooks/useMeta";
import { MessageSquare, Users, ShoppingBag, Phone, Send, Instagram, Youtube, Mail, Zap, ShieldCheck, Crown, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export default function About() {
  useMeta({ title: "About Us", description: "GoluBazaar is India's trusted marketplace for premium digital goods — gaming accounts, OTT subscriptions, and Discord upgrades." });
  const { data: settings } = useGetStoreSettings();

  const storeName = settings?.storeName || "GoluBazaar";
  const tagline = settings?.tagline || "Level up your digital life.";
  
  const aboutText = settings?.aboutText || "We are a trusted digital marketplace delivering premium subscriptions, game accounts, and Discord services — instantly.";

  const socials = [
    { key: 'discordUsername', value: settings?.discordUsername, icon: MessageSquare, label: "Discord", href: null, isCopy: true },
    { key: 'discordSupportServer', value: settings?.discordSupportServer, icon: Users, label: "Support Server", href: settings?.discordSupportServer },
    { key: 'discordShopLink', value: settings?.discordShopLink, icon: ShoppingBag, label: "Discord Shop", href: settings?.discordShopLink },
    { key: 'whatsappNumber', value: settings?.whatsappNumber, icon: Phone, label: "WhatsApp", href: settings?.whatsappNumber ? `https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}` : null },
    { key: 'telegramLink', value: settings?.telegramLink, icon: Send, label: "Telegram", href: settings?.telegramLink },
    { key: 'instagramLink', value: settings?.instagramLink, icon: Instagram, label: "Instagram", href: settings?.instagramLink },
    { key: 'youtubeLink', value: settings?.youtubeLink, icon: Youtube, label: "YouTube", href: settings?.youtubeLink },
    { key: 'contactEmail', value: settings?.contactEmail, icon: Mail, label: "Email", href: settings?.contactEmail ? `mailto:${settings.contactEmail}` : null },
  ].filter(s => !!s.value);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[120px] pointer-events-none opacity-50" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[100px] pointer-events-none opacity-40" />
        
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-4 animate-in fade-in slide-in-from-bottom-6">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-accent drop-shadow-[0_0_15px_rgba(0,255,204,0.3)]">
              {storeName}
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto font-mono uppercase tracking-widest animate-in fade-in slide-in-from-bottom-8 delay-100 fill-mode-both">
            {tagline}
          </p>
        </div>
      </section>

      {/* About & Socials Grid */}
      <section className="py-12 relative z-10">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* About Card */}
            <div className="bg-card border border-white/5 rounded-2xl p-8 shadow-xl flex flex-col justify-center animate-in fade-in slide-in-from-bottom-10 delay-200 fill-mode-both">
              <h2 className="text-sm font-bold uppercase tracking-widest text-primary mb-6 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                About Us
              </h2>
              <p className="text-lg leading-relaxed text-muted-foreground whitespace-pre-wrap">
                {aboutText}
              </p>
            </div>

            {/* Connect Card Grid */}
            <div className="bg-card/50 border border-white/5 rounded-2xl p-8 flex flex-col animate-in fade-in slide-in-from-bottom-10 delay-300 fill-mode-both">
              <h2 className="text-sm font-bold uppercase tracking-widest text-secondary mb-6 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                Connect With Us
              </h2>
              
              {socials.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {socials.map((social) => {
                    const Card = social.href ? 'a' : 'div';
                    return (
                      <Card 
                        key={social.key} 
                        href={social.href || undefined}
                        target={social.href && !social.href.startsWith('mailto') ? "_blank" : undefined}
                        rel={social.href && !social.href.startsWith('mailto') ? "noopener noreferrer" : undefined}
                        className={cn(
                          "flex items-center gap-4 p-4 rounded-xl border border-white/5 bg-background/50 transition-all duration-300",
                          social.href ? "hover:border-primary/50 hover:bg-primary/5 hover:-translate-y-1 hover:shadow-[0_4px_20px_rgba(0,255,204,0.1)] cursor-pointer" : ""
                        )}
                      >
                        <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
                          <social.icon className="w-5 h-5" />
                        </div>
                        <div className="overflow-hidden">
                          <div className="text-xs font-mono uppercase tracking-wider text-muted-foreground">{social.label}</div>
                          <div className="font-bold truncate text-sm">{social.value}</div>
                        </div>
                      </Card>
                    )
                  })}
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-center p-8 border border-dashed border-white/10 rounded-xl">
                  <p className="text-muted-foreground font-mono text-sm uppercase tracking-widest">More links coming soon</p>
                </div>
              )}
            </div>
            
          </div>
        </div>
      </section>

      {/* Trust Badges Row */}
      <section className="py-20 border-t border-white/5 bg-black/20 backdrop-blur-sm mt-auto">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { icon: Zap, title: "Instant Delivery", desc: "No waiting time" },
              { icon: ShieldCheck, title: "Verified Seller", desc: "100% authentic" },
              { icon: Clock, title: "24/7 Support", desc: "Always here for you" },
              { icon: Crown, title: "Secure Payments", desc: "Safe transactions" },
            ].map((feature, i) => (
              <div key={i} className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-card border border-white/5 hover:border-primary/20 hover:bg-white/5 transition-all duration-300">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2">
                  <feature.icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-sm uppercase tracking-widest mb-1">{feature.title}</h3>
                  <p className="text-xs font-mono text-muted-foreground">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
