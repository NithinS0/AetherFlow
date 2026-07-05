import React from "react";
import { SkeletonLoader } from "./States";

interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => React.ReactNode;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyState?: React.ReactNode;
}

export function Table<T>({
  columns,
  data,
  loading = false,
  emptyState,
}: TableProps<T>) {
  if (loading) {
    return <SkeletonLoader count={5} />;
  }

  if (data.length === 0) {
    return (
      <div className="p-12 text-center border border-border/80 rounded-2xl bg-zinc-900/10 text-zinc-500 font-medium">
        {emptyState || "No records available."}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto w-full border border-white/5 rounded-2xl bg-[var(--bg-elevated)]/25 shadow-inner">
      <table className="w-full text-left text-xs border-collapse">
        <thead>
          <tr className="border-b border-white/5 text-zinc-500 font-bold uppercase tracking-wider bg-[var(--bg-elevated)]/80 backdrop-blur-md sticky top-0 z-10">
            {columns.map((col) => (
              <th key={col.key} className="p-4 font-semibold text-[10px] tracking-widest text-zinc-400">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {data.map((row: any, idx: number) => (
            <tr key={row.id || idx} className="text-zinc-300 hover:bg-white/[0.02] transition-colors duration-150">
              {columns.map((col) => (
                <td key={col.key} className="p-4 align-middle text-[12px] font-sans text-zinc-300 font-medium">
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
