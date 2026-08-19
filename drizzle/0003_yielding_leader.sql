CREATE TABLE `providerSnapshots` (
	`id` int AUTO_INCREMENT NOT NULL,
	`snapshotId` varchar(128) NOT NULL,
	`stationId` varchar(128) NOT NULL,
	`provider` varchar(128) NOT NULL,
	`fetchedAt` timestamp NOT NULL,
	`payload` json NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `providerSnapshots_id` PRIMARY KEY(`id`),
	CONSTRAINT `providerSnapshots_snapshotId_unique` UNIQUE(`snapshotId`)
);
