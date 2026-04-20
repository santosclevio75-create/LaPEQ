CREATE TABLE `designStyles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`componentName` varchar(255) NOT NULL,
	`cssClass` varchar(255) NOT NULL,
	`cssValue` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `designStyles_id` PRIMARY KEY(`id`)
);
