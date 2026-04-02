CREATE TABLE `custom_cards` (
	`id` int AUTO_INCREMENT NOT NULL,
	`profileId` int NOT NULL,
	`category` enum('contravention','contribuable','investisseur') NOT NULL,
	`mefait` varchar(150),
	`ticketPrice` int NOT NULL DEFAULT 0,
	`frais` int NOT NULL DEFAULT 0,
	`impots` int NOT NULL DEFAULT 0,
	`taxe` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `custom_cards_id` PRIMARY KEY(`id`)
);
