import type { ReactNode } from "react";
import { X } from "lucide-react";

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: "md" | "lg";
}) {
  if (!open) return null;
  const width = size === "lg" ? "max-w-2xl" : "max-w-lg";
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className={
          "relative w-full " +
          width +
          " overflow-hidden rounded-2xl border border-border bg-card shadow-2xl animate-in zoom-in-95 duration-150"
        }
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-border px-6 py-4">
          <div>
            <div className="text-[15px] font-bold tracking-tight">{title}</div>
            {description && (
              <div className="mt-1 text-[12px] text-muted-foreground">{description}</div>
            )}
          </div>
          <button
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground hover:bg-secondary"
          >
            <X className="h-4 w-4" strokeWidth={1.75} />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
        {footer && (
          <div className="flex justify-end gap-2 border-t border-border bg-secondary/40 px-6 py-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}


export function Card({
  children,
  className = "",
  ...rest
}: {
  children: ReactNode;
  className?: string;
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={
        "rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)] transition-shadow duration-150 " +
        className
      }
      {...rest}
    >
      {children}
    </div>
  );
}

export function SectionTitle({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <div>
        <h2 className="text-[15px] font-bold tracking-tight">{title}</h2>
        {description && (
          <p className="mt-1 text-[12px] text-muted-foreground">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}

export function Badge({
  tone = "neutral",
  children,
}: {
  tone?: "neutral" | "success" | "warning" | "danger" | "info" | "lime";
  children: ReactNode;
}) {
  const tones: Record<string, string> = {
    neutral: "bg-secondary text-foreground/70",
    success: "bg-[#DCFCE7] text-[#166534]",
    warning: "bg-[#FEF3C7] text-[#92400E]",
    danger: "bg-[#FEE2E2] text-[#991B1B]",
    info: "bg-[#CFFAFE] text-[#155E75]",
    lime: "bg-lime text-lime-foreground",
  };
  return (
    <span
      className={
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold " +
        tones[tone]
      }
    >
      {children}
    </span>
  );
}

export function BtnPrimary({
  children,
  className = "",
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={
        "inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-lime px-4 text-[13px] font-semibold text-lime-foreground shadow-[inset_0_0_0_1px_rgba(27,31,35,0.06)] transition hover:brightness-95 active:brightness-90 disabled:opacity-50 " +
        className
      }
      {...rest}
    >
      {children}
    </button>
  );
}

export function BtnSecondary({
  children,
  className = "",
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={
        "inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 text-[13px] font-medium text-foreground transition hover:bg-secondary " +
        className
      }
      {...rest}
    >
      {children}
    </button>
  );
}

export function BtnDanger({
  children,
  className = "",
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={
        "inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[#FCA5A5] bg-card px-4 text-[13px] font-medium text-[#B91C1C] transition hover:bg-[#FEF2F2] " +
        className
      }
      {...rest}
    >
      {children}
    </button>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        {eyebrow && (
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            {eyebrow}
          </div>
        )}
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {description && (
          <p className="mt-2 max-w-2xl text-[13px] text-muted-foreground">{description}</p>
        )}
      </div>
      {actions && (
        <div className="flex w-full flex-col gap-2 [&>*]:w-full [&>*]:whitespace-nowrap sm:w-auto sm:flex-row sm:items-center sm:[&>*]:w-auto">
          {actions}
        </div>
      )}
    </div>
  );
}

export function Kpi({
  label,
  value,
  unit,
  delta,
  icon,
  tone = "neutral",
}: {
  label: string;
  value: string;
  unit?: string;
  delta?: string;
  icon?: ReactNode;
  tone?: "neutral" | "lime" | "cyan";
}) {
  const iconBg =
    tone === "lime"
      ? "bg-lime text-lime-foreground"
      : tone === "cyan"
        ? "bg-[#CFFAFE] text-[#155E75]"
        : "bg-secondary text-foreground/70";
  return (
    <Card className="hover:shadow-[var(--shadow-hover)]">
      <div className="flex items-start justify-between">
        <div className="text-[12px] font-medium text-muted-foreground">{label}</div>
        {icon && (
          <div className={"grid h-9 w-9 place-items-center rounded-lg " + iconBg}>{icon}</div>
        )}
      </div>
      <div className="mt-4 flex items-baseline gap-1">
        <div className="num text-[28px] leading-none tracking-tight">{value}</div>
        {unit && <div className="text-[12px] font-medium text-muted-foreground">{unit}</div>}
      </div>
      {delta && (
        <div className="mt-3 text-[11px] font-medium text-muted-foreground">
          <span className="text-[#166534]">{delta}</span> · 전월 대비
        </div>
      )}
    </Card>
  );
}

export function Divider() {
  return <div className="h-px w-full bg-border" />;
}
