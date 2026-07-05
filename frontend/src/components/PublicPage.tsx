import { useEffect } from "react";
import { motion, type Variants } from "framer-motion";
import { useLocation, Link } from "react-router-dom";

interface BreadcrumbItem { label: string; href?: string }

interface PublicPageProps {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  children: React.ReactNode;
}

export function PublicPage({ title, description, breadcrumbs = [], children }: PublicPageProps) {
  const location = useLocation();

  useEffect(() => {
    // update meta title & description
    if (title) document.title = `${title} — AetherFlow`;
    if (description) {
      let el = document.querySelector('meta[name="description"]');
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute('name', 'description');
        document.head.appendChild(el);
      }
      el.setAttribute('content', description);
    }
  }, [title, description, location.pathname]);

  const variants: Variants = {
    initial: { opacity: 0, y: 10, scale: 0.995 },
    enter: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] }
    },
    exit: {
      opacity: 0,
      y: -10,
      scale: 0.995,
      transition: { duration: 0.25, ease: [0.4, 0, 0.2, 1] }
    },
  };

  return (
    <main className="dark bg-background text-zinc-300 min-h-screen selection:bg-primary/30 selection:text-white font-sans">
      <motion.div key={location.pathname} initial="initial" animate="enter" exit="exit" variants={variants} className="page-motion">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <div className="max-w-7xl mx-auto px-6 py-3 text-sm text-zinc-500 relative z-20">
            {breadcrumbs.map((b, i) => (
              <span key={i} className="inline-flex items-center gap-2">
                {i > 0 && <span className="text-zinc-400">›</span>}
                {b.href ? <Link to={b.href} className="hover:text-zinc-700">{b.label}</Link> : <span className="text-zinc-700 font-semibold">{b.label}</span>}
              </span>
            ))}
          </div>
        )}

        <div className="relative">
          {children}
        </div>
      </motion.div>
    </main>
  );
}

export default PublicPage;
