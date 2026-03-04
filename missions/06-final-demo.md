# Mission 06 - Final Demo

## Outcome
Run a full, reproducible migration walkthrough from empty database to working API.

## Prerequisites
- Missions 01-05 are complete.
- You have all changelog files committed and included in master.

## Demo Script

## Step 1 - Reset to a clean database
```bash
docker compose down -v
docker compose up -d
docker compose ps postgres
```

Expected: fresh Postgres container with empty schema.

## Step 2 - Start backend and apply all migrations
```bash
mvn spring-boot:run
```

Narrate:
- Liquibase acquires lock.
- Changelog files run in order.
- Lock is released.

## Step 3 - Validate core API endpoints
```bash
curl http://localhost:8080/api/status
curl http://localhost:8080/api/potions
curl http://localhost:8080/api/customers
curl http://localhost:8080/api/orders
```

## Step 4 - Show API documentation
Open:
- `http://localhost:8080/scalar`
- `http://localhost:8080/v3/api-docs`

## Step 5 - Prove migration history in database
In psql:

```sql
SELECT id, author, filename, dateexecuted
FROM databasechangelog
ORDER BY dateexecuted;

SELECT id, locked
FROM databasechangeloglock;
```

Narrate:
- Executed changesets are traceable and ordered.
- Lock table protects concurrent execution.

## Step 6 - Explain rollback strategy
Summarize what you practiced:
- Rollback of one changeset (`rollbackCount=1`).
- Forward-fix migration after rollback.
- Why executed changesets should never be edited in place.

## Final Checklist
- Fresh DB bootstraps from changelog only.
- APIs respond with expected data.
- Changelog history is visible and auditable.
- Team can explain naming, review, and rollback conventions.

## Wrap-Up Questions
- What naming format will your team enforce for `id`, `author`, and filenames?
- Which migration validations should run in CI before merge?
