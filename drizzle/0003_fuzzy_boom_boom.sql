CREATE TABLE `mini_game_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionCode` varchar(10) NOT NULL,
	`mode` enum('run','hide') NOT NULL,
	`triggeredBy` varchar(64) NOT NULL,
	`triggeredAt` timestamp NOT NULL DEFAULT (now()),
	`resolved` int NOT NULL DEFAULT 0,
	CONSTRAINT `mini_game_events_id` PRIMARY KEY(`id`)
);
