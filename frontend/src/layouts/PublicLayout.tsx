import { NavLink, Link, useLocation } from "react-router-dom";
import { BrandLogo } from "../components/BrandLogo";
import { ArrowRight, Server, Terminal, Cpu, BarChart3, FileText, Code, Globe, Sparkles, Users, Shield } from "lucide-react";

interface BreadcrumbItem { label: string; href?: string }

interface PublicLayoutProps {
  children: React.ReactNode;
  breadcrumbs?: BreadcrumbItem[];
}

export function PublicLayout({ children, breadcrumbs }: PublicLayoutProps) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-[#03050c] text-zinc-300 font-sans selection:bg-indigo-500/30 selection:text-white">
      {/* Ambient glows */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[600px] rounded-full bg-indigo-600/6 blur-[160px]" />
        <div className="absolute top-1/2 -right-20 w-[500px] h-[500px] rounded-full bg-cyan-500/4 blur-[140px]" />
      </div>

      {/* Grid pattern */}
      <div className="pointer-events-none fixed inset-0 z-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:56px_56px]" />

      {/* ── Sticky nav ── */}
      <nav className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#03050c]/80 backdrop-blur-2xl">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between px-8 md:px-12 xl:px-16 h-[72px]">
          {/* Logo */}
          <Link to="/" className="flex items-center shrink-0">
            <BrandLogo variant="full" className="h-14 w-auto object-contain" />
          </Link>

          {/* Center nav */}
          <div className="hidden md:flex items-center gap-1">
            {[
              { label: "Platform", to: "/platform/queue-management", prefix: "/platform" },
              { label: "Docs", to: "/docs" },
              { label: "API", to: "/api-reference" },
              { label: "Status", to: "/status", dot: true },
              { label: "About", to: "/about" },
            ].map(({ label, to, prefix, dot }) => {
              const isActive = prefix
                ? location.pathname.startsWith(prefix)
                : location.pathname === to;
              return (
                <NavLink
                  key={to}
                  to={to}
                  className={`flex items-center gap-1.5 px-4 py-2 text-[13.5px] font-semibold rounded-lg transition-all duration-200
                    ${isActive
                      ? "text-white bg-white/[0.06]"
                      : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
                    }`}
                >
                  {dot && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                  {label}
                </NavLink>
              );
            })}
          </div>

          {/* CTA */}
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-[13.5px] font-semibold text-zinc-400 hover:text-white transition-colors hidden sm:block">
              Sign In
            </Link>
            <Link
              to="/login"
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 text-white text-[13.5px] font-bold rounded-xl
                hover:from-indigo-500 hover:to-blue-500 transition-all duration-200 shadow-[0_0_20px_rgba(99,102,241,0.3)]
                hover:shadow-[0_0_30px_rgba(99,102,241,0.45)] hover:-translate-y-px"
            >
              Enter Platform <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="relative z-10">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <div className="max-w-[1400px] mx-auto px-8 md:px-12 xl:px-16 py-4 text-[13px] text-zinc-500 flex items-center gap-2">
            <Link to="/" className="hover:text-zinc-300 transition-colors">Home</Link>
            <span className="text-zinc-600">›</span>
            {breadcrumbs.map((b, i) => (
              <span key={i} className="inline-flex items-center gap-2">
                {i > 0 && <span className="text-zinc-600">›</span>}
                {b.href ? <Link to={b.href} className="hover:text-zinc-300 transition-colors">{b.label}</Link> : <span className="text-zinc-300 font-medium">{b.label}</span>}
              </span>
            ))}
          </div>
        )}
        {children}
      </main>

      {/* ── Footer ── */}
      <footer className="relative z-10 w-full border-t border-white/[0.06] bg-[#03050c] pt-16 pb-10 mt-20">
        <div className="max-w-[1400px] mx-auto px-8 md:px-12 xl:px-16">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-12 mb-12">
            {/* Brand */}
            <div className="space-y-4">
              <Link to="/">
                <BrandLogo variant="full" className="h-[60px] w-auto object-contain" />
              </Link>
              <p className="text-[13px] text-zinc-500 leading-relaxed max-w-[240px]">
                Enterprise AI-Native Distributed Job Scheduling &amp; Operations Platform.
              </p>
              <div className="flex items-center gap-2 text-[11px] font-mono text-zinc-600">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                All systems operational
              </div>
            </div>

            {/* Platform */}
            <div>
              <h5 className="mb-5 text-[11px] font-black uppercase tracking-[0.14em] text-zinc-400">Platform</h5>
              <ul className="space-y-3">
                {[
                  { label: "Queue Management", to: "/platform/queue-management", icon: <Server className="h-3.5 w-3.5" /> },
                  { label: "Job Scheduler", to: "/platform/job-scheduler", icon: <Terminal className="h-3.5 w-3.5" /> },
                  { label: "Worker Orchestration", to: "/platform/workers", icon: <Cpu className="h-3.5 w-3.5" /> },
                  { label: "Analytics & Monitoring", to: "/platform/analytics", icon: <BarChart3 className="h-3.5 w-3.5" /> },
                ].map(({ label, to, icon }) => (
                  <li key={to}>
                    <Link to={to} className="flex items-center gap-2.5 text-[13px] text-zinc-500 hover:text-zinc-200 transition-colors group">
                      <span className="text-zinc-600 group-hover:text-zinc-400 transition-colors">{icon}</span>
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h5 className="mb-5 text-[11px] font-black uppercase tracking-[0.14em] text-zinc-400">Resources</h5>
              <ul className="space-y-3">
                {[
                  { label: "Documentation", to: "/docs", icon: <FileText className="h-3.5 w-3.5" /> },
                  { label: "REST API Reference", to: "/api-reference", icon: <Code className="h-3.5 w-3.5" /> },
                  { label: "System Status", to: "/status", icon: <Globe className="h-3.5 w-3.5" /> },
                  { label: "Release Notes", to: "/releases", icon: <Sparkles className="h-3.5 w-3.5" /> },
                ].map(({ label, to, icon }) => (
                  <li key={to}>
                    <Link to={to} className="flex items-center gap-2.5 text-[13px] text-zinc-500 hover:text-zinc-200 transition-colors group">
                      <span className="text-zinc-600 group-hover:text-zinc-400 transition-colors">{icon}</span>
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h5 className="mb-5 text-[11px] font-black uppercase tracking-[0.14em] text-zinc-400">Company</h5>
              <ul className="space-y-3">
                {[
                  { label: "About AetherFlow", to: "/about", icon: <Users className="h-3.5 w-3.5" /> },
                  { label: "Security", to: "/security", icon: <Shield className="h-3.5 w-3.5" /> },
                  { label: "Privacy Policy", to: "/privacy", icon: <FileText className="h-3.5 w-3.5" /> },
                  { label: "Terms of Service", to: "/terms", icon: <FileText className="h-3.5 w-3.5" /> },
                ].map(({ label, to, icon }) => (
                  <li key={to}>
                    <Link to={to} className="flex items-center gap-2.5 text-[13px] text-zinc-500 hover:text-zinc-200 transition-colors group">
                      <span className="text-zinc-600 group-hover:text-zinc-400 transition-colors">{icon}</span>
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t border-white/[0.05]">
            <p className="text-[12px] text-zinc-600 font-medium">
              &copy; 2026 AetherFlow Enterprise, Inc. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-[12px] text-zinc-600">
              <Link to="/privacy" className="hover:text-zinc-400 transition-colors">Privacy</Link>
              <Link to="/terms" className="hover:text-zinc-400 transition-colors">Terms</Link>
              <Link to="/security" className="hover:text-zinc-400 transition-colors">Security</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
