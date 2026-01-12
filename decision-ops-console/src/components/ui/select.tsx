"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export function Select({
  className,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm outline-none ring-zinc-900/10 focus:ring-4",
        className,
      )}
      {...props}
    />
  );
}

