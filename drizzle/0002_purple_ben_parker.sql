CREATE TABLE `saved_games` (
	`id` int AUTO_INCREMENT NOT NULL,
	`profileId` int NOT NULL,
	`gameState` text NOT NULL,
	`difficulty` varchar(20) NOT NULL,
	`currentTurn` int NOT NULL DEFAULT 0,
	`cardsDrawn` int NOT NULL DEFAULT 0,
	`savedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `saved_games_id` PRIMARY KEY(`id`)
);
