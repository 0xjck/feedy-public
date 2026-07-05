import type { ReactNode } from "react";

export function Badge({ children, tone = "default" }: { children: ReactNode; tone?: "default" | "dark" | "green" | "amber" }) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}
