import { create } from "zustand";
import { randomId } from "@/lib/utils";

export type ToastKind = "success" | "error" | "info";

export type Toast = {
  id: string;
  kind: ToastKind;
  title: string;
  message?: string;
  createdAt: number;
};

type ToastState = {
  toasts: Toast[];
  push: (t: Omit<Toast, "id" | "createdAt"> & { id?: string; createdAt?: number }) => string;
  dismiss: (id: string) => void;
  clear: () => void;
};

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],
  push: (t) => {
    const id = t.id ?? randomId("toast");
    const createdAt = t.createdAt ?? Date.now();
    set((s) => ({ toasts: [{ id, createdAt, kind: t.kind, title: t.title, message: t.message }, ...s.toasts].slice(0, 5) }));
    // auto dismiss
    setTimeout(() => {
      get().dismiss(id);
    }, 4000);
    return id;
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) })),
  clear: () => set({ toasts: [] }),
}));

