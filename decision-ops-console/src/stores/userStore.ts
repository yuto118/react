import { create } from "zustand";

type UserState = {
  actor: string;
  setActor: (actor: string) => void;
};

export const useUserStore = create<UserState>((set) => ({
  actor: "demo_user",
  setActor: (actor) => set({ actor }),
}));

