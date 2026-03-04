import { CheckCircle2, CircleDashed, FileText, ListChecks } from "lucide-react";
import { useMemo, useState } from "react";
import { useMissionStage } from "@/lib/mission-stage";
import { missionDefinitions, type MissionDefinition } from "@/lib/missions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const STEP_STORAGE_KEY = "potion-workshop-mission-checks";

type StepCompletionMap = Record<string, boolean>;

function createStepKey(missionCode: string, stepIndex: number) {
  return `${missionCode}:${stepIndex}`;
}

function missionProgress(mission: MissionDefinition, checks: StepCompletionMap) {
  const completed = mission.steps.filter((_, idx) => checks[createStepKey(mission.code, idx)]).length;
  return {
    completed,
    total: mission.steps.length,
    ratio: mission.steps.length === 0 ? 0 : completed / mission.steps.length
  };
}

export function MissionsPage() {
  const { stage, setStage } = useMissionStage();
  const [checks, setChecks] = useState<StepCompletionMap>(() => {
    const raw = window.localStorage.getItem(STEP_STORAGE_KEY);
    if (!raw) {
      return {};
    }

    try {
      return JSON.parse(raw) as StepCompletionMap;
    } catch {
      return {};
    }
  });

  const currentMission = useMemo(
    () => missionDefinitions.find((mission) => mission.stage === stage) ?? missionDefinitions[0],
    [stage]
  );

  const cumulativeProgress = useMemo(() => {
    const activeMissions = missionDefinitions.filter((mission) => mission.stage <= stage);
    const totalSteps = activeMissions.reduce((sum, mission) => sum + mission.steps.length, 0);
    const completedSteps = activeMissions.reduce(
      (sum, mission) => sum + mission.steps.filter((_, idx) => checks[createStepKey(mission.code, idx)]).length,
      0
    );

    return {
      completedSteps,
      totalSteps,
      ratio: totalSteps === 0 ? 0 : completedSteps / totalSteps
    };
  }, [checks, stage]);

  function updateChecks(next: StepCompletionMap) {
    setChecks(next);
    window.localStorage.setItem(STEP_STORAGE_KEY, JSON.stringify(next));
  }

  function toggleStep(missionCode: string, stepIndex: number) {
    const key = createStepKey(missionCode, stepIndex);
    updateChecks({
      ...checks,
      [key]: !checks[key]
    });
  }

  function resetMissionChecks(missionCode: string) {
    const next = { ...checks };
    Object.keys(next)
      .filter((key) => key.startsWith(`${missionCode}:`))
      .forEach((key) => delete next[key]);
    updateChecks(next);
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Mission Progression Console</CardTitle>
          <CardDescription>
            Progress model is synchronized with mission markdown files in <code>missions/00-setup.md</code> through
            <code>missions/06-final-demo.md</code>.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-md border border-border/70 bg-card/70 p-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Current Mission</p>
              <p className="font-display text-lg">
                {currentMission.code} - {currentMission.title}
              </p>
            </div>
            <div className="rounded-md border border-border/70 bg-card/70 p-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Stage</p>
              <p className="font-display text-lg">{stage}</p>
            </div>
            <div className="rounded-md border border-border/70 bg-card/70 p-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Cumulative Steps</p>
              <p className="font-display text-lg">
                {cumulativeProgress.completedSteps}/{cumulativeProgress.totalSteps}
              </p>
            </div>
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div className="h-full bg-primary transition-all" style={{ width: `${cumulativeProgress.ratio * 100}%` }} />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-2">
        {missionDefinitions.map((mission) => {
          const unlocked = stage >= mission.stage;
          const progress = missionProgress(mission, checks);

          return (
            <Card key={mission.code} className={unlocked ? "border-primary/40" : "opacity-85"}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge variant={unlocked ? "success" : "outline"}>
                    Mission {mission.code}
                  </Badge>
                  {unlocked ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <CircleDashed className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
                <CardTitle className="text-lg">{mission.title}</CardTitle>
                <CardDescription>{mission.outcome}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="rounded-md border border-border/70 bg-muted/20 p-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Source: <code>{mission.file}</code>
                  </div>
                </div>

                <div>
                  <p className="mb-2 flex items-center gap-2 text-sm font-semibold">
                    <ListChecks className="h-4 w-4 text-primary" />
                    Steps ({progress.completed}/{progress.total})
                  </p>
                  <div className="space-y-2">
                    {mission.steps.map((step, stepIndex) => {
                      const key = createStepKey(mission.code, stepIndex);
                      const checked = Boolean(checks[key]);

                      return (
                        <label key={key} className="flex items-start gap-2 rounded-md border border-border/50 p-2 text-sm">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleStep(mission.code, stepIndex)}
                            className="mt-0.5 h-4 w-4 rounded border-input"
                          />
                          <span className={checked ? "text-muted-foreground line-through" : "text-foreground"}>{step}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-sm font-semibold">Done Criteria</p>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    {mission.doneCriteria.map((criterion) => (
                      <li key={criterion}>- {criterion}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <p className="mb-2 text-sm font-semibold">Frontend Unlocks</p>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    {mission.uiUnlocks.map((unlock) => (
                      <li key={unlock}>- {unlock}</li>
                    ))}
                  </ul>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button variant={unlocked ? "secondary" : "outline"} onClick={() => setStage(mission.stage)}>
                    Set current stage
                  </Button>
                  <Button variant="ghost" onClick={() => resetMissionChecks(mission.code)}>
                    Reset mission checks
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
