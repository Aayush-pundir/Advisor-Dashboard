import { cn } from "@/lib/utils";
import { Card } from "./card";

export function StatTile({
  label,
  value,
  hint,
  trend,
  className,
}: {
  label: string;
  value: string;
  hint?: string;
  trend?: "up" | "down" | "neutral";
  className?: string;
}) {
  return (
    <Card className={cn("p-5", className)}>
      <p className="text-xs font-medium uppercase tracking-wide text-muted">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold tabular-nums">{value}</p>
      {hint && (
        <p
          className={cn(
            "mt-1 text-xs",
            trend === "up" && "text-emerald-600",
            trend === "down" && "text-rose-600",
            (!trend || trend === "neutral") && "text-muted",
          )}
        >
          {hint}
        </p>
      )}
    </Card>
  );
}
