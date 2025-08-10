PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_photo` (
	`id` text PRIMARY KEY NOT NULL,
	`sighting_id` text NOT NULL,
	`lqip` integer,
	`cloudflare_image_id` text NOT NULL,
	`caption` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`sighting_id`) REFERENCES `sighting`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_photo`("id", "sighting_id", "lqip", "cloudflare_image_id", "caption", "created_at") SELECT "id", "sighting_id", "lqip", "cloudflare_image_id", "caption", "created_at" FROM `photo`;--> statement-breakpoint
DROP TABLE `photo`;--> statement-breakpoint
ALTER TABLE `__new_photo` RENAME TO `photo`;--> statement-breakpoint
PRAGMA foreign_keys=ON;