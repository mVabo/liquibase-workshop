export type MissionDefinition = {
  stage: number;
  code: string;
  title: string;
  file: string;
  outcome: string;
  steps: string[];
  doneCriteria: string[];
  uiUnlocks: string[];
};

export const MISSION_MIN_STAGE = 0;
export const MISSION_MAX_STAGE = 6;

export const missionDefinitions: MissionDefinition[] = [
  {
    stage: 0,
    code: "00",
    title: "Setup",
    file: "missions/00-setup.md",
    outcome: "Project skeleton, PostgreSQL, backend, and frontend run locally.",
    steps: [
      "Create Spring Boot 4 project and add Liquibase dependency.",
      "Configure and start PostgreSQL with docker compose.",
      "Run backend and verify /api/status + /scalar.",
      "Run frontend (Bun or npm) and verify http://localhost:5173."
    ],
    doneCriteria: [
      "Backend is reachable on localhost:8080.",
      "Frontend is reachable on localhost:5173.",
      "PostgreSQL is healthy in Docker."
    ],
    uiUnlocks: ["Service Crystal baseline checks"]
  },
  {
    stage: 1,
    code: "01",
    title: "Liftoff",
    file: "missions/01-liftoff.md",
    outcome: "Liquibase runs on startup, history tables are inspected, first custom migration is applied.",
    steps: [
      "Start PostgreSQL and confirm healthy container.",
      "Run app and observe Liquibase startup execution.",
      "Verify /api/status and /api/potions.",
      "Inspect databasechangelog and databasechangeloglock in PostgreSQL.",
      "Create 003-add-potions-description migration file.",
      "Include 003 file in db.changelog-master.yaml.",
      "Restart app to apply migration.",
      "Verify potions.description column and changelog row for id 010."
    ],
    doneCriteria: [
      "App starts without Liquibase errors.",
      "potions.description exists.",
      "010-add-potions-description appears once in databasechangelog."
    ],
    uiUnlocks: ["Potion catalog cards in /shop"]
  },
  {
    stage: 2,
    code: "02",
    title: "Schema Smith",
    file: "missions/02-schema-smith.md",
    outcome: "Schema constraints are reviewed and an index migration is added and verified.",
    steps: [
      "Review core table constraints in 001 and 003 mission changelogs.",
      "Confirm live constraints in PostgreSQL information_schema.",
      "Create 004-add-orders-created-at-index migration.",
      "Include 004 file in db.changelog-master.yaml.",
      "Restart app to apply migration.",
      "Verify idx_orders_created_at in pg_indexes."
    ],
    doneCriteria: [
      "New index changelog is included and executed.",
      "Liquibase runs without error.",
      "idx_orders_created_at exists."
    ],
    uiUnlocks: ["Mission detail panel highlights schema optimization milestone"]
  },
  {
    stage: 3,
    code: "03",
    title: "Data Quest",
    file: "missions/03-data-quest.md",
    outcome: "Data migrations are created with rollback and verified via API and SQL.",
    steps: [
      "Create 005-insert-phoenix-potion migration with rollback.",
      "Create 006-raise-cheap-potion-prices migration with rollback.",
      "Include 005 and 006 in db.changelog-master.yaml.",
      "Restart app to apply migrations.",
      "Verify PHNX-01 and updated prices via /api/potions and SQL."
    ],
    doneCriteria: [
      "Both changesets execute successfully.",
      "PHNX-01 exists in potions.",
      "Cheap potion prices are increased."
    ],
    uiUnlocks: ["Order Forge interactions in /shop"]
  },
  {
    stage: 4,
    code: "04",
    title: "Evolution Mode",
    file: "missions/04-evolution-mode.md",
    outcome: "Loyalty feature migration is delivered safely in additive/backfill/constraint steps.",
    steps: [
      "Create 007-add-loyalty-points migration file.",
      "Include 007 in db.changelog-master.yaml.",
      "Restart app to apply all three loyalty changesets.",
      "Verify loyalty_points values, NOT NULL, and default behavior."
    ],
    doneCriteria: [
      "Column exists with backfilled values.",
      "NOT NULL constraint is active.",
      "New rows default loyalty_points to 0."
    ],
    uiUnlocks: ["Inventory dashboard unlocked (/dashboard)"]
  },
  {
    stage: 5,
    code: "05",
    title: "Rollback Boss",
    file: "missions/05-rollback-boss.md",
    outcome: "A wrong migration is rolled back safely and replaced with a correct forward migration.",
    steps: [
      "Create and apply 008-add-orders-debug-note migration.",
      "Rollback exactly one changeset using rollbackCount=1.",
      "Create and apply 009-add-orders-reference-code migration."
    ],
    doneCriteria: [
      "Wrong migration was applied then rolled back.",
      "debug_note column is removed.",
      "reference_code is applied through a new forward migration."
    ],
    uiUnlocks: ["Rollback readiness highlighted in mission progress console"]
  },
  {
    stage: 6,
    code: "06",
    title: "Final Demo",
    file: "missions/06-final-demo.md",
    outcome: "Team demonstrates full migration lifecycle from clean DB to auditable API-ready state.",
    steps: [
      "Reset to a clean PostgreSQL volume.",
      "Start backend and narrate Liquibase lock + execution order.",
      "Validate /api/status, /api/potions, /api/customers, /api/orders.",
      "Show Scalar and OpenAPI documentation endpoints.",
      "Prove changelog history and lock-table state in PostgreSQL.",
      "Explain rollback and forward-fix strategy."
    ],
    doneCriteria: [
      "Fresh DB bootstraps only from changelog files.",
      "APIs return expected data.",
      "Migration history is visible and auditable."
    ],
    uiUnlocks: ["All storefront + dashboard features and final walkthrough mode"]
  }
];

export function clampMissionStage(value: number) {
  return Math.max(MISSION_MIN_STAGE, Math.min(MISSION_MAX_STAGE, value));
}

export function getMissionByStage(stage: number) {
  return missionDefinitions.find((mission) => mission.stage === stage) ?? missionDefinitions[0];
}
