# Registration alerts

Miles Ahead stores event-specific email or SMS subscriptions in Cloudflare D1. A subscription is claimed before delivery and permanently marked `notified` after its first successful message, so the same subscription is not sent twice.

## Required Cloudflare Worker bindings

- D1 binding: `DB`
- `RESEND_API_KEY` and `ALERT_FROM_EMAIL` for email
- `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, and `TWILIO_FROM_NUMBER` for SMS
- `ALERT_DISPATCH_SECRET` for the private daily dispatch endpoint
- `ADMIN_API_KEY` for subscriber exports
- `PUBLIC_SITE_URL=https://paceatlas.khajansyadav.workers.dev`

Apply `drizzle/0001_registration_alerts.sql` to the production D1 database before publishing the UI.

## Daily dispatch

Add the same `ALERT_DISPATCH_SECRET` to GitHub Actions. Optionally set the repository variable `ALERT_DISPATCH_URL`; it defaults to the production Miles Ahead endpoint. The daily workflow submits currently open events after its catalog refresh. Provider or dispatch errors do not stop the catalog timestamp from publishing and are retried on the next run.

## Subscriber maintenance

The subscriber database is private. Export it with an authenticated request:

```text
GET /api/admin/subscriptions?format=csv
Authorization: Bearer <ADMIN_API_KEY>
```

The export contains destination addresses and phone numbers and must be handled as personal data. Unsubscribe requests are processed through the unique link included in email alerts. SMS alerts are one-time by design.
