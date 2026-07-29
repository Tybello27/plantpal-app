import { motion, AnimatePresence } from "framer-motion";
import { Droplets, Sprout, Scissors, Flower2, X, Leaf, CheckCircle2, Info, AlertTriangle } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "../utils/cn";
import type { CareType, Health } from "../types";
import { useStore } from "../lib/store";

/* ---------------- care type visuals ---------------- */

export const CARE_STYLE: Record<CareType, { icon: typeof Droplets; text: string; bg: string; ring: string; dot: string }> = {
  water: { icon: Droplets, text: "text-fern-600 dark:text-fern-400", bg: "bg-fern-500/12", ring: "#10B981", dot: "bg-fern-500" },
  fertilize: { icon: Sprout, text: "text-lime-700 dark:text-lime-400", bg: "bg-lime-500/14", ring: "#84CC16", dot: "bg-lime-500" },
  prune: { icon: Scissors, text: "text-amber-700 dark:text-amber-400", bg: "bg-amber-500/14", ring: "#F59E0B", dot: "bg-amber-500" },
  repot: { icon: Flower2, text: "text-teal-700 dark:text-teal-400", bg: "bg-teal-500/14", ring: "#14B8A6", dot: "bg-teal-500" },
};

export function TaskIcon({ type, className, boxed = true }: { type: CareType; className?: string; boxed?: boolean }) {
  const s = CARE_STYLE[type];
  const Icon = s.icon;
  return (
    <span className={cn("inline-flex items-center justify-center rounded-xl", s.bg, s.text, boxed && "size-10", className)}>
      <Icon className={boxed ? "size-5" : "size-4"} strokeWidth={2.2} />
    </span>
  );
}

/* ---------------- health ---------------- */

const HEALTH_STYLE: Record<Health, { label: string; cls: string; dot: string }> = {
  thriving: { label: "Thriving", cls: "bg-lime-500/15 text-lime-700 dark:text-lime-300", dot: "bg-lime-500" },
  healthy: { label: "Healthy", cls: "bg-fern-500/15 text-fern-700 dark:text-fern-300", dot: "bg-fern-500" },
  attention: { label: "Needs attention", cls: "bg-amber-500/15 text-amber-700 dark:text-amber-300", dot: "bg-amber-500" },
  unhappy: { label: "Unhappy", cls: "bg-rose-500/15 text-rose-700 dark:text-rose-300", dot: "bg-rose-500" },
};

export function HealthBadge({ health, className }: { health: Health; className?: string }) {
  const s = HEALTH_STYLE[health];
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold", s.cls, className)}>
      <span className={cn("size-1.5 rounded-full", s.dot)} />
      {s.label}
    </span>
  );
}

export function HealthDot({ health }: { health: Health }) {
  return <span className={cn("size-2.5 rounded-full ring-2 ring-white dark:ring-bark-800", HEALTH_STYLE[health].dot)} />;
}

/* ---------------- progress ring ---------------- */

export function ProgressRing({
  value,
  size = 72,
  stroke = 7,
  color = "#10B981",
  children,
}: {
  value: number; // 0..1
  size?: number;
  stroke?: number;
  color?: string;
  children?: ReactNode;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(1, value));
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} className="stroke-bark-900/8 dark:stroke-cream/10" />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c * (1 - clamped) }}
          transition={{ duration: 0.9, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">{children}</div>
    </div>
  );
}

/* ---------------- section header ---------------- */

export function SectionHead({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return (
    <div className="mb-3 flex items-end justify-between">
      <h2 className="font-display text-lg font-semibold tracking-tight text-bark-900 dark:text-cream">{title}</h2>
      {action && (
        <button onClick={onAction} className="text-sm font-bold text-fern-600 transition-colors hover:text-fern-700 dark:text-fern-400">
          {action}
        </button>
      )}
    </div>
  );
}

/* ---------------- card ---------------- */

export function Card({ className, children, onClick }: { className?: string; children: ReactNode; onClick?: () => void }) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "rounded-3xl border border-bark-900/6 bg-white shadow-soft dark:border-cream/8 dark:bg-bark-800",
        onClick && "cursor-pointer transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift",
        className
      )}
    >
      {children}
    </div>
  );
}

/* ---------------- empty state ---------------- */

export function EmptyState({
  title,
  body,
  actionLabel,
  onAction,
  icon,
}: {
  title: string;
  body: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center px-6 py-14 text-center"
    >
      <div className="relative mb-5">
        <div className="absolute inset-0 -z-10 scale-150 rounded-full bg-fern-500/10 blur-2xl" />
        <div className="flex size-20 items-center justify-center rounded-[28px] border border-fern-500/20 bg-fern-500/10 text-fern-600 dark:text-fern-400">
          {icon ?? <Leaf className="size-9 animate-sway" strokeWidth={1.8} />}
        </div>
      </div>
      <h3 className="font-display text-xl font-semibold text-bark-900 dark:text-cream">{title}</h3>
      <p className="mt-2 max-w-xs text-sm leading-relaxed text-bark-400 dark:text-bark-400">{body}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-6 rounded-full bg-fern-600 px-6 py-3 text-sm font-bold text-white shadow-glow transition-transform active:scale-95"
        >
          {actionLabel}
        </button>
      )}
    </motion.div>
  );
}

/* ---------------- bottom sheet / modal ---------------- */

export function Sheet({
  open,
  onClose,
  children,
  wide,
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-bark-950/45 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            initial={{ y: "100%", opacity: 0.6, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 30, stiffness: 320 }}
            className={cn(
              "relative flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-[32px] border border-bark-900/8 bg-cream shadow-lift dark:border-cream/10 dark:bg-bark-900 sm:rounded-[32px]",
              wide ? "sm:max-w-2xl" : "sm:max-w-md"
            )}
          >
            <div className="flex justify-center pt-3 sm:hidden">
              <div className="h-1.5 w-12 rounded-full bg-bark-900/15 dark:bg-cream/15" />
            </div>
            <button
              onClick={onClose}
              aria-label="Close"
              className="absolute right-4 top-4 z-10 flex size-9 items-center justify-center rounded-full bg-bark-900/6 text-bark-500 transition-colors hover:bg-bark-900/10 dark:bg-cream/10 dark:text-cream/70"
            >
              <X className="size-4.5" />
            </button>
            <div className="no-scrollbar flex-1 overflow-y-auto overscroll-contain px-5 pb-8 pt-5 sm:px-7">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ---------------- toasts ---------------- */

export function ToastHost() {
  const { toasts } = useStore();
  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-[70] flex flex-col items-center gap-2 px-4">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            layout
            initial={{ opacity: 0, y: -24, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.92 }}
            transition={{ type: "spring", damping: 24, stiffness: 380 }}
            className="pointer-events-auto flex items-center gap-2.5 rounded-full border border-bark-900/8 bg-white/95 py-2.5 pl-3 pr-5 shadow-lift backdrop-blur dark:border-cream/10 dark:bg-bark-800/95"
          >
            {t.kind === "success" && <CheckCircle2 className="size-5 text-fern-600 dark:text-fern-400" />}
            {t.kind === "info" && <Info className="size-5 text-sky-600 dark:text-sky-400" />}
            {t.kind === "warn" && <AlertTriangle className="size-5 text-amber-600 dark:text-amber-400" />}
            <span className="text-sm font-bold text-bark-800 dark:text-cream">{t.msg}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
