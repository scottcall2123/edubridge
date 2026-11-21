import clsx from "clsx";
import { LoaderCircle } from "lucide-react";
import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";
export function Button({
  variant = "primary",
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "gold";
}) {
  return (
    <button
      className={clsx("button", `button-${variant}`, className)}
      {...props}
    />
  );
}
export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={clsx("card", className)} {...props} />;
}
export function Tag({
  children,
  simulated = false,
}: {
  children: ReactNode;
  simulated?: boolean;
}) {
  return (
    <span
      className={clsx(
        "inline-flex rounded-full px-3 py-1 text-xs font-semibold",
        simulated ? "bg-gold-50 text-navy" : "bg-sky-50 text-royal",
      )}
    >
      {children}
    </span>
  );
}
export function Avatar({ name }: { name: string }) {
  return (
    <span
      className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-sky-50 font-bold text-navy"
      aria-label={name}
    >
      {name
        .split(" ")
        .slice(0, 2)
        .map((n) => n[0])
        .join("")}
    </span>
  );
}
export function ProgressRing({
  value,
  total = 1,
  label,
}: {
  value: number;
  total?: number;
  label: string;
}) {
  const progress = Math.min(1, Math.max(0, value / Math.max(total, 1)));
  return (
    <svg
      width="96"
      height="96"
      viewBox="0 0 96 96"
      role="img"
      aria-label={label}
    >
      <circle
        cx="48"
        cy="48"
        r="40"
        fill="none"
        stroke="var(--color-sky)"
        strokeWidth="8"
      />
      <circle
        cx="48"
        cy="48"
        r="40"
        fill="none"
        stroke="var(--color-royal)"
        strokeWidth="8"
        strokeDasharray={`${progress * 251.33} 251.33`}
        transform="rotate(-90 48 48)"
      />
      <text x="48" y="53" textAnchor="middle" fill="currentColor">
        {value}/{total}
      </text>
    </svg>
  );
}
export function Spinner({ label }: { label: string }) {
  return (
    <span role="status" className="inline-flex items-center gap-2">
      <LoaderCircle className="animate-spin" />
      {label}
    </span>
  );
}
export function EmptyState({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <Card className="space-y-4 text-center">
      <h2>{title}</h2>
      {children}
    </Card>
  );
}
