import React from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";
import { useStore } from "../stores/store";

export function Breadcrumbs() {
  const location = useLocation();
  const activeOrg = useStore((state) => state.activeOrg);
  
  const pathnames = location.pathname.split("/").filter((x) => x);

  const getBreadcrumbName = (path: string) => {
    switch (path) {
      case "organizations":
        return "Organizations";
      case "teams":
        return "Teams";
      case "projects":
        return "Projects";
      case "notifications":
        return "Notifications";
      case "audit-logs":
        return "Security Audit Logs";
      case "settings":
        return "Settings";
      default:
        return path.charAt(0).toUpperCase() + path.slice(1);
    }
  };

  return (
    <nav className="flex items-center gap-2 text-xs font-semibold text-zinc-500 font-mono select-none">
      {/* Home / Org context */}
      <Link to="/" className="hover:text-zinc-300 flex items-center gap-1.5 transition-colors">
        <Home className="w-3.5 h-3.5" />
        <span>{activeOrg ? activeOrg.name : "AetherFlow"}</span>
      </Link>

      {pathnames.map((value, index) => {
        const to = `/${pathnames.slice(0, index + 1).join("/")}`;
        const isLast = index === pathnames.length - 1;
        const name = getBreadcrumbName(value);

        return (
          <React.Fragment key={to}>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-700 shrink-0" />
            {isLast ? (
              <span className="text-zinc-300 font-bold truncate max-w-[150px]">
                {name}
              </span>
            ) : (
              <Link to={to} className="hover:text-zinc-300 transition-colors truncate max-w-[150px]">
                {name}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
