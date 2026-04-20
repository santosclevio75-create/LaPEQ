ALTER TABLE `bookLoans` ADD `email` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `experiments` ADD `videoUrl` text;--> statement-breakpoint
ALTER TABLE `bookLoans` DROP COLUMN `actualReturnDate`;--> statement-breakpoint
ALTER TABLE `experiments` DROP COLUMN `quantity`;--> statement-breakpoint
ALTER TABLE `loans` DROP COLUMN `actualReturnDate`;