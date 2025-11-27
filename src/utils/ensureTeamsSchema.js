import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

/**
 * Ensure the legacy `teams` table has the `is_popular` column required by the ORM model.
 * Older database dumps created the table without this column, which breaks queries
 * filtering by `isPopular`. This helper adds the column once if it is missing.
 */
export async function ensurePopularFlagColumn() {
  const queryInterface = sequelize.getQueryInterface();
  const tableName = 'teams';

  try {
    const columns = await queryInterface.describeTable(tableName);
    const hasSnakeCase = Object.prototype.hasOwnProperty.call(columns, 'is_popular');
    const hasCamelCase = Object.prototype.hasOwnProperty.call(columns, 'isPopular');

    if (!hasSnakeCase && !hasCamelCase) {
      await queryInterface.addColumn(tableName, 'is_popular', {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        after: 'venue_id'
      });
      console.log('Added missing is_popular column to teams table.');
    }
  } catch (error) {
    console.error('Failed to verify or add teams.is_popular column:', error);
    throw error;
  }
}
