CREATE TABLE `owner_sessions` (
	`token_hash` text PRIMARY KEY NOT NULL,
	`credential_id` text NOT NULL,
	`expires` integer NOT NULL
);
