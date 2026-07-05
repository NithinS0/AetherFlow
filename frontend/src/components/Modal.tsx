import React from "react";
import { X } from "lucide-react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function Modal({ open, onClose, title, children }: ModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-background/80 backdrop-blur-sm cursor-pointer"
        onClick={onClose}
      />
      
      {/* Container */}
      <div className="relative w-full max-w-lg p-6 rounded-2xl opaque-panel border border-white/15 shadow-2xl z-10 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 border-b border-border/40 pb-3">
          <h3 className="text-sm font-bold text-zinc-100">{title}</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {children}
        </div>
      </div>
    </div>
  );
}
