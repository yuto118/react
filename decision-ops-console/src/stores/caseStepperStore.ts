import { create } from "zustand";

type StepperState = {
  currentIndexByCaseId: Record<string, number>;
  setCurrentIndex: (caseId: string, index: number) => void;
  resetCase: (caseId: string) => void;
};

export const useCaseStepperStore = create<StepperState>((set) => ({
  currentIndexByCaseId: {},
  setCurrentIndex: (caseId, index) =>
    set((s) => ({ currentIndexByCaseId: { ...s.currentIndexByCaseId, [caseId]: index } })),
  resetCase: (caseId) =>
    set((s) => {
      const next = { ...s.currentIndexByCaseId };
      delete next[caseId];
      return { currentIndexByCaseId: next };
    }),
}));

