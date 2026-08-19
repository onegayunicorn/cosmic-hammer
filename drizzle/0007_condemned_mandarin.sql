CREATE TABLE `claimReviews` (
	`id` int AUTO_INCREMENT NOT NULL,
	`reviewId` varchar(128) NOT NULL,
	`claimId` varchar(128) NOT NULL,
	`reviewerId` int NOT NULL,
	`decision` enum('approve','reject','request_changes') NOT NULL,
	`rationale` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `claimReviews_id` PRIMARY KEY(`id`),
	CONSTRAINT `claimReviews_reviewId_unique` UNIQUE(`reviewId`)
);
--> statement-breakpoint
CREATE TABLE `evidenceExports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`exportId` varchar(128) NOT NULL,
	`requestedBy` int NOT NULL,
	`payload` json NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `evidenceExports_id` PRIMARY KEY(`id`),
	CONSTRAINT `evidenceExports_exportId_unique` UNIQUE(`exportId`)
);
--> statement-breakpoint
CREATE TABLE `roadmapClaims` (
	`id` int AUTO_INCREMENT NOT NULL,
	`claimId` varchar(128) NOT NULL,
	`label` varchar(256) NOT NULL,
	`value` varchar(256) NOT NULL,
	`category` enum('actual','target','assumption','simulation','hypothesis','unverified') NOT NULL,
	`status` enum('draft','submitted','approved','rejected','archived') NOT NULL DEFAULT 'draft',
	`citationId` varchar(128),
	`evidenceNote` text NOT NULL,
	`submittedBy` int NOT NULL,
	`reviewedBy` int,
	`reviewedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `roadmapClaims_id` PRIMARY KEY(`id`),
	CONSTRAINT `roadmapClaims_claimId_unique` UNIQUE(`claimId`)
);
--> statement-breakpoint
CREATE TABLE `sourceCitations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`citationId` varchar(128) NOT NULL,
	`title` varchar(256) NOT NULL,
	`publisher` varchar(256),
	`url` text NOT NULL,
	`accessedAt` timestamp NOT NULL,
	`sourceType` enum('primary','secondary','authored','internal') NOT NULL,
	`notes` text,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `sourceCitations_id` PRIMARY KEY(`id`),
	CONSTRAINT `sourceCitations_citationId_unique` UNIQUE(`citationId`)
);
