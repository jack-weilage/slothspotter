CREATE TABLE `moderation_action` (
	`id` text PRIMARY KEY NOT NULL,
	`report_id` text NOT NULL,
	`actioned_by` text NOT NULL,
	`action_type` text NOT NULL,
	`note` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`report_id`) REFERENCES `moderation_report`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`actioned_by`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `moderation_report` (
	`id` text PRIMARY KEY NOT NULL,
	`content_id` text NOT NULL,
	`content_type` text NOT NULL,
	`reported_by` text NOT NULL,
	`reason` text NOT NULL,
	`comment` text,
	`status` text DEFAULT 'open' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`reported_by`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `moderation_report_status_idx` ON `moderation_report` (`status`);--> statement-breakpoint
DROP TABLE `moderation_flag`;--> statement-breakpoint
DROP TABLE `spot`;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_photo` (
	`id` text PRIMARY KEY NOT NULL,
	`sighting_id` text NOT NULL,
	`lqip` integer,
	`cloudflare_image_id` text NOT NULL,
	`caption` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`sighting_id`) REFERENCES `sighting`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_photo`("id", "sighting_id", "lqip", "cloudflare_image_id", "caption", "created_at", "updated_at") SELECT "id", "sighting_id", "lqip", "cloudflare_image_id", "caption", "created_at", "updated_at" FROM `photo`;--> statement-breakpoint
DROP TABLE `photo`;--> statement-breakpoint
ALTER TABLE `__new_photo` RENAME TO `photo`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `photo_cloudflare_image_id_unique` ON `photo` (`cloudflare_image_id`);--> statement-breakpoint
CREATE INDEX `photo_sighting_id_idx` ON `photo` (`sighting_id`);--> statement-breakpoint
CREATE TABLE `__new_sighting` (
	`id` text PRIMARY KEY NOT NULL,
	`sloth_id` text NOT NULL,
	`user_id` text NOT NULL,
	`sloth_status` text NOT NULL,
	`notes` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`sloth_id`) REFERENCES `sloth`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_sighting`("id", "sloth_id", "user_id", "sloth_status", "notes", "created_at", "updated_at") SELECT "id", "sloth_id", "user_id", "sloth_status", "notes", "created_at", "updated_at" FROM `sighting`;--> statement-breakpoint
DROP TABLE `sighting`;--> statement-breakpoint
ALTER TABLE `__new_sighting` RENAME TO `sighting`;--> statement-breakpoint
CREATE INDEX `sighting_sloth_id_idx` ON `sighting` (`sloth_id`);--> statement-breakpoint
CREATE INDEX `sighting_user_id_idx` ON `sighting` (`user_id`);--> statement-breakpoint
CREATE TABLE `__new_sloth` (
	`id` text PRIMARY KEY NOT NULL,
	`latitude` real NOT NULL,
	`longitude` real NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_sloth`("id", "latitude", "longitude", "status", "created_at", "updated_at") SELECT "id", "latitude", "longitude", "status", "created_at", "updated_at" FROM `sloth`;--> statement-breakpoint
DROP TABLE `sloth`;--> statement-breakpoint
ALTER TABLE `__new_sloth` RENAME TO `sloth`;--> statement-breakpoint
ALTER TABLE `user` ADD `role` text DEFAULT 'user' NOT NULL;--> statement-breakpoint
ALTER TABLE `user` ADD `banned_until` integer;--> statement-breakpoint
CREATE UNIQUE INDEX `user_provider_provider_id_idx` ON `user` (`provider`,`provider_id`);