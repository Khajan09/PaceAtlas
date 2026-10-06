# Daily race-catalog refresh

The Pace Atlas catalog is stored in the Site's D1 database and read through `/api/races`. If the database is temporarily unavailable or has not been seeded yet, the browser keeps the bundled catalog so the directory remains usable.

Each daily run should:

1. Open this same Site and use its `replace_race_catalog` tool.
2. Check the currently listed races against official organizer pages only. Preserve a prior value when the organizer has not published a replacement; never infer a date, price, elevation total, or transfer policy.
3. Keep only major, iconic, or internationally prominent city events. Preserve valid existing records and add a new event only when it meets that editorial threshold.
4. Send the complete catalog in one call. The update is atomic, so readers never see a partially refreshed list.
5. Read `/api/races` after the write and confirm that the returned count and `updatedAt` changed. Retry once only for a transient failure.

Do not store credentials or copy unofficial claims into the database. Event dates, registration status, ticket cost, transfer policy, route, and elevation must point to the organizer or a recognized governing body in `sourceUrl`.
