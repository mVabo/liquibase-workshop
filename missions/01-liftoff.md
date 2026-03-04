# Mission 01 - Liftoff

## Outcome
By the end of this mission, you can:
1. Run Liquibase through Spring Boot startup.
2. Inspect Liquibase execution history in PostgreSQL.
3. Create and apply your first custom migration.

## Prerequisites
- Mission 00 is complete.
- Docker is running.
- Java 25 and Maven are installed.

## Step 1 - Start PostgreSQL
```bash
docker compose up -d
docker compose ps postgres
```

Expected: `liquibase-workshop-postgres` is up and healthy.

## Step 2 - Start the app (Liquibase runs automatically)
```bash
mvn spring-boot:run
```

Expected in logs:
- Liquibase starts before the app is fully up.
- Baseline changesets from `001-create-core-tables.yaml` and `002-seed-core-data.yaml` execute.
- The app listens on port `8080`.

Keep this terminal running. Use a second terminal for the checks below.

## Step 3 - Verify the app and seed data
```bash
curl http://localhost:8080/api/status
curl http://localhost:8080/api/potions
```

Expected:
- Status response includes `"status":"ready"`.
- Potions endpoint returns seeded rows.

## Step 4 - Inspect Liquibase metadata tables
Open psql:
```bash
docker exec -it liquibase-workshop-postgres psql -U workshop -d potion_shop
```

Run:
```sql
SELECT id, author, filename, dateexecuted
FROM databasechangelog
ORDER BY dateexecuted;

SELECT id, locked, lockgranted, lockedby
FROM databasechangeloglock;
```

Expected:
- `databasechangelog` contains the baseline changesets.
- `databasechangeloglock.locked` is `false` after startup.

## Step 5 - Create your first migration
Create this file:
`src/main/resources/db/changelog/missions/003-add-potions-description.yaml`

```yaml
databaseChangeLog:
  - changeSet:
      id: 010-add-potions-description
      author: workshop
      changes:
        - addColumn:
            tableName: potions
            columns:
              - column:
                  name: description
                  type: VARCHAR(255)
      rollback:
        - dropColumn:
            tableName: potions
            columnName: description
```

## Step 6 - Register the migration in the master changelog
Update `src/main/resources/db/changelog/db.changelog-master.yaml` and add:

```yaml
  - include:
      file: missions/003-add-potions-description.yaml
      relativeToChangelogFile: true
```

Place it after `002-seed-core-data.yaml`.

## Step 7 - Apply your new migration
If the app is running, stop it and start it again:

```bash
mvn spring-boot:run
```

Liquibase should execute `010-add-potions-description` once.

## Step 8 - Verify migration result
In psql:
```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'potions'
ORDER BY ordinal_position;

SELECT id, filename
FROM databasechangelog
WHERE id = '010-add-potions-description'
  AND filename LIKE '%003-add-potions-description.yaml';
```

## Done Criteria
- App starts without Liquibase errors.
- `potions.description` exists.
- Changelog file `003-add-potions-description.yaml` is included in `db.changelog-master.yaml`.
- Changeset `010-add-potions-description` (from file `003-add-potions-description.yaml`) appears once in `databasechangelog`.

## Debrief Prompt
What prevents Liquibase from executing the same changeset twice?
