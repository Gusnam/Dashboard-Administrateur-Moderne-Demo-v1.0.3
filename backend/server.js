const dotenv = require('dotenv');
const app = require('./app');
const { checkDBConnection } = require('./config/db');
const { initializeDatabase } = require('./config/initDb');

dotenv.config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await initializeDatabase();
    await checkDBConnection();

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
