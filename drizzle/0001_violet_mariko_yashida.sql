CREATE TABLE `weatherObservationSeries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`seriesId` varchar(128) NOT NULL,
	`source` varchar(256) NOT NULL,
	`coordinateSystem` varchar(64) NOT NULL,
	`latitude` double NOT NULL,
	`longitude` double NOT NULL,
	`payload` json NOT NULL,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `weatherObservationSeries_id` PRIMARY KEY(`id`),
	CONSTRAINT `weatherObservationSeries_seriesId_unique` UNIQUE(`seriesId`)
);
