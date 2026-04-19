import * as React from "react";
import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  CalendarClock,
  Loader2,
  Repeat,
  type LucideIcon,
} from "lucide-react";

/**
 * Standardized status types used across all cards/lists.
 * Aligned with the platform's color identity:
 *  - success (green)  → Pago, Paga, Quitado, Ativo, Concluído, Recebido
 *  - warning (amber)  → Pendente, Em andamento, Em Andamento, Suspenso, Vence Hoje
 *  - danger  (red)    → Vencida, Cancelado, Não pago
 *  - info    (blue)   → Agendado
 *  - neutral (muted)  → fallback
 *  - accent  (orange) → Recorrente / destaque categórico
 */
export type StatusTone =
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "neutral"
  | "accent";

const toneStyles: Record<StatusTone, string> = {
  success:
    "bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20",
  warning:
    "bg-amber-500/15 text-amber-400 border-amber-500/30 hover:bg-amber-500/20",
  danger:
    "bg-red-500/15 text-red-400 border-red-500/30 hover:bg-red-500/20",
  info:
    "bg-blue-500/15 text-blue-400 border-blue-500/30 hover:bg-blue-500/20",
  neutral:
    "bg-muted/50 text-muted-foreground border-border hover:bg-muted/70",
  accent:
    "bg-orange-500/15 text-orange-400 border-orange-500/30 hover:bg-orange-500/20",
};

interface StatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone: StatusTone;
  icon?: LucideIcon;
  children: React.ReactNode;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  tone,
  icon: Icon,
  children,
  className,
  ...props
}) => {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors whitespace-nowrap",
        toneStyles[tone],
        className,
      )}
      {...props}
    >
      {Icon && <Icon className="w-3 h-3" />}
      {children}
    </span>
  );
};

/**
 * Centralized mapping from a status string to its tone + icon.
 * Keep this in sync whenever new statuses are introduced.
 */
export function getStatusMeta(
  status: string,
): { tone: StatusTone; icon: LucideIcon } {
  const s = status.toLowerCase().trim();
  switch (s) {
    case "pago":
    case "paga":
    case "quitado":
    case "ativo":
    case "concluído":
    case "concluido":
    case "recebido":
    case "verificado":
      return { tone: "success", icon: CheckCircle2 };
    case "pendente":
    case "suspenso":
      return { tone: "warning", icon: Clock };
    case "em andamento":
    case "em_andamento":
      return { tone: "warning", icon: Loader2 };
    case "vence hoje":
      return { tone: "warning", icon: CalendarClock };
    case "vencida":
    case "vencido":
    case "cancelado":
    case "não pago":
    case "nao pago":
      return { tone: "danger", icon: XCircle };
    case "agendado":
      return { tone: "info", icon: CalendarClock };
    case "recorrente":
      return { tone: "accent", icon: Repeat };
    default:
      return { tone: "neutral", icon: AlertTriangle };
  }
}
