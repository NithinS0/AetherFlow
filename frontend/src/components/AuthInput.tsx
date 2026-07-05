import React from "react";

interface AuthInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "className"> {
  icon: React.ReactNode;
  label: string;
}

export function AuthInput({ icon, label, id, ...inputProps }: AuthInputProps) {
  const inputId = id ?? label.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="space-y-1.5">
      <label
        htmlFor={inputId}
        className="block text-zinc-400 font-bold uppercase tracking-wider text-[10px] ml-1"
      >
        {label}
      </label>
      <div className="auth-input group flex items-center gap-0 rounded-xl border border-border bg-[var(--input-bg)] backdrop-blur-xl shadow-[inset_0_2px_4px_rgba(0,0,0,0.12)] transition-all duration-300 hover:border-border/80 focus-within:border-primary/50 focus-within:bg-primary/[0.06] focus-within:shadow-[0_0_25px_rgba(99,102,241,0.2),inset_0_0_10px_rgba(99,102,241,0.05)]">
        <span className="flex shrink-0 items-center justify-center w-11 h-11 text-zinc-500 group-focus-within:text-primary transition-colors duration-300 pointer-events-none">
          {icon}
        </span>
        <input
          id={inputId}
          {...inputProps}
          className="auth-input-field flex-1 min-w-0 h-11 pr-4 bg-transparent border-0 outline-none text-sm text-[var(--input-text)] placeholder:text-[var(--input-placeholder)] font-sans"
        />
      </div>
    </div>
  );
}
