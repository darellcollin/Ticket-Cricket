CREATE TABLE `user_expansion_packs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`profileId` int NOT NULL,
	`packId` varchar(30) NOT NULL,
	`unlockedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `user_expansion_packs_id` PRIMARY KEY(`id`)
);
