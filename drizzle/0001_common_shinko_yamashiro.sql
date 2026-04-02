CREATE TABLE `game_profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`pseudo` varchar(50) NOT NULL,
	`email` varchar(320) NOT NULL,
	`passwordHash` varchar(255) NOT NULL,
	`userId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `game_profiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `game_profiles_pseudo_unique` UNIQUE(`pseudo`),
	CONSTRAINT `game_profiles_email_unique` UNIQUE(`email`)
);
