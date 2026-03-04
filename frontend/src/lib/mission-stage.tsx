import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { clampMissionStage } from "@/lib/missions";

type MissionStageContextValue = {
  stage: number;
  setStage: (next: number) => void;
};

const MissionStageContext = createContext<MissionStageContextValue | null>(null);
const STORAGE_KEY = "potion-workshop-mission-stage";

export function MissionStageProvider({ children }: { children: ReactNode }) {
  const [stage, setStageState] = useState<number>(() => {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = Number.parseInt(raw ?? "0", 10);
    if (Number.isNaN(parsed)) {
      return 0;
    }
    return clampMissionStage(parsed);
  });

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, String(stage));
  }, [stage]);

  const value = useMemo(
    () => ({
      stage,
      setStage: (next: number) => setStageState(clampMissionStage(next))
    }),
    [stage]
  );

  return <MissionStageContext.Provider value={value}>{children}</MissionStageContext.Provider>;
}

export function useMissionStage() {
  const context = useContext(MissionStageContext);
  if (!context) {
    throw new Error("useMissionStage must be used inside MissionStageProvider");
  }
  return context;
}
