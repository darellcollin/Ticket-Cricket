CREATE TABLE `user_active_skin` (
	`id` int AUTO_INCREMENT NOT NULL,
	`profileId` int NOT NULL,
	`skinId` varchar(30) NOT NULL DEFAULT 'classique',
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_active_skin_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_active_skin_profileId_unique` UNIQUE(`profileId`)
);
--> statement-breakpoint
CREATE TABLE `user_skins` (
	`id` int AUTO_INCREMENT NOT NULL,
	`profileId` int NOT NULL,
	`skinId` varchar(30) NOT NULL,
	`unlockedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `user_skins_id` PRIMARY KEY(`id`)
);
