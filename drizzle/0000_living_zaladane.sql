CREATE TABLE `devices` (
	`id` int AUTO_INCREMENT NOT NULL,
	`deviceId` varchar(128) NOT NULL,
	`hardwareRevision` varchar(64) NOT NULL,
	`firmwareVersion` varchar(64) NOT NULL,
	`calibrationVersion` varchar(64) NOT NULL,
	`publicKey` text NOT NULL,
	`coordinateSystem` varchar(64) NOT NULL DEFAULT 'WGS84',
	`registeredBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`lastSeenAt` timestamp,
	CONSTRAINT `devices_id` PRIMARY KEY(`id`),
	CONSTRAINT `devices_deviceId_unique` UNIQUE(`deviceId`)
);
--> statement-breakpoint
CREATE TABLE `predictionRuns` (
	`id` int AUTO_INCREMENT NOT NULL,
	`runId` varchar(128) NOT NULL,
	`modelVersion` varchar(128) NOT NULL,
	`coordinateSystem` varchar(64) NOT NULL,
	`evidenceClass` enum('observed','derived','simulated','hypothesis','unverified') NOT NULL DEFAULT 'simulated',
	`payload` json NOT NULL,
	`uncertainty` double,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `predictionRuns_id` PRIMARY KEY(`id`),
	CONSTRAINT `predictionRuns_runId_unique` UNIQUE(`runId`)
);
--> statement-breakpoint
CREATE TABLE `telemetryRecords` (
	`id` int AUTO_INCREMENT NOT NULL,
	`deviceId` varchar(128) NOT NULL,
	`sensorId` varchar(128) NOT NULL,
	`experimentId` varchar(128) NOT NULL,
	`observedAt` timestamp NOT NULL,
	`ingestedAt` timestamp NOT NULL DEFAULT (now()),
	`sequenceNumber` int NOT NULL,
	`value` double NOT NULL,
	`unit` varchar(32) NOT NULL,
	`evidenceClass` enum('observed','derived','simulated','hypothesis','unverified') NOT NULL,
	`uncertainty` double,
	`calibrationId` varchar(128),
	`coordinateSystem` varchar(64) NOT NULL,
	`provenance` json NOT NULL,
	`signature` text NOT NULL,
	CONSTRAINT `telemetryRecords_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64) NOT NULL,
	`name` text,
	`email` varchar(320),
	`loginMethod` varchar(64),
	`role` enum('user','admin') NOT NULL DEFAULT 'user',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_openId_unique` UNIQUE(`openId`)
);
