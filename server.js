<<<<<<< HEAD
import 'dotenv/config'
import sequelize from './src/config/database.js'
import app from './src/app.js'
import { ensurePopularFlagColumn } from './src/utils/ensureTeamsSchema.js'
import { ensurePostImageColumn } from './src/utils/ensurePostsSchema.js'
=======
import 'dotenv/config'
import sequelize from './src/config/database.js'
import app from './src/app.js'
import { ensurePostImageColumn } from './src/utils/ensurePostsSchema.js'
    await ensurePopularFlagColumn()
    await sequelize.sync()
    await ensurePostImageColumn()
    console.log('Database synced successfully.')
    app.listen(PORT, () => {
      console.log(`Server đang chạy trên port ${PORT}`)
    })
<<<<<<< HEAD
    console.error('Unable to initialize database schema:', error)
    process.exit(1)
    await sequelize.sync();
    console.log('Database synced successfully.');
    app.listen(PORT, () => {
startServer()
    });
  } catch (error) {
    console.error('Unable to start server:', error);
  }
}

startServer();
=======
    await sequelize.sync()
    await ensurePostImageColumn()
    console.log('Database synced successfully.')
    app.listen(PORT, () => {
      console.log(`Server đang chạy trên port ${PORT}`)
    })
  } catch (error) {
    console.error('Unable to initialize database schema:', error)
    process.exit(1)
  }
}

startServer()
>>>>>>> ea9770b (Update search, image in post, time)
