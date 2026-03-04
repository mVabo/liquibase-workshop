# Potion Shop Frontend

Micro frontend for the Liquibase workshop.

## Stack
- Bun
- Vite
- React + TypeScript
- TanStack Router
- Tailwind CSS
- shadcn/ui-style component primitives

## Run
```bash
bun install
bun dev
```

## Build
```bash
bun run build
```

## Routes
- `/` potion webshop
- `/dashboard` inventory + sales dashboard
- `/missions` mission progress + step checklist

## Mission synchronization
Mission stage options and checklist data map directly to:
- `../missions/00-setup.md`
- `../missions/01-liftoff.md`
- `../missions/02-schema-smith.md`
- `../missions/03-data-quest.md`
- `../missions/04-evolution-mode.md`
- `../missions/05-rollback-boss.md`
- `../missions/06-final-demo.md`

See: `MISSIONS.md`.
