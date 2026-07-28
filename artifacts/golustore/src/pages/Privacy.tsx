import { Link } from "wouter";
import { ArrowLeft, Shield } from "lucide-react";
import { useMeta } from "@/hooks/useMeta";

interface Section {
  title: string;
  content: React.ReactNode;
}

const sections: Section[] = [
  {
    title: "What We Collect",
    content: (
      <>
        <p>
          When you use GoluBazaar, we collect certain information to provide and improve our services.
          The data we collect includes:
        </p>
        <ul className="mt-3 space-y-2 list-disc list-inside text-muted-foreground">
          <li>
            <span className="font-bold text-white">Account information:</span> Name, email address, and
            profile details provided during sign-up via Clerk authentication.
          </li>
          <li>
            <span className="font-bold text-white">Contact details:</span> Discord username, WhatsApp or
            email address provided during checkout for order delivery.
          </li>
          <li>
            <span className="font-bold text-white">Order data:</span> Products purchased, transaction
            amounts, timestamps, and order status.
          </li>
          <li>
            <span className="font-bold text-white">Technical data:</span> IP address, browser type,
            device information, and pages visited (via server logs and analytics).
          </li>
          <li>
            <span className="font-bold text-white">Communications:</span> Support messages or feedback you
            send us via Discord, email, or any embedded contact form.
          </li>
        </ul>
        <p className="mt-3">
          We do not collect payment card details directly — payments are handled by our third-party payment
          processors who are independently PCI-compliant.
        </p>
      </>
    ),
  },
  {
    title: "How We Use It",
    content: (
      <>
        <p>We use the information we collect for the following purposes:</p>
        <ul className="mt-3 space-y-2 list-disc list-inside text-muted-foreground">
          <li>Processing and fulfilling your orders and delivering purchased digital goods.</li>
          <li>Sending order confirmations, status updates, and delivery information.</li>
          <li>Providing customer support and resolving disputes.</li>
          <li>Detecting and preventing fraud, abuse, and unauthorized access.</li>
          <li>Improving our website, product offerings, and user experience.</li>
          <li>Complying with applicable legal obligations and regulatory requirements.</li>
          <li>Sending promotional communications where you have consented to receive them.</li>
        </ul>
        <p className="mt-3">
          We process your data on the legal bases of contractual necessity (to fulfill orders), legitimate
          interest (to improve our services), and consent (for marketing communications).
        </p>
      </>
    ),
  },
  {
    title: "Cookies & Tracking",
    content: (
      <>
        <p>
          GoluBazaar uses cookies and similar tracking technologies to enhance your browsing experience
          and understand how our platform is used.
        </p>
        <p className="mt-3">
          <span className="font-bold text-white">Essential cookies</span> are required for core
          functionality such as authentication sessions and shopping cart state. These cannot be disabled.
        </p>
        <p className="mt-3">
          <span className="font-bold text-white">Analytics cookies</span> help us understand visitor
          behaviour, page performance, and user journeys. We may use privacy-friendly analytics tools that
          do not share data with third-party advertisers.
        </p>
        <p className="mt-3">
          You can control non-essential cookies through your browser settings. Disabling cookies may
          affect site functionality. By continuing to use GoluBazaar, you consent to our use of essential
          cookies.
        </p>
      </>
    ),
  },
  {
    title: "Third Parties (Clerk Auth, Discord)",
    content: (
      <>
        <p>We work with select third-party services to operate our platform:</p>
        <ul className="mt-3 space-y-2 list-disc list-inside text-muted-foreground">
          <li>
            <span className="font-bold text-white">Clerk (Authentication):</span> We use Clerk to manage
            user sign-up, login, and session management. Clerk processes your email and profile data in
            accordance with their own{" "}
            <a
              href="https://clerk.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Privacy Policy
            </a>
            .
          </li>
          <li>
            <span className="font-bold text-white">Discord:</span> Orders are delivered via Discord DM.
            Your Discord username is used solely for delivery purposes and is not shared with any other
            party.
          </li>
          <li>
            <span className="font-bold text-white">Payment Processors:</span> Payments are handled by
            third-party providers. We share only the minimum data required to process your transaction
            (order amount, reference ID). We never store full card details.
          </li>
        </ul>
        <p className="mt-3">
          We do not sell, rent, or trade your personal data to advertisers or data brokers.
        </p>
      </>
    ),
  },
  {
    title: "Data Retention",
    content: (
      <>
        <p>
          We retain your personal data only for as long as necessary to fulfill the purposes for which it
          was collected, or as required by applicable law.
        </p>
        <ul className="mt-3 space-y-2 list-disc list-inside text-muted-foreground">
          <li>Account data is retained for the duration of your active account.</li>
          <li>Order records are retained for a minimum of 3 years for accounting and legal compliance.</li>
          <li>Support communications are retained for 1 year after resolution.</li>
          <li>Analytics data is anonymised and retained for up to 2 years.</li>
        </ul>
        <p className="mt-3">
          Upon account deletion, your personal information will be removed from our active systems within
          30 days, subject to any legal retention obligations.
        </p>
      </>
    ),
  },
  {
    title: "Your Rights",
    content: (
      <>
        <p>
          Depending on your jurisdiction (including under GDPR for EEA residents), you have the following
          rights regarding your personal data:
        </p>
        <ul className="mt-3 space-y-2 list-disc list-inside text-muted-foreground">
          <li><span className="font-bold text-white">Access:</span> Request a copy of the personal data we hold about you.</li>
          <li><span className="font-bold text-white">Rectification:</span> Ask us to correct inaccurate or incomplete data.</li>
          <li><span className="font-bold text-white">Erasure:</span> Request deletion of your personal data (&quot;right to be forgotten&quot;), subject to legal obligations.</li>
          <li><span className="font-bold text-white">Portability:</span> Request your data in a structured, machine-readable format.</li>
          <li><span className="font-bold text-white">Objection:</span> Object to processing based on legitimate interests.</li>
          <li><span className="font-bold text-white">Restriction:</span> Request that we restrict processing of your data in certain circumstances.</li>
          <li><span className="font-bold text-white">Withdraw consent:</span> Withdraw consent for marketing communications at any time.</li>
        </ul>
        <p className="mt-3">
          To exercise any of these rights, please contact us using the details in the Contact section below.
          We will respond within 30 days.
        </p>
      </>
    ),
  },
  {
    title: "Contact",
    content: (
      <>
        <p>
          If you have questions, concerns, or requests regarding this Privacy Policy or your personal data,
          please contact us:
        </p>
        <ul className="mt-3 space-y-2 list-disc list-inside text-muted-foreground">
          <li>Discord: Via our support server linked on the About page.</li>
          <li>Email: Listed in the About section (if configured by the store admin).</li>
          <li>Telegram / WhatsApp: Available through the contact links on the About page.</li>
        </ul>
        <p className="mt-3">
          If you believe we have mishandled your data, you also have the right to lodge a complaint with
          your local data protection authority.
        </p>
      </>
    ),
  },
];

export default function Privacy() {
  useMeta({ title: "Privacy Policy", description: "Learn how GoluBazaar collects, uses, and protects your personal information." });
  return (
    <div className="relative z-10 min-h-screen">
      {/* Glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[100px]" />
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
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 text-primary mb-6">
            <Shield className="w-7 h-7" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight mb-3">
            Privacy{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
              Policy
            </span>
          </h1>
          <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
            Last updated: July 2026
          </p>
        </div>

        {/* Intro blurb */}
        <div className="bg-card border border-white/5 rounded-2xl p-6 mb-10">
          <p className="text-sm text-muted-foreground leading-relaxed">
            At GoluBazaar, your privacy matters to us. This Privacy Policy explains what data we collect,
            how we use it, and what rights you have. We are committed to handling your information
            responsibly and transparently.
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
            This policy is governed by Indian law. For cross-border data transfers, we ensure appropriate safeguards are in place.
          </p>
        </div>
      </div>
    </div>
  );
}
