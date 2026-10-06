CREATE TABLE `races` (
  `slug` text PRIMARY KEY NOT NULL,
  `city` text NOT NULL,
  `country` text NOT NULL,
  `code` text NOT NULL,
  `region` text NOT NULL,
  `name` text NOT NULL,
  `date` text DEFAULT '' NOT NULL,
  `event` text,
  `registration` text NOT NULL,
  `status` text NOT NULL,
  `terrain` text NOT NULL,
  `tier` text NOT NULL,
  `link` text NOT NULL,
  `featured` integer DEFAULT 0 NOT NULL,
  `lat` real NOT NULL,
  `lon` real NOT NULL,
  `distances` text DEFAULT '[]' NOT NULL,
  `route` text,
  `elevation` text,
  `route_note` text,
  `ticket_cost` text,
  `transfer_policy` text,
  `source_url` text,
  `image_file` text
);
--> statement-breakpoint
CREATE INDEX `idx_races_date_city` ON `races` (`date`,`city`);
--> statement-breakpoint
CREATE INDEX `idx_races_region` ON `races` (`region`);
--> statement-breakpoint
CREATE TABLE `site_meta` (
  `key` text PRIMARY KEY NOT NULL,
  `value` text NOT NULL
);
--> statement-breakpoint
PRAGMA optimize;
