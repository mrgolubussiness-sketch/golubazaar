import { Link } from "wouter";
import { ArrowLeft, FileText } from "lucide-react";
import { useMeta } from "@/hooks/useMeta";

interface Section {
  title: string;
  content: React.ReactNode;
}

const sections: Section[] = [
  {
    title: "Overview",
    content: (
      <>
        <p>
          Welcome to GoluBazaar (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;). By accessing or using our
          website and services, you agree to be bound by these Terms of Service. Please read them carefully
          before making any purchase or creating an account.
        </p>
        <p className="mt-3">
          GoluBazaar is a digital goods reseller offering game accounts, OTT subscriptions, Discord Nitro,
          and other digital products. We act as an intermediary and do not claim ownership of the brands
          whose products we resell.
        </p>
      </>
    ),
  },
  {
    title: "Acceptable Use",
    content: (
      <>
        <p>You agree to use GoluBazaar only for lawful purposes. You must not:</p>
        <ul className="mt-3 space-y-2 list-disc list-inside text-muted-foreground">
          <li>Resell or redistribute purchased digital goods without our written consent.</li>
          <li>Attempt to reverse-engineer, scrape, or automate access to our platform.</li>
          <li>Engage in chargebacks or payment fraud.</li>
          <li>Use purchased accounts for cheating, boosting, or any activity that violates the original platform&apos;s terms.</li>
          <li>Attempt to recover or reclaim sold accounts from us or third parties.</li>
          <li>Create multiple accounts to abuse promotional offers or coupons.</li>
        </ul>
        <p className="mt-3">
          Violation of these rules may result in immediate account suspension and forfeiture of any pending
          orders without refund.
        </p>
      </>
    ),
  },
  {
    title: "Payments & Refunds",
    content: (
      <>
        <p>
          All prices are listed in Indian Rupees (₹) unless otherwise stated. Payments are processed
          securely through our payment partners. By completing a purchase, you authorize the charge to
          your selected payment method.
        </p>
        <p className="mt-3">
          <span className="font-bold text-white">Refund Policy:</span> Due to the digital nature of our
          products, all sales are generally final. However, we will issue a full refund or replacement in
          the following cases:
        </p>
        <ul className="mt-3 space-y-2 list-disc list-inside text-muted-foreground">
          <li>The product was not delivered within 24 hours of confirmed payment.</li>
          <li>The account or subscription credentials provided were invalid or already in use.</li>
          <li>The delivered product materially differs from its listed description.</li>
        </ul>
        <p className="mt-3">
          Refund requests must be submitted within 48 hours of purchase. We reserve the right to decline
          refunds for accounts that have been accessed, used, or modified after delivery.
        </p>
      </>
    ),
  },
  {
    title: "Delivery",
    content: (
      <>
        <p>
          Digital goods are delivered via Discord DM, email, or directly on our platform after successful
          payment confirmation. Delivery times are estimates and may vary based on order volume and product
          availability.
        </p>
        <p className="mt-3">
          For products requiring manual delivery (e.g., gaming accounts), please allow up to 12 hours.
          You will be notified via the contact details provided at checkout. It is your responsibility to
          provide accurate contact information.
        </p>
        <p className="mt-3">
          GoluBazaar is not responsible for delays caused by incorrect contact details, network issues on
          your end, or third-party platform outages.
        </p>
      </>
    ),
  },
  {
    title: "Accounts",
    content: (
      <>
        <p>
          You may create an account on GoluBazaar to track orders and manage your purchases. You are
          responsible for maintaining the confidentiality of your login credentials and for all activities
          that occur under your account.
        </p>
        <p className="mt-3">
          You must be at least 13 years of age to create an account. If you are under 18, you must have
          parental or guardian consent to make purchases.
        </p>
        <p className="mt-3">
          We reserve the right to suspend or terminate accounts that violate these Terms, engage in
          fraudulent activity, or misuse our services.
        </p>
      </>
    ),
  },
  {
    title: "Limitation of Liability",
    content: (
      <>
        <p>
          GoluBazaar provides its services &quot;as is&quot; without warranties of any kind, express or implied.
          We do not guarantee uninterrupted service or that products will meet your specific expectations
          beyond what is listed in the product description.
        </p>
        <p className="mt-3">
          To the maximum extent permitted by applicable law, GoluBazaar shall not be liable for any
          indirect, incidental, consequential, or punitive damages arising from the use of our platform,
          including but not limited to loss of profits, data, or account access.
        </p>
        <p className="mt-3">
          Our total liability in connection with any order shall not exceed the amount paid for that
          specific order. GoluBazaar is not affiliated with, endorsed by, or officially connected with
          Discord, Netflix, Spotify, Riot Games, or any other third-party brands whose products we resell.
        </p>
      </>
    ),
  },
  {
    title: "Changes to Terms",
    content: (
      <>
        <p>
          We reserve the right to update or modify these Terms of Service at any time. Changes will be
          posted on this page with an updated &quot;Last Updated&quot; date. Continued use of our services after
          changes are posted constitutes your acceptance of the revised Terms.
        </p>
        <p className="mt-3">
          We encourage you to review this page periodically to stay informed about any updates. Material
          changes will be communicated via a notice on our website or via email where feasible.
        </p>
      </>
    ),
  },
  {
    title: "Contact",
    content: (
      <>
        <p>
          If you have questions about these Terms of Service, please reach out to us through any of the
          following channels:
        </p>
        <ul className="mt-3 space-y-2 list-disc list-inside text-muted-foreground">
          <li>Discord: Reach us via our support server linked in the About page.</li>
          <li>Email: Listed on our About page (if configured by the store admin).</li>
          <li>WhatsApp / Telegram: Available via the contact links in our About section.</li>
        </ul>
        <p className="mt-3">
          We aim to respond to all inquiries within 24 hours on business days.
        </p>
      </>
    ),
  },
];

export default function Terms() {
  useMeta({ title: "Terms of Service", description: "Read GoluBazaar's terms of service and understand the rules that govern your use of our platform.", noIndex: false });
  return (
    <div className="relative z-10 min-h-screen">
      {/* Glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-secondary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px]" />
      </div>

      <div className="container mx-auto px-4 py-12 max-w-3xl">
        {/* Back */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-white transition-colors text-sm font-bold uppercase tracking-widest mb-10"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        {/* Header */}
        <div className="mb-12">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-secondary/10 border border-secondary/20 text-secondary mb-6">
            <FileText className="w-7 h-7" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight mb-3">
            Terms of{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary to-primary">
              Service
            </span>
          </h1>
          <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
            Last updated: July 2026
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-10">
          {sections.map((section, i) => (
            <section key={i}>
              <h2 className="text-lg font-black uppercase tracking-tight text-primary mb-4 flex items-center gap-3">
                <span className="text-xs font-mono text-muted-foreground w-6">{String(i + 1).padStart(2, "0")}</span>
                {section.title}
              </h2>
              <div className="text-muted-foreground leading-relaxed text-sm pl-9">
                {section.content}
              </div>
            </section>
          ))}
        </div>

        {/* Footer note */}
        <div className="mt-14 p-6 bg-card border border-white/5 rounded-2xl text-center">
          <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest">
            By using GoluBazaar, you acknowledge that you have read, understood, and agree to these Terms of Service.
          </p>
        </div>
      </div>
    </div>
  );
}
