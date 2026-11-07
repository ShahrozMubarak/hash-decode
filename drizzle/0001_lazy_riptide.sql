CREATE TABLE `human_challenges` (
	`id` text PRIMARY KEY NOT NULL,
	`answer` text NOT NULL,
	`expires` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `studio_content` (
	`id` text PRIMARY KEY NOT NULL,
	`kind` text NOT NULL,
	`title` text NOT NULL,
	`label` text NOT NULL,
	`body` text NOT NULL,
	`url` text NOT NULL,
	`image` text NOT NULL,
	`status` text NOT NULL,
	`updated` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `traffic_totals` (
	`key` text PRIMARY KEY NOT NULL,
	`day` text NOT NULL,
	`page` text NOT NULL,
	`source` text NOT NULL,
	`views` integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE `inquiries` ADD `budget` text DEFAULT 'Not specified' NOT NULL;--> statement-breakpoint
ALTER TABLE `inquiries` ADD `mail` text DEFAULT 'not configured' NOT NULL;--> statement-breakpoint
ALTER TABLE `projects` ADD `tech` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `projects` ADD `result` text DEFAULT '' NOT NULL;