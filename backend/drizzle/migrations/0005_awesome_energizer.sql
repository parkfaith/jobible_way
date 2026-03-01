DROP TABLE `sermon_summaries`;--> statement-breakpoint
ALTER TABLE `daily_checks` ADD `verse_reading` integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE `weekly_tasks` ADD `sermon_watched` integer DEFAULT 0;