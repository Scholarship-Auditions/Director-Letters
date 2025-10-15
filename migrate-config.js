require('dotenv').config();

module.exports = {
  // By defining the connection properties individually, node-pg-migrate
  // will correctly apply the 'ssl' object below.
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,

  dir: 'migrations',
  migrationsTable: 'pgmigrations',
  direction: 'up',

  // This setting will now be applied correctly.
  ssl: {
    rejectUnauthorized: false
  }
};