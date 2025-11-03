import 'dotenv/config';
import sequelize from './src/config/database.js';
import app from './src/app.js';

const PORT = process.env.PORT || 3000;

// Sync database và khởi động server
sequelize.sync().then(() => {
  console.log('Database synced successfully.');
  app.listen(PORT, () => {
    console.log(`Server đang chạy trên port ${PORT}`);
  });
}).catch((error) => {
  console.error('Unable to sync database:', error);
});
