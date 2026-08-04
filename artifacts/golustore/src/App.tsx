import { useEffect, useRef } from "react";
import { ClerkProvider, useClerk } from "@clerk/react";
import { publishableKeyFromHost } from "@clerk/react/internal";
import { shadcn } from "@clerk/themes";
import { Switch, Route, useLocation, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AnnouncementBanner from "@/components/AnnouncementBanner";
import FallingIconsBackground from "@/components/FallingIconsBackground";
import { CurrencyProvider } from "@/contexts/CurrencyContext";

import Home from "@/pages/Home";
import Products from "@/pages/Products";
import ProductDetail from "@/pages/ProductDetail";
import About from "@/pages/About";
import SignInPage from "@/pages/SignIn";
import SignUpPage from "@/pages/SignUp";

import AdminLogin from "@/pages/admin/Login";
import AdminDashboard from "@/pages/admin/Dashboard";
import AdminProductForm from "@/pages/admin/ProductForm";
import AdminSettings from "@/pages/admin/Settings";
import AdminOrders from "@/pages/admin/Orders";
import AdminCoupons from "@/pages/admin/Coupons";
import AdminReviews from "@/pages/admin/Reviews";
import AdminFaqPage from "@/pages/admin/AdminFaq";
import MyOrders from "@/pages/MyOrders";
import FAQ from "@/pages/FAQ";
import Terms from "@/pages/Terms";
import Privacy from "@/pages/Privacy";

import NotFound from "@/pages/not-found";
const queryClient = new QueryClient();
const ADMIN = "/golustore-control";
const clerkPubKey = "pk_test_aWRlYWwtYnJlYW0tNi5jbGVyay5hY2NvdW50cy5kZXYk";
const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;

// Safe fallback verification net to stop the black screen crash

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || "/"
    : path;
}

const clerkAppearance = {
  theme: shadcn,
  cssLayerName: "clerk",
  options: {
    logoPlacement: "inside" as const,
    logoLinkUrl: basePath || "/",
    logoImageUrl: `${window.location.origin}${basePath}/logo.svg`,
    socialButtonsVariant: "blockButton" as const,
    socialButtonsPlacement: "top" as const,
  },
  variables: {
    colorPrimary: "#00ffcc",
    colorForeground: "#fafafa",
    colorMutedForeground: "#a1a1aa",
    colorDanger: "#ff4040",
    colorBackground: "#0a0a14",
    colorInput: "#12121f",
    colorInputForeground: "#fafafa",
    colorNeutral: "#3f3f5a",
    fontFamily: "'Outfit', sans-serif",
    borderRadius: "0.5rem",
  },
  elements: {
    rootBox: "w-full flex justify-center",
    cardBox: "bg-[#0d0d1a] border border-white/10 rounded-2xl w-[440px] max-w-full overflow-hidden shadow-[0_0_60px_rgba(0,255,204,0.06)]",
    card: "!shadow-none !border-0 !bg-transparent !rounded-none",
    footer: "!shadow-none !border-0 !bg-transparent !rounded-none",
    headerTitle: "text-white font-black tracking-tight",
    headerSubtitle: "text-zinc-400",
    socialButtonsBlockButtonText: "text-white font-semibold",
    formFieldLabel: "text-zinc-300 font-medium text-sm",
    footerActionLink: "text-[#00ffcc] font-bold hover:opacity-80",
    footerActionText: "text-zinc-500",
    dividerText: "text-zinc-600",
    identityPreviewEditButton: "text-[#00ffcc]",
    formFieldSuccessText: "text-emerald-400",
    alertText: "text-red-400",
    logoBox: "flex justify-center mb-1",
    logoImage: "h-10 w-auto",
    socialButtonsBlockButton: "border border-white/10 bg-white/5 hover:bg-white/10 transition-colors",
    formButtonPrimary: "bg-[#00ffcc] text-black font-black hover:bg-[#00ffcc]/90 transition-colors",
    formFieldInput: "bg-[#12121f] border-white/10 text-white",
    footerAction: "border-t border-white/5 bg-black/30",
    dividerLine: "bg-white/10",
    alert: "border border-red-500/20 bg-red-500/5 rounded-lg",
    otpCodeFieldInput: "bg-[#12121f] border-white/10 text-white",
  },
};

// Clears React Query cache on Clerk sign-in/sign-out
function ClerkQueryClientCacheInvalidator() {
  const { addListener } = useClerk();
  const qc = useQueryClient();
  const prevRef = useRef<string | null | undefined>(undefined);
  useEffect(() => {
    const unsub = addListener(({ user }) => {
      const id = user?.id ?? null;
      if (prevRef.current !== undefined && prevRef.current !== id) qc.clear();
      prevRef.current = id;
    });
    return unsub;
  }, [addListener, qc]);
  return null;
}

// ─── Admin layout — completely isolated, no Navbar, no Clerk UI ──────────────
function AdminApp() {
  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background text-foreground">
        <Switch>
          <Route path={ADMIN} component={AdminLogin} />
          <Route path={`${ADMIN}/dashboard`} component={AdminDashboard} />
          <Route path={`${ADMIN}/settings`} component={AdminSettings} />
          <Route path={`${ADMIN}/orders`} component={AdminOrders} />
          <Route path={`${ADMIN}/coupons`} component={AdminCoupons} />
          <Route path={`${ADMIN}/reviews`} component={AdminReviews} />
          <Route path={`${ADMIN}/faq`} component={AdminFaqPage} />
          <Route path={`${ADMIN}/products/new`} component={AdminProductForm} />
          <Route path={`${ADMIN}/products/:id/edit`} component={AdminProductForm} />
          <Route component={NotFound} />
        </Switch>
      </div>
      <Toaster />
    </TooltipProvider>
  );
}

// ─── Public layout — has Clerk, Navbar, Footer ───────────────────────────────
function PublicApp() {
  return (
    <div className="flex flex-col min-h-[100dvh] bg-black text-foreground selection:bg-primary selection:text-primary-foreground">
      <FallingIconsBackground />
      <AnnouncementBanner />
      <Navbar />
      <main className="flex-1 relative z-10">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/products" component={Products} />
          <Route path="/products/:id" component={ProductDetail} />
          <Route path="/about" component={About} />
          <Route path="/orders" component={MyOrders} />
          <Route path="/faq" component={FAQ} />
          <Route path="/terms" component={Terms} />
          <Route path="/privacy" component={Privacy} />
          <Route path="/sign-in/*?" component={SignInPage} />
          <Route path="/sign-up/*?" component={SignUpPage} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
    </div>
  );
}

function ClerkProviderWithPublicApp() {
  const [, setLocation] = useLocation();
  
    if (!clerkPubKey) {
    console.error("Missing VITE_CLERK_PUBLISHABLE_KEY");
    return (
      <div style={{ background: "#ffefef", color: "#b71c1c", padding: "40px", textAlign: "center", minHeight: "100vh", fontFamily: "sans-serif" }}>
        <h2 style={{ color: "#ff4d4d", fontSize: "28px", fontWeight: "900" }}>⚠️ Golu Bazaar Config Error</h2>
        <p style={{ fontSize: "16px", margin: "20px 0" }}>Your frontend built successfully, but your Clerk API Key is missing or unbaked.</p>
        <div style={{ background: "#1a1a2e", padding: "15px", borderRadius: "8px", display: "inline-block", border: "1px solid rgba(255,255,255,0.1)" }}>
          <code style={{ color: "#00ffcc" }}>VITE_CLERK_PUBLISHABLE_KEY is undefined</code>
        </div>
        <p style={{ color: "#a1a1aa", fontSize: "14px", marginTop: "20px" }}>Please verify your key is saved in Railway and trigger a hard Redeploy.</p>
      </div>
    );
    }
  
  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      proxyUrl={clerkProxyUrl}
      appearance={clerkAppearance}
      signInUrl={`${basePath}/sign-in`}
      signUpUrl={`${basePath}/sign-up`}
      localization={{
        signIn: { start: { title: "Welcome back", subtitle: "Sign in to your GoluBazaar account" } },
        signUp: { start: { title: "Join GoluBazaar", subtitle: "Create your account to get started" } },
      }}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      <ClerkQueryClientCacheInvalidator />
      <TooltipProvider>
        <CurrencyProvider>
          <PublicApp />
        </CurrencyProvider>
      </TooltipProvider>
      <Toaster />
    </ClerkProvider>
  );
}

// --- Root: decides admin vs public ───────────────────────────────────────────
function InnerApp() {
  const [location] = useLocation();
  const isAdmin = location.startsWith(ADMIN);
  if (isAdmin) return <AdminApp />;
  return <ClerkProviderWithPublicApp />;
}

class GlobalErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error: any}> {
  state = { hasError: false, error: null };
  static getDerivedStateFromError(error: any) { return { hasError: true, error }; }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ background: "#fff5f5", color: "#c53030", padding: "40px", fontFamily: "sans-serif", minHeight: "100vh", textAlign: "center" }}>
          <h2 style={{ fontWeight: "900", fontSize: "24px" }}>⚠️ Golu Bazaar Render Error</h2>
          <p>A frontend page component crashed while loading your store data:</p>
          <pre style={{ background: "#fff", padding: "15px", border: "1px solid #feb2b2", borderRadius: "6px", overflowX: "auto", color: "#2d3748", textAlign: "left", maxWidth: "600px", margin: "20px auto" }}>
            {this.state.error?.stack || this.state.error?.toString()}
          </pre>
          <p style={{ color: "#718096", fontSize: "14px" }}>This happens if a component tries to read properties that are missing from your backend server payload streams.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  return (
    <GlobalErrorBoundary>
      <WouterRouter base={basePath}>
        <QueryClientProvider client={queryClient}>
          <InnerApp />
        </QueryClientProvider>
      </WouterRouter>
    </GlobalErrorBoundary>
  );
}

export default App;
