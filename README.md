# Liquibase Workshop Starter

Spring Boot + Liquibase backend with a mission-driven frontend for a potion webshop and inventory dashboard.

## Stack
- Java 25
- Spring Boot 4
- Liquibase
- PostgreSQL
- Scalar API Reference (OpenAPI UI)
- Frontend: Bun + Vite + React + TanStack Router + Tailwind + shadcn/ui-style components

## Backend quick start
```bash
docker compose up -d
mvn spring-boot:run
```

Backend URLs:
- App status: http://localhost:8080/api/status
- Potions API: http://localhost:8080/api/potions
- Customers API: http://localhost:8080/api/customers
- Orders API: http://localhost:8080/api/orders
- OpenAPI JSON: http://localhost:8080/v3/api-docs
- Scalar docs: http://localhost:8080/scalar

## Frontend quick start
Start backend first, then in a second terminal:

```bash
cd frontend
bun install
bun dev
```

Frontend runs on `http://localhost:5173` and proxies API calls to `http://localhost:8080`.

Optional npm fallback:

```bash
cd frontend
npm install
npm run dev
```

## Frontend mission behavior
The stage selector and `/missions` progress tracker are aligned to mission markdown files `00` through `06`.

Stage mapping:
- Stage 0: Mission 00 Setup
- Stage 1: Mission 01 Liftoff
- Stage 2: Mission 02 Schema Smith
- Stage 3: Mission 03 Data Quest
- Stage 4: Mission 04 Evolution Mode
- Stage 5: Mission 05 Rollback Boss
- Stage 6: Mission 06 Final Demo

See: [frontend/MISSIONS.md](frontend/MISSIONS.md)

## Source Of Truth
- Frontend (`/`, `/dashboard`, `/missions`) is the workshop guide and progress UI.
- `missions/*.md` files are the authoritative mission answers/expected outcomes.
- If there is any mismatch, follow `missions/*.md`.

## Missions
Workshop docs:
- [00-setup.md](missions/00-setup.md)
- [01-liftoff.md](missions/01-liftoff.md)
- [02-schema-smith.md](missions/02-schema-smith.md)
- [03-data-quest.md](missions/03-data-quest.md)
- [04-evolution-mode.md](missions/04-evolution-mode.md)
- [05-rollback-boss.md](missions/05-rollback-boss.md)
- [06-final-demo.md](missions/06-final-demo.md)
