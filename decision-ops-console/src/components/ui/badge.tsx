"use client";

import { cn } from "@/lib/utils";

export function Badge({
  className,
  tone = "zinc",
  children,
}: {
  className?: string;
  tone?: "zinc" | "emerald" | "amber" | "rose" | "sky";
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        tone === "zinc" && "border-zinc-200 bg-zinc-50 text-zinc-800",
        tone === "emerald" && "border-emerald-200 bg-emerald-50 text-emerald-800",
        tone === "amber" && "border-amber-200 bg-amber-50 text-amber-900",
        tone === "rose" && "border-rose-200 bg-rose-50 text-rose-900",
        tone === "sky" && "border-sky-200 bg-sky-50 text-sky-900",
        className,
      )}
    >
      {children}
    </span>
  );
}

