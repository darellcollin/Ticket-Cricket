CREATE TABLE `game_configs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`profileId` int NOT NULL,
	`name` varchar(50) NOT NULL,
	`difficulty` varchar(20) NOT NULL,
	`disableT2` int NOT NULL DEFAULT 0,
	`disableT3` int NOT NULL DEFAULT 0,
	`includeCustom` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `game_configs_id` PRIMARY KEY(`id`)
);
