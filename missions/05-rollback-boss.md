# Mission 05 - Rollback Boss

## Outcome
Practice safe rollback on a migration that applied successfully but was the wrong change.

## Prerequisites
- Mission 04 is complete.
- PostgreSQL is running locally on `localhost:5432`.

## Step 1 - Add an intentionally wrong but valid migration
Create:
`src/main/resources/db/changelog/missions/008-add-orders-debug-note.yaml`

```yaml
databaseChangeLog:
  - changeSet:
      id: 017-add-orders-debug-note
      author: workshop
      changes:
        - addColumn:
            tableName: orders
            columns:
              - column:
                  name: debug_note
                  type: VARCHAR(100)
      rollback:
        - dropColumn:
            tableName: orders
            columnName: debug_note
```

Register in master changelog and restart app:

```bash
mvn spring-boot:run
```

Verify the column exists:

```sql
SELECT column_name
FROM information_schema.columns
WHERE table_name = 'orders'
ORDER BY ordinal_position;
```

## Step 2 - Roll back exactly one changeset
Stop the app first, then run:

```bash
mvn org.liquibase:liquibase-maven-plugin:4.28.0:rollback \
  -Dliquibase.url=jdbc:postgresql://localhost:5432/potion_shop \
  -Dliquibase.username=workshop \
  -Dliquibase.password=workshop \
  -Dliquibase.changeLogFile=src/main/resources/db/changelog/db.changelog-master.yaml \
  -Dliquibase.rollbackCount=1
```

Verify rollback:

```sql
SELECT column_name
FROM information_schema.columns
WHERE table_name = 'orders'
  AND column_name = 'debug_note';

SELECT id
FROM databasechangelog
WHERE id = '017-add-orders-debug-note';
```

Expected:
- `debug_note` is gone.
- The rolled-back changeset is no longer in `databasechangelog`.

## Step 3 - Add the correct migration
Create:
`src/main/resources/db/changelog/missions/009-add-orders-reference-code.yaml`

```yaml
databaseChangeLog:
  - changeSet:
      id: 018-add-orders-reference-code
      author: workshop
      changes:
        - addColumn:
            tableName: orders
            columns:
              - column:
                  name: reference_code
                  type: VARCHAR(64)
      rollback:
        - dropColumn:
            tableName: orders
            columnName: reference_code
```

Register file in master changelog and restart app to apply it.

## Done Criteria
- You applied a wrong migration.
- You rolled it back using `rollbackCount=1`.
- Changeset `017-add-orders-debug-note` is no longer present in `databasechangelog` after rollback.
- You replaced it with a correct forward migration.
- Changeset `018-add-orders-reference-code` is applied successfully.

## Discussion
When should you rollback immediately, and when should you keep history intact and ship a forward-fix?
