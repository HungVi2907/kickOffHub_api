This folder contains SQL migration files for manual execution.

To apply the migration to add `leagues_id` to `teams` (MySQL example):

1. Backup your database.
2. Run the SQL file using the mysql client, e.g.:

   mysql -u <user> -p <database> < migrations/20251104-add-leagues_id-to-teams.sql

Or open the file and execute the statements in your DB admin tool.

If you use Sequelize migrations (umzug/sequelize-cli), convert this SQL into a proper migration script.
