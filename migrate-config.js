require('dotenv').config();

module.exports = {
  databaseUrl: process.env.DATABASE_URL || `postgres://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT || 5432}/${process.env.DB_DATABASE}`,
  dir: 'migrations',
  migrationsTable: 'pgmigrations',
  direction: 'up',
  ssl: {
    rejectUnauthorized: false
  }
};