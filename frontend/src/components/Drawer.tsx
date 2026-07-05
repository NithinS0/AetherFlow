import React from "react";
import { X } from "lucide-react";

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function Drawer({ open, onClose, title, children }: DrawerProps) {
  return (
    <div className={`fixed inset-0 z-50 overflow-hidden transition-all duration-300 ${open ? "pointer-events-auto" : "pointer-events-none"}`}>
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-background/80 backdrop-blur-sm transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />

      {/* Drawer Body Panel */}
      <div className={`absolute top-0 right-0 h-full w-full max-w-md bg-zinc-950/95 border-l border-border shadow-2xl transition-transform duration-300 transform flex flex-col ${
        open ? "translate-x-0" : "translate-x-full"
      }`}>
        {/* Header */}
        <div className="p-6 border-b border-border/60 flex items-center justify-between">
          <h3 className="text-sm font-bold text-zinc-100">{title}</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 min-h-0">
          {children}
        </div>
      </div>
    </div>
  );
}
