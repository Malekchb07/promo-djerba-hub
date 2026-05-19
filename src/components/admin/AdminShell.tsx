import type { ReactNode } from "react";

export function AdminShell({ title, description, actions, children }: { title: string; description?: string; actions?: ReactNode; children: ReactNode }) {
  return (
    <div className="p-6 md:p-10 max-w-7xl">
      <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-display text-3xl md:text-4xl">{title}</h1>
          {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
        </div>
        {actions && <div className="flex gap-2">{actions}</div>}
      </div>
      {children}
    </div>
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

export const inputCls =
  "w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm outline-none focus:border-gold/50";

export const btnPrimary =
  "inline-flex items-center gap-2 rounded-full bg-gradient-red px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-red disabled:opacity-50";
export const btnGhost =
  "inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm hover:bg-surface-2";
