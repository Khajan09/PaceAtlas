interface CloudflareEnv {
  DB?: D1Database;
  RESEND_API_KEY?: string;
  ALERT_FROM_EMAIL?: string;
  TWILIO_ACCOUNT_SID?: string;
  TWILIO_AUTH_TOKEN?: string;
  TWILIO_FROM_NUMBER?: string;
  ALERT_DISPATCH_SECRET?: string;
  ADMIN_API_KEY?: string;
  PUBLIC_SITE_URL?: string;
}
