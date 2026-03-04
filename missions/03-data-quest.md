# Mission 03 - Data Quest

## Outcome
You will practice data migrations (not only schema migrations):
1. Insert new seed data with rollback.
2. Apply a mass data update with rollback.
3. Verify through API and SQL.

## Prerequisites
- Mission 02 is complete.
- You can run `mvn spring-boot:run` without migration errors.

## Step 1 - Create a data insert migration
Create file:
`src/main/resources/db/changelog/missions/005-insert-phoenix-potion.yaml`

```yaml
databaseChangeLog:
  - changeSet:
      id: 012-insert-phoenix-potion
      author: workshop
      changes:
        - insert:
            tableName: potions
            columns:
              - column:
                  name: code
                  value: PHNX-01
              - column:
                  name: name
                  value: Phoenix Tonic
              - column:
                  name: price
                  valueNumeric: 31.00
              - column:
                  name: stock
                  valueNumeric: 12
              - column:
                  name: description
                  value: Rekindles vitality after critical damage.
      rollback:
        - delete:
            tableName: potions
            where: code = 'PHNX-01'
```

## Step 2 - Create a price update migration
Create file:
`src/main/resources/db/changelog/missions/006-raise-cheap-potion-prices.yaml`

```yaml
databaseChangeLog:
  - changeSet:
      id: 013-raise-cheap-potion-prices
      author: workshop
      changes:
        - sql:
            sql: |
              UPDATE potions
              SET price = ROUND((price * 1.05)::numeric, 2)
              WHERE price < 15;
      rollback:
        - sql:
            sql: |
              UPDATE potions
              SET price = ROUND((price / 1.05)::numeric, 2)
              WHERE code IN ('HEAL-01', 'MANA-01');
```

## Step 3 - Register both files in master changelog
Add includes in `src/main/resources/db/changelog/db.changelog-master.yaml` after mission `004`:

```yaml
  - include:
      file: missions/005-insert-phoenix-potion.yaml
      relativeToChangelogFile: true
  - include:
      file: missions/006-raise-cheap-potion-prices.yaml
      relativeToChangelogFile: true
```

## Step 4 - Apply migrations
Restart the app:

```bash
mvn spring-boot:run
```

## Step 5 - Verify via API and SQL
API check:

```bash
curl http://localhost:8080/api/potions
```

SQL check:

```sql
SELECT code, name, price, stock
FROM potions
ORDER BY id;
```

Expected:
- `PHNX-01` exists.
- Potions previously under `15` increased by about `5%`.

## Rules
- Never edit already executed changesets.
- Always add new files and new changeset IDs.

## Done Criteria
- Both migrations execute successfully.
- Changesets `012-insert-phoenix-potion` and `013-raise-cheap-potion-prices` are recorded in `databasechangelog`.
- Data changes are visible in both SQL and API output.

## Debrief Prompt
When should a data change be a migration versus an application startup script?
