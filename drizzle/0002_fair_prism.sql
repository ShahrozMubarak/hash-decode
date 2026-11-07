CREATE TABLE `chat_messages` (
	`id` text PRIMARY KEY NOT NULL,
	`thread` text NOT NULL,
	`role` text NOT NULL,
	`body` text NOT NULL,
	`created` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `chat_threads` (
	`id` text PRIMARY KEY NOT NULL,
	`secret` text NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`updated` integer NOT NULL
);
