import { useEffect } from "react";
import { motion, type Variants } from "framer-motion";
import { useLocation } from "react-router-dom";

interface BreadcrumbItem { label: string; href?: string }

interface PublicPageProps {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  children: React.ReactNode;
}

export function PublicPage({ title, description, children }: PublicPageProps) {
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
    // Use a transparent wrapper so child pages control their own background.
    // We still apply selection colours and font baseline here.
    <div className="min-h-screen selection:bg-indigo-500/30 selection:text-white font-sans">
      <motion.div key={location.pathname} initial="initial" animate="enter" exit="exit" variants={variants} className="page-motion">
        <div className="relative">
          {children}
        </div>
      </motion.div>
    </div>
  );
}

export default PublicPage;
