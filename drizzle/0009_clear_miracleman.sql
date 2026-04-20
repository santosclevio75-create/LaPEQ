ALTER TABLE `bookLoans` ADD `actualReturnDate` timestamp;--> statement-breakpoint
ALTER TABLE `experiments` ADD `quantity` int DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE `loans` ADD `actualReturnDate` timestamp;