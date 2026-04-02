CREATE TABLE `session_custom_cards` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionCode` varchar(10) NOT NULL,
	`cardsJson` text NOT NULL,
	`publishedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `session_custom_cards_id` PRIMARY KEY(`id`)
);
