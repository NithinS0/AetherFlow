import React from "react";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "success" | "warning" | "danger" | "info" | "neutral";
  className?: string;
}

export function Badge({
  children,
  variant = "neutral",
  className = "",
}: BadgeProps) {
  const styles = {
    neutral: "bg-zinc-800/40 border-zinc-700/30 text-zinc-400",
    info: "bg-primary/10 border-primary/10 text-primary",
    success: "bg-emerald-500/10 border-emerald-500/10 text-emerald-400",
    warning: "bg-amber-500/10 border-amber-500/10 text-amber-400",
    danger: "bg-rose-500/10 border-rose-500/10 text-rose-400",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase tracking-wider border ${styles[variant]} ${className}`}
    >
      <span className={`w-1 h-1 rounded-full ${
        variant === "neutral" ? "bg-zinc-400" :
        variant === "info" ? "bg-primary" :
        variant === "success" ? "bg-emerald-450" :
        variant === "warning" ? "bg-amber-450" :
        "bg-rose-450"
      }`} />
      {children}
    </span>
  );
}
