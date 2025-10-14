//create sql connection
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'postgres-1.cm6stysu1no9.us-east-2.rds.amazonaws.com',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Matrixtate',
  database: process.env.DB_DATABASE || 'postgres',
  port: 5432,
  ssl: {
    rejectUnauthorized: false
  }
});

pool.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Connected to the database!');
});

module.exports = pool;