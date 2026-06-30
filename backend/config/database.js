const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config();

const dbPath = process.env.DATABASE_PATH || './meetmind.sqlite';
const absoluteDbPath = path.isAbsolute(dbPath) 
  ? dbPath 
  : path.join(__dirname, '..', dbPath);

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: absoluteDbPath,
  logging: false, // Set to console.log to see SQL queries in dev
  define: {
    timestamps: true
  }
});

module.exports = sequelize;
