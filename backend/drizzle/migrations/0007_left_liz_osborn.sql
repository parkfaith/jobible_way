CREATE TABLE `sermon_summaries` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`video_id` text NOT NULL,
	`summary` text NOT NULL,
	`model` text NOT NULL,
	`created_at` text DEFAULT (datetime('now'))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `sermon_summaries_video_id_unique` ON `sermon_summaries` (`video_id`);