import { PublicLayout } from "../../layouts/PublicLayout";
import { FileText } from "lucide-react";

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="glass-panel border border-white/5 rounded-2xl p-7 space-y-3">
    <h2 className="text-[17px] font-extrabold text-white">{title}</h2>
    <div className="text-[14px] text-zinc-400 leading-relaxed space-y-3">{children}</div>
  </div>
);

export function TermsOfService() {
  return (
    <PublicLayout breadcrumbs={[{ label: "Company" }, { label: "Terms of Service" }]}>
      <section className="max-w-4xl mx-auto px-6 pt-20 pb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-400/20 bg-amber-400/5 text-[11px] font-bold uppercase tracking-widest text-amber-300 mb-6">
          <FileText className="w-3.5 h-3.5" /> Terms of Service
        </div>
        <h1 className="text-4xl font-black tracking-tight text-white mb-4">Terms of Service</h1>
        <p className="text-[14px] text-zinc-500 font-mono mb-10">Effective Date: July 1, 2026 · Version: 1.0</p>

        <div className="space-y-5">
          <Section title="1. Acceptance of Terms">
            <p>By accessing or using AetherFlow Enterprise ("the Platform"), you agree to be bound by these Terms of Service ("Terms"). These Terms apply to all users, administrators, and organisations that access the Platform. If you are accessing the Platform on behalf of an organisation, you represent that you have authority to bind that organisation to these Terms.</p>
          </Section>

          <Section title="2. Platform Description">
            <p>AetherFlow Enterprise is a distributed job scheduling and operations platform providing queue management, worker orchestration, job scheduling, real-time analytics, and AI-assisted operational intelligence. The Platform is offered as a software service ("SaaS") and includes API access, web dashboard, and supporting infrastructure.</p>
          </Section>

          <Section title="3. Acceptable Use">
            <p>You agree to use the Platform only for lawful purposes and in accordance with these Terms. You may not:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Use the Platform to process, transmit, or store unlawful, harmful, or malicious content</li>
              <li>Attempt to gain unauthorised access to other users' data or platform systems</li>
              <li>Reverse engineer, decompile, or disassemble the Platform software</li>
              <li>Use the Platform to operate cryptocurrency mining, spam distribution, or automated attack tooling</li>
              <li>Exceed API rate limits or use automated tools to stress-test the Platform without written authorisation</li>
              <li>Resell, sublicense, or redistribute access to the Platform without explicit written agreement</li>
            </ul>
          </Section>

          <Section title="4. User Responsibilities">
            <p><strong className="text-zinc-200">Account Security:</strong> You are responsible for maintaining the confidentiality of your API keys and account credentials. You must promptly notify platform administrators of any unauthorised access.</p>
            <p><strong className="text-zinc-200">Data Accuracy:</strong> You are responsible for the accuracy, legality, and appropriateness of job payloads and data submitted through the Platform.</p>
            <p><strong className="text-zinc-200">Compliance:</strong> You are responsible for ensuring that your use of the Platform complies with all applicable laws and regulations in your jurisdiction.</p>
          </Section>

          <Section title="5. Service Availability">
            <p>AetherFlow Enterprise targets 99.999% platform uptime, excluding scheduled maintenance windows communicated at least 48 hours in advance. Planned maintenance is performed during off-peak hours (02:00–04:00 UTC on Sundays).</p>
            <p>In the event of unplanned outages, AetherFlow will communicate status updates via the System Status page within 15 minutes of incident confirmation and provide root-cause analysis within 72 hours of resolution.</p>
          </Section>

          <Section title="6. Intellectual Property">
            <p>AetherFlow Enterprise software, documentation, user interface, and trademarks are the intellectual property of AetherFlow and its licensors. These Terms do not transfer any ownership rights to you.</p>
            <p>You retain all ownership of data, job payloads, and configurations you submit to the Platform. By submitting data, you grant AetherFlow a limited licence to process and store that data solely for the purpose of providing the Platform services.</p>
          </Section>

          <Section title="7. Limitations of Liability">
            <p>TO THE MAXIMUM EXTENT PERMITTED BY LAW, AETHERFLOW SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR USE OF THE PLATFORM, INCLUDING BUT NOT LIMITED TO LOST PROFITS, DATA LOSS, OR BUSINESS INTERRUPTION.</p>
            <p>AETHERFLOW'S TOTAL LIABILITY FOR ANY CLAIM ARISING UNDER THESE TERMS SHALL NOT EXCEED THE FEES PAID BY YOU TO AETHERFLOW IN THE THREE MONTHS PRECEDING THE CLAIM.</p>
          </Section>

          <Section title="8. Termination">
            <p>Either party may terminate access to the Platform with 30 days written notice. AetherFlow may suspend or terminate access immediately for material breach of these Terms, including but not limited to Acceptable Use violations or non-payment.</p>
            <p>Upon termination, you will have 30 days to export your data. After this period, all data will be permanently deleted in accordance with our data retention policy.</p>
          </Section>

          <Section title="9. Governing Law">
            <p>These Terms are governed by applicable software licence and data protection law. Any disputes arising from these Terms shall be resolved through binding arbitration unless prohibited by applicable law.</p>
          </Section>

          <Section title="10. Changes to Terms">
            <p>We reserve the right to modify these Terms at any time. Material changes will be communicated via email and in-platform notification at least 30 days before the effective date. Continued use of the Platform after the effective date constitutes acceptance of the revised Terms.</p>
          </Section>
        </div>
      </section>
    </PublicLayout>
  );
}
