const dotenv = require('dotenv');

// Load environment variables FIRST, before any other requires
dotenv.config();

const app = require('./app');
const { checkDBConnection } = require('./config/db');
const { initializeDatabase } = require('./config/initDb');

const PORT = process.env.PORT || 5000;
const isDevMode = process.env.DEV_MODE === 'true';

const startServer = async () => {
  try {
    if (isDevMode) {
      console.log('Starting server in DEV MODE...');
    }

    await initializeDatabase();
    await checkDBConnection();

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      if (isDevMode) {
        console.log('DEV MODE: Using in-memory data (not connected to MySQL)');
      }
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
