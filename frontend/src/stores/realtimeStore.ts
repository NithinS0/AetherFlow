import { create } from "zustand";

interface RealtimeState {
  isConnected: boolean;
  setConnected: (status: boolean) => void;
}

export const useRealtimeStore = create<RealtimeState>((set) => ({
  isConnected: false,
  setConnected: (status) => set({ isConnected: status }),
}));
