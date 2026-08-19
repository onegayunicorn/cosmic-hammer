CREATE TABLE `sensors` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sensorId` varchar(128) NOT NULL,
	`stationId` varchar(128) NOT NULL,
	`sensorType` varchar(128) NOT NULL,
	`unit` varchar(32) NOT NULL,
	`sensorStatus` enum('active','maintenance','retired') NOT NULL DEFAULT 'active',
	`calibrationVersion` varchar(64),
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `sensors_id` PRIMARY KEY(`id`),
	CONSTRAINT `sensors_sensorId_unique` UNIQUE(`sensorId`)
);
