import { create } from "zustand";

type CaseListFilters = {
  q: string;
  status: string;
  assignee: string;
  priority: string;
};

type CaseListState = {
  filters: CaseListFilters;
  setFilter: (key: keyof CaseListFilters, value: string) => void;
  reset: () => void;
};

const initial: CaseListFilters = { q: "", status: "", assignee: "", priority: "" };

export const useCaseListStore = create<CaseListState>((set) => ({
  filters: initial,
  setFilter: (key, value) => set((s) => ({ filters: { ...s.filters, [key]: value } })),
  reset: () => set({ filters: initial }),
}));

