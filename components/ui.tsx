import Link from "next/link";
import { clsx } from "clsx";

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={clsx("rounded-sm border border-line bg-white p-6", className)}>{children}</div>;
}

export function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return <div className="text-xs tracking-wide text-gold font-medium mb-2">{children}</div>;
}

export function Button({
  children,
  variant = "primary",
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "ghost" }) {
  const styles = {
    primary: "bg-navy text-white hover:bg-navy-light",
    secondary: "bg-white text-navy border border-navy hover:bg-navy/5",
    ghost: "text-navy hover:underline",
  };
  return (
    <button
      className={clsx(
        "text-sm font-medium px-4 py-2.5 rounded-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
        styles[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function LinkButton({
  href,
  children,
  variant = "primary",
  className,
}: {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
}) {
  const styles = {
    primary: "bg-navy text-white hover:bg-navy-light",
    secondary: "bg-white text-navy border border-navy hover:bg-navy/5",
    ghost: "text-navy hover:underline",
  };
  return (
    <Link href={href} className={clsx("inline-block text-sm font-medium px-4 py-2.5 rounded-sm transition-colors", styles[variant], className)}>
      {children}
    </Link>
  );
}

const STATUS_STYLES: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-600",
  SUBMITTED: "bg-blue-50 text-blue-700",
  SCREENING: "bg-blue-50 text-blue-700",
  ASSESSMENT_COMPLETE: "bg-gold-light/40 text-[#7a5f1f]",
  IN_STRUCTURING: "bg-gold-light/40 text-[#7a5f1f]",
  MATCHING: "bg-purple-50 text-purple-700",
  IN_DATA_ROOM: "bg-purple-50 text-purple-700",
  IN_TRANSACTION: "bg-green-50 text-green-700",
  CLOSED: "bg-green-100 text-green-800",
  DECLINED: "bg-red-50 text-red-700",
  AI_DRAFT: "bg-amber-50 text-amber-700",
  PENDING_REVIEW: "bg-amber-50 text-amber-700",
  APPROVED: "bg-green-50 text-green-700",
  REJECTED: "bg-red-50 text-red-700",
  RELEASED: "bg-green-100 text-green-800",
  NOT_STARTED: "bg-gray-100 text-gray-600",
  PENDING: "bg-amber-50 text-amber-700",
  VERIFIED: "bg-green-50 text-green-700",
  FLAGGED: "bg-red-50 text-red-700",
};

export function StatusPill({ status }: { status: string }) {
  return (
    <span className={clsx("inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium", STATUS_STYLES[status] ?? "bg-gray-100 text-gray-600")}>
      {status.replaceAll("_", " ")}
    </span>
  );
}

export function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="text-center py-16 border border-dashed border-line rounded-sm">
      <p className="font-display text-lg text-navy mb-1">{title}</p>
      <p className="text-sm text-foreground/60">{body}</p>
    </div>
  );
}
