CREATE TABLE `mini_game_results` (
	`id` int AUTO_INCREMENT NOT NULL,
	`eventId` int NOT NULL,
	`sessionCode` varchar(10) NOT NULL,
	`playerId` varchar(64) NOT NULL,
	`success` int NOT NULL DEFAULT 0,
	`amount` int NOT NULL DEFAULT 0,
	`submittedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `mini_game_results_id` PRIMARY KEY(`id`)
);
