import { create } from "zustand";

export type LogsFilters = {
  from: string;
  to: string;
  actor: string;
  action: string;
  caseId: string;
};

const initial: LogsFilters = { from: "", to: "", actor: "", action: "", caseId: "" };

export const useLogsFiltersStore = create<{
  filters: LogsFilters;
  set: (k: keyof LogsFilters, v: string) => void;
  reset: () => void;
}>((set) => ({
  filters: initial,
  set: (k, v) => set((s) => ({ filters: { ...s.filters, [k]: v } })),
  reset: () => set({ filters: initial }),
}));

