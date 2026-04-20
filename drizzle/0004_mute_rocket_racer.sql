CREATE TABLE `bookLoans` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`institution` varchar(255) NOT NULL,
	`bookTitle` varchar(255) NOT NULL,
	`author` varchar(255),
	`withdrawalDate` timestamp NOT NULL,
	`returnDate` timestamp NOT NULL,
	`status` enum('pending','approved','rejected','returned') NOT NULL DEFAULT 'pending',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `bookLoans_id` PRIMARY KEY(`id`)
);
