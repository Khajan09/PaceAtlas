CREATE TABLE `registration_subscriptions` (
  `id` text PRIMARY KEY NOT NULL,
  `race_slug` text NOT NULL,
  `race_name` text NOT NULL,
  `channel` text NOT NULL CHECK (`channel` IN ('email','sms')),
  `destination` text NOT NULL,
  `destination_hash` text NOT NULL,
  `status` text DEFAULT 'active' NOT NULL CHECK (`status` IN ('active','sending','notified','unsubscribed')),
  `created_at` text NOT NULL,
  `notified_at` text,
  `unsubscribed_at` text,
  `unsubscribe_token` text NOT NULL UNIQUE,
  `last_error` text,
  UNIQUE (`race_slug`,`channel`,`destination_hash`)
);
--> statement-breakpoint
CREATE INDEX `idx_registration_subscriptions_race_status` ON `registration_subscriptions` (`race_slug`,`status`);
--> statement-breakpoint
CREATE TABLE `registration_notifications` (
  `subscription_id` text NOT NULL,
  `event_key` text NOT NULL,
  `sent_at` text NOT NULL,
  PRIMARY KEY (`subscription_id`,`event_key`),
  FOREIGN KEY (`subscription_id`) REFERENCES `registration_subscriptions`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
PRAGMA optimize;
