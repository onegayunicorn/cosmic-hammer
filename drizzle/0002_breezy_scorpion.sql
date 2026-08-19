CREATE TABLE `calibrationRecords` (
	`id` int AUTO_INCREMENT NOT NULL,
	`stationId` varchar(128) NOT NULL,
	`sensorId` varchar(128) NOT NULL,
	`version` varchar(64) NOT NULL,
	`certificate` varchar(256) NOT NULL,
	`calibratedAt` timestamp NOT NULL,
	`expiresAt` timestamp NOT NULL,
	`offset` double NOT NULL DEFAULT 0,
	`scale` double NOT NULL DEFAULT 1,
	`createdBy` int NOT NULL,
	CONSTRAINT `calibrationRecords_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `forensicTraces` (
	`id` int AUTO_INCREMENT NOT NULL,
	`traceId` varchar(128) NOT NULL,
	`observationId` varchar(128) NOT NULL,
	`stationId` varchar(128) NOT NULL,
	`deviceId` varchar(128) NOT NULL,
	`seriesId` varchar(128),
	`terminalStatus` enum('open','verified','rejected','sealed') NOT NULL DEFAULT 'open',
	`events` json NOT NULL,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`completedAt` timestamp,
	CONSTRAINT `forensicTraces_id` PRIMARY KEY(`id`),
	CONSTRAINT `forensicTraces_traceId_unique` UNIQUE(`traceId`)
);
--> statement-breakpoint
CREATE TABLE `scheduledAlerts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`alertId` varchar(128) NOT NULL,
	`stationId` varchar(128),
	`kind` varchar(64) NOT NULL,
	`severity` enum('info','warning','critical') NOT NULL,
	`message` text NOT NULL,
	`payload` json NOT NULL,
	`acknowledgedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `scheduledAlerts_id` PRIMARY KEY(`id`),
	CONSTRAINT `scheduledAlerts_alertId_unique` UNIQUE(`alertId`)
);
--> statement-breakpoint
CREATE TABLE `stations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`stationId` varchar(128) NOT NULL,
	`name` varchar(160) NOT NULL,
	`latitude` double NOT NULL,
	`longitude` double NOT NULL,
	`elevationMeters` double NOT NULL DEFAULT 0,
	`hardwareModel` varchar(128) NOT NULL,
	`firmwareVersion` varchar(64) NOT NULL,
	`owner` varchar(160) NOT NULL,
	`coordinateSystem` varchar(64) NOT NULL DEFAULT 'WGS84',
	`status` enum('online','offline','maintenance','error') NOT NULL DEFAULT 'offline',
	`scheduleCronTaskUid` varchar(65),
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `stations_id` PRIMARY KEY(`id`),
	CONSTRAINT `stations_stationId_unique` UNIQUE(`stationId`)
);
