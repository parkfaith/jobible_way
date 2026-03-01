CREATE TABLE `sermon_summaries` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`week_number` integer NOT NULL,
	`service` text NOT NULL,
	`date` text NOT NULL,
	`title` text,
	`preacher` text,
	`scripture` text,
	`youtube_video_id` text,
	`summary` text NOT NULL,
	`created_at` text DEFAULT (datetime('now'))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_summary_week_service` ON `sermon_summaries` (`week_number`,`service`);