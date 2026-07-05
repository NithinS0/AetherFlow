import { NavLink, Link, useLocation } from "react-router-dom";
import { BrandLogo } from "../components/BrandLogo";
import { ArrowRight } from "lucide-react";
import { ThemeToggle } from "../components/ThemeToggle";

interface BreadcrumbItem { label: string; href?: string }

interface PublicLayoutProps {
  children: React.ReactNode;
  breadcrumbs?: BreadcrumbItem[];
}

export function PublicLayout({ children }: PublicLayoutProps) {
  const location = useLocation();
  return (
    <div className="min-h-screen bg-background text-zinc-200 font-sans selection:bg-primary/30 selection:text-white">
      <div className="fixed inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.008)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.008)_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none" />
      <div className="fixed top-0 left-1/4 w-[700px] h-[700px] bg-primary/4 rounded-full blur-[140px] pointer-events-none" />
      <div className="fixed bottom-1/4 right-0 w-[600px] h-[600px] bg-accent/4 rounded-full blur-[140px] pointer-events-none" />

      {/* Sticky nav */}
      <nav className="sticky top-0 z-50 border-b border-white/5 bg-background/92 backdrop-blur-2xl">
        <div className="w-full flex items-center justify-between px-8 md:px-16 xl:px-24 py-3">
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <BrandLogo variant="full" className="h-16 md:h-20 w-auto object-contain" />
          </Link>
          <div className="hidden md:flex items-center gap-5 text-[13px] font-semibold text-zinc-400">
            <NavLink to="/platform/queue-management" className={({ isActive }) => `hover:text-white transition-colors ${isActive || location.pathname.startsWith('/platform') ? 'text-primary font-bold' : ''}`} end>
              Platform
            </NavLink>
            <NavLink to="/docs" className={({ isActive }) => `hover:text-white transition-colors ${isActive ? 'text-primary font-bold' : ''}`}>Docs</NavLink>
            <NavLink to="/api-reference" className={({ isActive }) => `hover:text-white transition-colors ${isActive ? 'text-primary font-bold' : ''}`}>API</NavLink>
            <NavLink to="/status" className={({ isActive }) => `flex items-center gap-1.5 hover:text-white transition-colors ${isActive ? 'text-primary font-bold' : ''}`}>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />Status
            </NavLink>
            <NavLink to="/about" className={({ isActive }) => `hover:text-white transition-colors ${isActive ? 'text-primary font-bold' : ''}`}>About</NavLink>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle size="sm" />
            <Link
              to="/login"
              className="px-4 py-2 bg-primary hover:bg-primary/90 text-white text-[13px] font-bold rounded-xl shadow-royal-glow transition-all flex items-center gap-2 border border-white/10"
            >
              Enter Platform <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </nav>

      <main className="relative z-10">{children}</main>

      <footer className="relative z-10 border-t border-white/5 bg-background/80 py-12 mt-24">
        <div className="w-full px-8 md:px-16 xl:px-24 grid grid-cols-1 md:grid-cols-4 gap-8 mx-auto">
          <div className="col-span-1 flex items-center gap-4">
            <Link to="/">
              <BrandLogo variant="full" className="h-12 md:h-14 w-auto object-contain opacity-70" />
            </Link>
            <p className="text-[12px] text-zinc-600 font-mono">© 2026 AetherFlow Enterprise</p>
          </div>

          <div>
            <h5 className="mb-3 text-sm font-semibold text-white">Platform</h5>
            <ul className="space-y-2 text-sm text-zinc-300">
              <li><Link to="/platform/queue-management" className="hover:text-cyan-300">Queue Management</Link></li>
              <li><Link to="/platform/job-scheduler" className="hover:text-cyan-300">Job Scheduler</Link></li>
              <li><Link to="/platform/workers" className="hover:text-cyan-300">Worker Orchestration</Link></li>
              <li><Link to="/platform/analytics" className="hover:text-cyan-300">Analytics &amp; Monitoring</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="mb-3 text-sm font-semibold text-white">Resources</h5>
            <ul className="space-y-2 text-sm text-zinc-300">
              <li><Link to="/docs" className="hover:text-cyan-300">Documentation</Link></li>
              <li><Link to="/api-reference" className="hover:text-cyan-300">REST API Reference</Link></li>
              <li><Link to="/status" className="hover:text-cyan-300">System Status</Link></li>
              <li><Link to="/releases" className="hover:text-cyan-300">Release Notes</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="mb-3 text-sm font-semibold text-white">Company</h5>
            <ul className="space-y-2 text-sm text-zinc-300">
              <li><Link to="/about" className="hover:text-cyan-300">About AetherFlow</Link></li>
              <li><Link to="/security" className="hover:text-cyan-300">Security</Link></li>
              <li><Link to="/privacy" className="hover:text-cyan-300">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-cyan-300">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}
