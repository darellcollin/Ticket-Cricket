CREATE TABLE `purchases` (
	`id` int AUTO_INCREMENT NOT NULL,
	`profileId` int NOT NULL,
	`productId` varchar(50) NOT NULL,
	`productName` varchar(100) NOT NULL,
	`amountCents` int NOT NULL DEFAULT 0,
	`currency` varchar(10) NOT NULL DEFAULT 'cad',
	`stripeSessionId` varchar(255) NOT NULL,
	`cardsUnlocked` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `purchases_id` PRIMARY KEY(`id`),
	CONSTRAINT `purchases_stripeSessionId_unique` UNIQUE(`stripeSessionId`)
);
