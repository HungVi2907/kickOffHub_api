-- table countries
CREATE TABLE `countries` (
   `id` int(11) NOT NULL AUTO_INCREMENT,
   `name` varchar(255) NOT NULL,
   `code` varchar(10) DEFAULT NULL,
   `flag` varchar(255) DEFAULT NULL,
   `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
   `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
   PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
   UNIQUE KEY `name` (`name`)
 ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=30001;

-- table leagues
 CREATE TABLE `leagues` (
   `id` int(11) NOT NULL,
   `name` varchar(255) NOT NULL,
   `type` varchar(10) DEFAULT NULL,
   `logo` varchar(255) DEFAULT NULL,
   `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
   `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
   `country_id` int(11) DEFAULT NULL,
   PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
   UNIQUE KEY `name` (`name`),
   KEY `fk_leagues_country` (`country_id`),
   CONSTRAINT `fk_leagues_country` FOREIGN KEY (`country_id`) REFERENCES `kick_off_hub_db`.`countries` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
 ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

-- table seasons
 CREATE TABLE `seasons` (
   `season` int(11) DEFAULT NULL
 ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;


-- table teams
 CREATE TABLE `teams` (
   `id` int(11) NOT NULL,
   `name` varchar(255) NOT NULL,
   `code` varchar(10) DEFAULT NULL,
   `country` varchar(255) DEFAULT NULL,
   `founded` int(11) DEFAULT NULL,
   `national` tinyint(1) DEFAULT '0',
   `logo` varchar(255) DEFAULT NULL,
   `venue_id` int(11) DEFAULT NULL,
   `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
   `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
   PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
   KEY `fk_1` (`venue_id`)
 ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;


-- table venues
 CREATE TABLE `venues` (
   `id` int(11) NOT NULL,
   `name` varchar(255) DEFAULT NULL,
   `address` varchar(255) DEFAULT NULL,
   `city` varchar(255) DEFAULT NULL,
   `capacity` int(11) DEFAULT NULL,
   `surface` varchar(50) DEFAULT NULL,
   `image` varchar(255) DEFAULT NULL,
   `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
   `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
   PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */
 ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

-- table leagues_teams_season
 CREATE TABLE `leagues_teams_season` (
   `league_id` int(11) DEFAULT NULL,
   `team_id` int(11) DEFAULT NULL,
   `season` int(11) DEFAULT NULL
 ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

-- table users
 CREATE TABLE `users` (
   `id` int(11) NOT NULL AUTO_INCREMENT,
   `name` varchar(255) NOT NULL,
   `email` varchar(255) NOT NULL,
   `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
   `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
   PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
   UNIQUE KEY `email` (`email`)
 ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=30001