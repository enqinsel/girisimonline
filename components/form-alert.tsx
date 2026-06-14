import { AlertCircle, CheckCircle2, Info } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type FormAlertVariant = "error" | "success" | "info";

type FormAlertProps = {
  children: ReactNode;
  variant?: FormAlertVariant;
};

const styles: Record<FormAlertVariant, string> = {
  error: "border-red-200 bg-red-50 text-red-800",
  success: "border-emerald-200 bg-emerald-50 text-primary-dark",
  info: "border-blue-200 bg-blue-50 text-blue-900",
};

const iconStyles: Record<FormAlertVariant, string> = {
  error: "text-red-600",
  success: "text-primary",
  info: "text-accent",
};

const icons = {
  error: AlertCircle,
  success: CheckCircle2,
  info: Info,
};

export function FormAlert({ children, variant = "info" }: FormAlertProps) {
  const Icon = icons[variant];

  return (
    <div
      className={cn(
        "mt-4 flex gap-3 rounded-md border px-3 py-3 text-sm leading-6",
        styles[variant],
      )}
      role={variant === "error" ? "alert" : "status"}
    >
      <Icon
        className={cn("mt-0.5 h-4 w-4 shrink-0", iconStyles[variant])}
        aria-hidden="true"
      />
      <p>{children}</p>
    </div>
  );
}
