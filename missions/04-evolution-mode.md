# Mission 04 - Evolution Mode

## Outcome
You will deliver a feature-style schema evolution using additive steps:
1. Add a new column with a safe default.
2. Backfill historical values.
3. Enforce stricter constraints only after data is ready.

## Story
The potion shop introduces a loyalty program based on historical order value.

## Prerequisites
- Mission 03 is complete.
- Existing migrations apply cleanly.

## Step 1 - Create migration file
Create:
`src/main/resources/db/changelog/missions/007-add-loyalty-points.yaml`

```yaml
databaseChangeLog:
  - changeSet:
      id: 014-add-loyalty-points-column
      author: workshop
      changes:
        - addColumn:
            tableName: customers
            columns:
              - column:
                  name: loyalty_points
                  type: INT
                  defaultValueNumeric: 0
      rollback:
        - dropColumn:
            tableName: customers
            columnName: loyalty_points

  - changeSet:
      id: 015-backfill-loyalty-points
      author: workshop
      changes:
        - sql:
            sql: |
              UPDATE customers c
              SET loyalty_points = points.total_points
              FROM (
                SELECT o.customer_id, FLOOR(SUM(oi.quantity * oi.unit_price))::INT AS total_points
                FROM orders o
                JOIN order_items oi ON oi.order_id = o.id
                GROUP BY o.customer_id
              ) points
              WHERE points.customer_id = c.id;
      rollback:
        - sql:
            sql: UPDATE customers SET loyalty_points = 0;

  - changeSet:
      id: 016-set-loyalty-points-not-null
      author: workshop
      changes:
        - addNotNullConstraint:
            tableName: customers
            columnName: loyalty_points
            columnDataType: INT
      rollback:
        - dropNotNullConstraint:
            tableName: customers
            columnName: loyalty_points
            columnDataType: INT
```

## Step 2 - Register in master changelog
Add include in `src/main/resources/db/changelog/db.changelog-master.yaml`:

```yaml
  - include:
      file: missions/007-add-loyalty-points.yaml
      relativeToChangelogFile: true
```

## Step 3 - Apply migration
Restart the app:

```bash
mvn spring-boot:run
```

## Step 4 - Verify results
In psql:

```sql
SELECT id, email, loyalty_points
FROM customers
ORDER BY id;

SELECT column_name, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'customers'
  AND column_name = 'loyalty_points';
```

Expected:
- Existing customers have non-null loyalty points.
- `loyalty_points` is `NOT NULL`.
- New rows default to `0`.

## Done Criteria
- All three changesets execute.
- Changesets `014-add-loyalty-points-column`, `015-backfill-loyalty-points`, and `016-set-loyalty-points-not-null` are present in `databasechangelog`.
- Loyalty points are backfilled and constrained.

## Debrief Prompt
Why is it safer to enforce `NOT NULL` in a later changeset instead of the same step as column creation?
