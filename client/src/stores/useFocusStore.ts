import { create } from "zustand";
import type { Task, EnergyLevel } from "../types";

interface FocusState {
  activeTask: Task | null;
  isFocusModeActive: boolean;
  isTimerRunning: boolean;
  durationSeconds: number; // Selected total duration (e.g. 1500 for 25 mins)
  elapsedSeconds: number;
  energyMode: EnergyLevel;
  
  startFocus: (task?: Task | null, customDurationMinutes?: number) => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  tickTimer: () => void;
  stopFocus: () => void;
  setEnergyMode: (energy: EnergyLevel) => void;
}

export const useFocusStore = create<FocusState>((set, get) => ({
  activeTask: null,
  isFocusModeActive: false,
  isTimerRunning: false,
  durationSeconds: 25 * 60,
  elapsedSeconds: 0,
  energyMode: "MEDIUM",

  startFocus: (task = null, customDurationMinutes = 25) => {
    set({
      activeTask: task,
      isFocusModeActive: true,
      isTimerRunning: true,
      durationSeconds: customDurationMinutes * 60,
      elapsedSeconds: 0,
    });
  },

  pauseTimer: () => set({ isTimerRunning: false }),
  resumeTimer: () => set({ isTimerRunning: true }),

  tickTimer: () => {
    const { elapsedSeconds, durationSeconds, isTimerRunning } = get();
    if (!isTimerRunning) return;

    if (elapsedSeconds + 1 >= durationSeconds) {
      set({ elapsedSeconds: durationSeconds, isTimerRunning: false });
    } else {
      set({ elapsedSeconds: elapsedSeconds + 1 });
    }
  },

  stopFocus: () => {
    set({
      isFocusModeActive: false,
      isTimerRunning: false,
      activeTask: null,
      elapsedSeconds: 0,
    });
  },

  setEnergyMode: (energyMode) => set({ energyMode }),
}));
