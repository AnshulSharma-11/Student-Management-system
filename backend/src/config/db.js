const mysql = require('mysql2/promise');

// Create a connection pool for better performance and resource management
const pool = mysql.createPool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     parseInt(process.env.DB_PORT) || 3306,
  user:     process.env.DB_USER     || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME     || 'student_management',
  waitForConnections: true,
  connectionLimit:    10,        // max simultaneous connections
  queueLimit:         0,         // unlimited queued requests
  charset:            'utf8mb4', // full Unicode support
});

// Verify connection on startup
async function testConnection() {
  try {
    const conn = await pool.getConnection();
    console.log('✅  MySQL connected successfully');
    conn.release();
  } catch (err) {
    console.error('❌  MySQL connection failed:', err.message);
    process.exit(1); // abort if DB is unavailable
  }
}

module.exports = { pool, testConnection };
