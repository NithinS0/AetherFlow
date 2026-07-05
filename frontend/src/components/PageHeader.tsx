import React from "react";
import { ChevronRight } from "lucide-react";

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs: string[];
  actions?: React.ReactNode;
}

export function PageHeader({ title, description, breadcrumbs, actions }: PageHeaderProps) {
  return (
    <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <nav className="flex items-center text-[11px] font-medium text-zinc-500 mb-2">
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={idx}>
              <span className={idx === breadcrumbs.length - 1 ? "text-primary" : "hover:text-zinc-300 cursor-pointer"}>
                {crumb}
              </span>
              {idx < breadcrumbs.length - 1 && <ChevronRight size={12} className="mx-1" />}
            </React.Fragment>
          ))}
        </nav>
        <h1 className="text-2xl font-bold text-white tracking-tight">{title}</h1>
        {description && <p className="text-sm text-zinc-400 mt-1">{description}</p>}
      </div>
      
      {actions && (
        <div className="flex items-center gap-2">
          {actions}
        </div>
      )}
    </div>
  );
}
