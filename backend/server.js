const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '../.env') });
dotenv.config();

const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

// Initialize Database connection
connectDB();

// Start HTTP Server
const server = app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`  Smart Cheating Detection Server Active`);
  console.log(`  Port: ${PORT}`);
  console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`  Faculty Auth Enforcement: Active`);
  console.log(`=======================================================`);
});

// Unhandled Promise Rejection handling
process.on('unhandledRejection', (err) => {
  console.error('[Unhandled Promise Rejection]:', err.message);
});
