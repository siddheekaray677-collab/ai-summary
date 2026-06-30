const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config();

// Force Vercel bundler (NFT) to include PostgreSQL drivers in serverless environment
try {
  require('pg');
  require('pg-hstore');
} catch (e) {
  // Ignore local load warnings if not using postgres in certain environments
}

const databaseUrl = process.env.DATABASE_URL;
let sequelize;

if (databaseUrl && databaseUrl.startsWith('postgres')) {
  sequelize = new Sequelize(databaseUrl, {
    dialect: 'postgres',
    logging: false, // Set to console.log to see SQL queries in dev
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false // Required for Neon serverless PostgreSQL connection
      }
    },
    define: {
      timestamps: true
    }
  });
} else {
  const dbPath = process.env.DATABASE_PATH || './meetmind.sqlite';
  const absoluteDbPath = path.isAbsolute(dbPath) 
    ? dbPath 
    : path.join(__dirname, '..', dbPath);

  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: absoluteDbPath,
    logging: false, // Set to console.log to see SQL queries in dev
    define: {
      timestamps: true
    }
  });
}

module.exports = sequelize;
