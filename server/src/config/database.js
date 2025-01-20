const mongoose = require('mongoose');
const { log } = require('../utils/logger');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    log('DATABASE', '✓ Connected:', conn.connection.host);
  } catch (error) {
    log('DATABASE', '✗ Error:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
