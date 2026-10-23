import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  status?: "PENDING" | "APPROVED" | "REJECTED" | string;
}

export const Badge: React.FC<BadgeProps> = ({
  status,
  className,
  children,
  ...props
}) => {
  let badgeStyles = "bg-slate-100 text-slate-700 border-slate-200";

  if (status === "PENDING") {
    badgeStyles = "bg-amber-50 text-amber-700 border-amber-200";
  } else if (status === "APPROVED") {
    badgeStyles = "bg-emerald-50 text-emerald-700 border-emerald-200";
  } else if (status === "REJECTED") {
    badgeStyles = "bg-rose-50 text-rose-700 border-rose-200";
  }

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border",
        badgeStyles,
        className
      )}
      {...props}
    >
      {children || status}
    </span>
  );
};
