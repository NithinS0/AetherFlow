import { Link } from "react-router-dom";
import { PublicLayout } from "../../layouts/PublicLayout";
import { Shield, Lock, Users, FileText, Eye, ShieldCheck, ArrowRight, CheckCircle2 } from "lucide-react";

const sections = [
  { icon: <Lock className="w-5 h-5 text-indigo-400" />, title: "Authentication & JWT", desc: "AetherFlow uses JSON Web Tokens (JWT) issued by Supabase Auth for all API authentication. Tokens carry a short expiry (1 hour) with automatic silent refresh via secure httpOnly cookies. All tokens are signed with RS256 asymmetric keys, ensuring tokens cannot be forged even if the public key is known." },
  { icon: <Users className="w-5 h-5 text-cyan-400" />, title: "Role-Based Access Control (RBAC)", desc: "Platform roles — Administrator, Operator, and Viewer — define what operations each user can perform. Role assignments are enforced at both the API layer and the PostgreSQL row-level security layer, preventing privilege escalation at every tier." },
  { icon: <ShieldCheck className="w-5 h-5 text-emerald-400" />, title: "Row-Level Security (RLS)", desc: "All database tables are protected by PostgreSQL Row-Level Security policies. Each query automatically filters data to the authenticated user's organisation scope. Direct database access is impossible without a valid JWT — even for platform administrators." },
  { icon: <Eye className="w-5 h-5 text-violet-400" />, title: "Audit Logging", desc: "Every API action — job creation, queue modification, worker registration, settings change — is recorded to an immutable audit log with actor identity, IP address, timestamp, and payload fingerprint. Audit logs are retained for 365 days and exportable for compliance review." },
  { icon: <Lock className="w-5 h-5 text-amber-400" />, title: "Encryption", desc: "All data in transit is encrypted via TLS 1.3. Data at rest is encrypted using AES-256 managed by Supabase Vault. API keys are stored as bcrypt hashes and never exposed after initial generation." },
  { icon: <Shield className="w-5 h-5 text-rose-400" />, title: "Worker Isolation", desc: "Worker processes execute in isolated environments with no shared memory between concurrent jobs. Each job payload is sanitised before dispatch. Workers have no direct database credentials — all operations are mediated through the authenticated API layer." },
  { icon: <FileText className="w-5 h-5 text-teal-400" />, title: "AI Governance", desc: "OpsGPT and AI agents operate within strict data scoping boundaries. No job payload data is sent to external LLM providers. All AI inference runs on isolated inference endpoints with no cross-tenant data leakage." },
  { icon: <ShieldCheck className="w-5 h-5 text-blue-400" />, title: "Compliance", desc: "AetherFlow architecture is designed to support SOC 2 Type II, ISO 27001, and GDPR compliance requirements. Role separation, audit trails, encryption, and data residency controls address the major compliance framework requirements." },
];

export function SecurityPage() {
  return (
    <PublicLayout breadcrumbs={[{ label: "Company" }, { label: "Security" }]}>
      <section className="max-w-5xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-400/20 bg-emerald-400/5 text-[11px] font-bold uppercase tracking-widest text-emerald-300 mb-6">
          <Shield className="w-3.5 h-3.5" /> Security
        </div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-5">
          Enterprise Security<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">Built In, Not Bolted On</span>
        </h1>
        <p className="text-[16px] text-zinc-400 max-w-2xl mx-auto leading-relaxed mb-10">
          AetherFlow Enterprise was designed with a security-first architecture. Every layer of the platform enforces authentication, authorisation, encryption, and immutable audit trails.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          {["SOC 2 Type II Ready", "ISO 27001 Aligned", "GDPR Compliant", "TLS 1.3", "AES-256 At Rest"].map((badge, i) => (
            <span key={i} className="text-[12px] font-bold border border-emerald-400/20 text-emerald-300 bg-emerald-400/5 rounded-full px-4 py-1.5">{badge}</span>
          ))}
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 mb-20">
        <div className="space-y-4">
          {sections.map((s, i) => (
            <div key={i} className="glass-panel border border-white/5 rounded-2xl p-6 flex gap-5">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0 mt-0.5">{s.icon}</div>
              <div>
                <h3 className="text-[15px] font-extrabold text-white mb-2">{s.title}</h3>
                <p className="text-[14px] text-zinc-400 leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 mb-16">
        <div className="glass-panel border border-white/10 rounded-2xl p-8">
          <h2 className="text-xl font-extrabold text-white mb-6">Security Checklist</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              "JWT RS256 asymmetric signing",
              "Auto-rotating short-lived access tokens",
              "Bcrypt API key hashing",
              "PostgreSQL Row-Level Security on all tables",
              "Multi-factor authentication support",
              "IP allowlisting for API key scopes",
              "Immutable 365-day audit log retention",
              "Zero plaintext credentials in environment",
              "TLS 1.3 for all connections",
              "AES-256 encryption at rest",
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 text-[14px] text-zinc-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-6 mb-20 text-center">
        <div className="glass-panel border border-primary/20 rounded-2xl p-10">
          <h2 className="text-2xl font-extrabold text-white mb-3">Review the audit logs</h2>
          <p className="text-[14px] text-zinc-400 mb-6">All platform events are recorded with full actor attribution. Access the audit log from the Security section of your dashboard.</p>
          <Link to="/login" className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-white font-bold rounded-xl shadow-royal-glow">
            Open Security Audit <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </PublicLayout>
  );
}
