import React from "react";

type Item = {
  id: string;
  title: string;
  children: React.ReactNode;
};

export function SettingsAccordion({ items }: { items: Item[] }) {
  const [open, setOpen] = React.useState<string | null>(items.length ? items[0].id : null);

  return (
    <div className="space-y-3">
      {items.map((it) => (
        <div key={it.id} className="border border-white/5 rounded-2xl overflow-hidden bg-white/[0.02]">
          <button
            onClick={() => setOpen(open === it.id ? null : it.id)}
            className="w-full flex items-center justify-between px-4 py-3 text-left"
          >
            <span className="font-semibold text-sm text-zinc-100">{it.title}</span>
            <span className="text-xs text-zinc-400">{open === it.id ? "-" : "+"}</span>
          </button>
          <div className={`transition-all duration-200 ${open === it.id ? "max-h-[1200px] p-4" : "max-h-0 p-0 overflow-hidden"}`}>
            {open === it.id && <div className="pt-2">{it.children}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}

export default SettingsAccordion;
