import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Theme = "dark" | "light" | "purple";

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: "dark",
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: "argufight-theme",
    }
  )
);
