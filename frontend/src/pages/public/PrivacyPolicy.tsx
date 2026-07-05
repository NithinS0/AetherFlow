import { PublicLayout } from "../../layouts/PublicLayout";
import { Shield } from "lucide-react";

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="glass-panel border border-white/5 rounded-2xl p-7 space-y-3">
    <h2 className="text-[17px] font-extrabold text-white">{title}</h2>
    <div className="text-[14px] text-zinc-400 leading-relaxed space-y-3">{children}</div>
  </div>
);

export function PrivacyPolicy() {
  return (
    <PublicLayout breadcrumbs={[{ label: "Company" }, { label: "Privacy Policy" }]}>
      <section className="max-w-4xl mx-auto px-6 pt-20 pb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-400/20 bg-indigo-400/5 text-[11px] font-bold uppercase tracking-widest text-indigo-300 mb-6">
          <Shield className="w-3.5 h-3.5" /> Privacy Policy
        </div>
        <h1 className="text-4xl font-black tracking-tight text-white mb-4">Privacy Policy</h1>
        <p className="text-[14px] text-zinc-500 font-mono mb-10">Effective Date: July 1, 2026 · Last Updated: July 1, 2026</p>

        <div className="space-y-5">
          <Section title="1. Introduction">
            <p>AetherFlow Enterprise ("AetherFlow", "we", "our", "us") is committed to protecting the privacy and security of your personal data. This Privacy Policy explains how we collect, use, store, and protect information you provide when using the AetherFlow Enterprise platform.</p>
            <p>By accessing or using AetherFlow, you agree to the collection and use of information as described in this policy. If you do not agree, please discontinue use of the platform.</p>
          </Section>

          <Section title="2. Information We Collect">
            <p><strong className="text-zinc-200">Account Information:</strong> When you register, we collect your email address, full name, and organisation name. This information is required to provide platform access and support.</p>
            <p><strong className="text-zinc-200">Usage Data:</strong> We collect platform interaction data including API calls, job submissions, queue configurations, and worker deployments. This data is used for billing, analytics, and service improvement.</p>
            <p><strong className="text-zinc-200">Technical Data:</strong> IP addresses, browser type, device identifiers, and session tokens are collected for security, fraud prevention, and audit purposes.</p>
            <p><strong className="text-zinc-200">Job Payload Data:</strong> Job payloads you submit to the scheduler are stored exclusively in your organisation's database scope. We do not read, analyse, or share job payload content.</p>
          </Section>

          <Section title="3. How We Use Your Information">
            <p>We use collected data to: (a) provide and improve the AetherFlow platform; (b) authenticate and authorise platform access; (c) generate usage analytics and billing; (d) detect and prevent fraud, abuse, and security incidents; (e) communicate service updates, maintenance windows, and incident notifications.</p>
            <p>We do not sell, rent, or trade your personal information to third parties for marketing purposes.</p>
          </Section>

          <Section title="4. Cookies and Tracking">
            <p>AetherFlow uses essential session cookies for authentication and CSRF protection. We do not use third-party advertising trackers or behavioural profiling cookies.</p>
            <p>You may disable non-essential cookies through your browser settings. Essential authentication cookies are required for platform operation and cannot be disabled.</p>
          </Section>

          <Section title="5. Data Storage and Retention">
            <p>All platform data is stored in Supabase-managed PostgreSQL instances within the European Union (eu-west-1 region) by default, with optional deployment in additional regions upon request.</p>
            <p>Account data is retained for the duration of your subscription plus 90 days following account closure. Audit logs are retained for 365 days. Job execution history is retained for 30 days by default, configurable up to 365 days on enterprise plans.</p>
          </Section>

          <Section title="6. Data Security">
            <p>All data in transit is encrypted using TLS 1.3. Data at rest is encrypted using AES-256 via Supabase Vault. Access to production databases is restricted to authenticated services and authorised platform engineers.</p>
            <p>We conduct periodic security reviews and penetration testing. Security incidents are disclosed to affected customers within 72 hours of confirmation.</p>
          </Section>

          <Section title="7. Your Rights">
            <p>You have the right to: (a) access your personal data; (b) request correction of inaccurate data; (c) request deletion of your data subject to legal retention requirements; (d) export your data in machine-readable format; (e) withdraw consent where processing is consent-based.</p>
            <p>To exercise these rights, contact your organisation administrator or reach out via the platform support channel.</p>
          </Section>

          <Section title="8. Third-Party Services">
            <p>AetherFlow integrates with the following third-party services: Supabase (database, authentication, storage), Groq (AI inference — no user data transmitted), Resend (transactional email). Each provider operates under their own privacy policy and data processing agreements compliant with GDPR.</p>
          </Section>

          <Section title="9. Changes to This Policy">
            <p>We may update this Privacy Policy periodically. Material changes will be communicated via email and in-platform notification at least 30 days before they take effect. Continued use of the platform after the effective date constitutes acceptance of the updated policy.</p>
          </Section>

          <Section title="10. Contact">
            <p>For privacy inquiries, data subject requests, or security concerns, contact the platform administrator through the AetherFlow Enterprise dashboard or refer to the Security section of this website.</p>
          </Section>
        </div>
      </section>
    </PublicLayout>
  );
}
