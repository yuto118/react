"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export function Dialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
}: {
  open: boolean;
  onOpenChange: (next: boolean) => void;
  title: string;
  description?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
}) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/30"
        onClick={() => onOpenChange(false)}
        aria-hidden
      />
      <div className="absolute inset-0 flex items-center justify-center p-6">
        <div className={cn("w-full max-w-lg rounded-xl border bg-white shadow-lg")}>
          <div className="flex items-start justify-between gap-3 border-b px-4 py-3">
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-zinc-900">{title}</div>
              {description ? (
                <div className="mt-1 text-sm text-zinc-600">{description}</div>
              ) : null}
            </div>
            <button
              type="button"
              className="rounded p-1 text-zinc-600 hover:bg-black/5"
              onClick={() => onOpenChange(false)}
              aria-label="閉じる"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          {children ? <div className="px-4 py-3">{children}</div> : null}
          {footer ? <div className="border-t px-4 py-3">{footer}</div> : null}
        </div>
      </div>
    </div>,
    document.body,
  );
}

