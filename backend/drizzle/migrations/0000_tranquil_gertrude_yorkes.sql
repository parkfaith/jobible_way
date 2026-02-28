CREATE TABLE `curriculum` (
	`id` integer PRIMARY KEY NOT NULL,
	`week_number` integer NOT NULL,
	`volume` integer NOT NULL,
	`lesson_number` integer NOT NULL,
	`title` text NOT NULL,
	`theme` text,
	`scripture` text NOT NULL,
	`youtube_video_id` text,
	`required_book` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `curriculum_week_number_unique` ON `curriculum` (`week_number`);--> statement-breakpoint
CREATE TABLE `daily_checks` (
	`user_id` text NOT NULL,
	`date` text NOT NULL,
	`prayer_30min` integer DEFAULT 0,
	`qt_done` integer DEFAULT 0,
	`bible_reading` integer DEFAULT 0,
	`updated_at` text DEFAULT (datetime('now')),
	PRIMARY KEY(`user_id`, `date`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `diary_entries` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`week_number` integer NOT NULL,
	`content` text,
	`updated_at` text DEFAULT (datetime('now')),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `oia_notes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`week_number` integer NOT NULL,
	`date` text NOT NULL,
	`scripture` text,
	`observation` text,
	`interpretation` text,
	`application` text,
	`created_at` text DEFAULT (datetime('now')),
	`updated_at` text DEFAULT (datetime('now')),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `sermon_notes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`week_number` integer NOT NULL,
	`service` text NOT NULL,
	`date` text NOT NULL,
	`preacher` text,
	`scripture` text,
	`content` text,
	`created_at` text DEFAULT (datetime('now')),
	`updated_at` text DEFAULT (datetime('now')),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`cohort` integer DEFAULT 2,
	`start_date` text NOT NULL,
	`created_at` text DEFAULT (datetime('now'))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE TABLE `weekly_tasks` (
	`user_id` text NOT NULL,
	`week_number` integer NOT NULL,
	`verse_memorized` integer DEFAULT 0,
	`book_report_done` integer DEFAULT 0,
	`preview_done` integer DEFAULT 0,
	`updated_at` text DEFAULT (datetime('now')),
	PRIMARY KEY(`user_id`, `week_number`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
