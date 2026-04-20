CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`type` enum('loan_pending','loan_approved','loan_rejected','loan_returned','book_loan_pending','book_loan_approved','book_loan_rejected','book_loan_returned') NOT NULL,
	`title` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`loanId` int,
	`bookLoanId` int,
	`isRead` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
