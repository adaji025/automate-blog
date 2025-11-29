# Blog Automation

Automated blog generation using cron scheduling.

## Current Schedule

- **Frequency**: Daily at midnight (00:00)
- **Timezone**: Africa/Lagos
- **Cron Expression**: `"0 0 * * *"`

## Modify Schedule

Edit line 5 in `blogAutomation.js`:

```javascript
new Cron("*/5 * * * *", { timezone: "Africa/Lagos" }, async () => {
```

## Common Schedules

- Every 5 minutes: `"*/5 * * * *"`
- Every 30 minutes: `"*/30 * * * *"`
- Every hour: `"0 * * * *"`
- Every 6 hours: `"0 */6 * * *"`
- Every 8 hours: `"0 */8 * * *"`
- Daily at 2 AM: `"0 2 * * *"`

## Cron Format

`"minute hour day month day-of-week"`

