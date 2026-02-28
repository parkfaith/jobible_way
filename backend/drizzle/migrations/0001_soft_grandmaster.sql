CREATE UNIQUE INDEX `idx_diary_user_week` ON `diary_entries` (`user_id`,`week_number`);--> statement-breakpoint
CREATE INDEX `idx_oia_user_week` ON `oia_notes` (`user_id`,`week_number`);--> statement-breakpoint
CREATE UNIQUE INDEX `idx_sermon_user_week_service` ON `sermon_notes` (`user_id`,`week_number`,`service`);