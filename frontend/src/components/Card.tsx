import React from "react";

interface CardProps {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  headerAction?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
}

export function Card({
  title,
  subtitle,
  headerAction,
  children,
  className = "",
  hoverable = false,
}: CardProps) {
  return (
    <div
      className={`glass-panel p-6 flex flex-col transition-all duration-300 border border-white/5 shadow-card-glow ${
        hoverable ? "glass-panel-hover" : ""
      } ${className}`}
    >
      {title || subtitle || headerAction ? (
        <div className="flex justify-between items-start mb-6 gap-4 border-b border-white/5 pb-4">
          <div>
            {title && (
              <h3 className="text-[14px] font-extrabold tracking-tight text-white uppercase font-sans">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-[11px] text-zinc-500 font-medium mt-1 leading-normal">
                {subtitle}
              </p>
            )}
          </div>
          {headerAction && <div className="shrink-0">{headerAction}</div>}
        </div>
      ) : null}
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}
