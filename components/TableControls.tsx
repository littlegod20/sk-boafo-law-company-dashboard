"use client";

import { Icon } from "./Icons";

// ---------------------------------------------------------------------------
// Pagination
// ---------------------------------------------------------------------------

interface PaginationProps {
  page: number;
  total: number;
  pageSize: number;
  onChange: (p: number) => void;
}

export function Pagination({ page, total, pageSize, onChange }: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end   = Math.min(page * pageSize, total);

  const pages: (number | "…")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3) pages.push("…");
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i);
    if (page < totalPages - 2) pages.push("…");
    pages.push(totalPages);
  }

  return (
    <div className="flex items-center justify-between px-5 py-3.5 border-t border-[#F1F5F9]">
      <p className="text-[12px] text-[#94A3B8]">
        {total === 0 ? "No results" : `${start}–${end} of ${total}`}
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onChange(page - 1)}
          disabled={page <= 1}
          className="p-1.5 rounded-lg text-[#94A3B8] hover:bg-[#F1F5F9] hover:text-[#0B2349] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <Icon name="chevron-left" className="w-4 h-4" strokeWidth={2} />
        </button>
        {pages.map((p, i) =>
          p === "…" ? (
            <span key={`e${i}`} className="px-1 text-[12px] text-[#94A3B8]">…</span>
          ) : (
            <button
              key={p}
              onClick={() => onChange(p as number)}
              className="min-w-[28px] h-7 rounded-lg text-[12px] font-medium transition-colors"
              style={p === page ? { background: "#0B2349", color: "white" } : { color: "#64748B" }}
            >
              {p}
            </button>
          )
        )}
        <button
          onClick={() => onChange(page + 1)}
          disabled={page >= totalPages}
          className="p-1.5 rounded-lg text-[#94A3B8] hover:bg-[#F1F5F9] hover:text-[#0B2349] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <Icon name="chevron-right" className="w-4 h-4" strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// BulkToolbar
// ---------------------------------------------------------------------------

interface BulkToolbarProps {
  count: number;
  onClear: () => void;
  children: React.ReactNode;
}

export function BulkToolbar({ count, onClear, children }: BulkToolbarProps) {
  return (
    <div
      className="flex items-center gap-3 rounded-xl px-5 py-3"
      style={{ background: "#0B2349", boxShadow: "0 4px 16px rgba(11,35,73,0.2)" }}
    >
      <div
        className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0"
        style={{ background: "#C9A227", color: "#0B2349" }}
      >
        {count > 99 ? "99+" : count}
      </div>
      <span className="text-white text-[13px] font-medium whitespace-nowrap">
        {count === 1 ? "1 item selected" : `${count} items selected`}
      </span>
      <div className="flex-1" />
      <div className="flex items-center gap-2 flex-wrap">{children}</div>
      <button
        onClick={onClear}
        className="ml-1 p-1.5 rounded-lg hover:bg-white/10 transition-colors"
        style={{ color: "rgba(255,255,255,0.5)" }}
        title="Clear selection"
      >
        <Icon name="x" className="w-4 h-4" strokeWidth={2} />
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Toolbar action button
// ---------------------------------------------------------------------------

type TBtnVariant = "default" | "danger" | "success" | "warning";

const TBTN_STYLE: Record<TBtnVariant, string> = {
  default: "bg-white/10 hover:bg-white/20 text-white",
  success: "bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300",
  danger:  "bg-red-500/20   hover:bg-red-500/30   text-red-300",
  warning: "bg-amber-500/20 hover:bg-amber-500/30 text-amber-300",
};

export function TBtn({
  children,
  onClick,
  variant = "default",
}: {
  children: React.ReactNode;
  onClick: () => void;
  variant?: TBtnVariant;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-medium transition-colors whitespace-nowrap ${TBTN_STYLE[variant]}`}
    >
      {children}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Checkbox (styled consistently)
// ---------------------------------------------------------------------------

export function Checkbox({
  checked,
  indeterminate = false,
  onChange,
  onClick,
}: {
  checked: boolean;
  indeterminate?: boolean;
  onChange: () => void;
  onClick?: (e: React.MouseEvent) => void;
}) {
  return (
    <input
      type="checkbox"
      checked={checked}
      ref={(el) => { if (el) el.indeterminate = indeterminate; }}
      onChange={onChange}
      onClick={onClick}
      className="w-4 h-4 rounded border-[#CBD5E1] cursor-pointer flex-shrink-0"
      style={{ accentColor: "#0B2349" }}
    />
  );
}
