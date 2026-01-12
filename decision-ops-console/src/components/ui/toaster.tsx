"use client";

import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToastStore } from "@/stores/toastStore";

export function Toaster() {
  const { toasts, dismiss } = useToastStore();
  return (
    <div className="fixed right-4 top-4 z-50 flex w-[360px] flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            "rounded-lg border bg-white p-3 shadow-sm",
            t.kind === "success" && "border-emerald-200 bg-emerald-50",
            t.kind === "error" && "border-rose-200 bg-rose-50",
            t.kind === "info" && "border-sky-200 bg-sky-50",
          )}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-zinc-900">{t.title}</div>
              {t.message ? <div className="mt-0.5 text-sm text-zinc-700">{t.message}</div> : null}
            </div>
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              className="rounded p-1 text-zinc-600 hover:bg-black/5"
              aria-label="閉じる"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

