-- Migration: add leagues_id column to teams and add foreign key
-- Run this SQL against your database (example using MySQL):

ALTER TABLE `teams`
  ADD COLUMN `leagues_id` INT(11) NULL AFTER `venue_id`;

ALTER TABLE `teams`
  ADD CONSTRAINT `fk_teams_leagues` FOREIGN KEY (`leagues_id`) REFERENCES `leagues`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE leagues
  ADD COLUMN country_id INT NULL;

ALTER TABLE leagues
  ADD CONSTRAINT fk_leagues_country
  FOREIGN KEY (country_id)
  REFERENCES countries(id)
  ON UPDATE CASCADE
  ON DELETE RESTRICT;