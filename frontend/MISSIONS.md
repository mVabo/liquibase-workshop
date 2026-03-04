# Frontend Mission Sync

The frontend mission model now maps 1:1 to these workshop files:
- `../missions/00-setup.md`
- `../missions/01-liftoff.md`
- `../missions/02-schema-smith.md`
- `../missions/03-data-quest.md`
- `../missions/04-evolution-mode.md`
- `../missions/05-rollback-boss.md`
- `../missions/06-final-demo.md`

## Stage mapping in UI
- Stage 0 = Mission 00 Setup
- Stage 1 = Mission 01 Liftoff
- Stage 2 = Mission 02 Schema Smith
- Stage 3 = Mission 03 Data Quest
- Stage 4 = Mission 04 Evolution Mode
- Stage 5 = Mission 05 Rollback Boss
- Stage 6 = Mission 06 Final Demo

## Progress tracking
Use `/missions` route in the frontend:
- Step checklists are aligned to each mission's steps.
- Done criteria are shown per mission.
- Progress is persisted in `localStorage`.
- You can reset checks per mission and set current mission stage from each card.

## Feature unlocks
- Stage 0: service checks only
- Stage 1: potion catalog unlocked
- Stage 3: order forge unlocked
- Stage 4+: inventory dashboard unlocked
