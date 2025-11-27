import 'dotenv/config';
import sequelize from './src/config/database.js';
import app from './src/app.js';
import { ensurePopularFlagColumn } from './src/utils/ensureTeamsSchema.js';

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await ensurePopularFlagColumn();
    await sequelize.sync();
    console.log('Database synced successfully.');
    app.listen(PORT, () => {
      console.log(`Server đang chạy trên port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to start server:', error);
  }
}

startServer();
