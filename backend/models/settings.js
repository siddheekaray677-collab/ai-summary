const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Settings = sequelize.define('Settings', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true
  },
  theme: {
    type: DataTypes.STRING,
    defaultValue: 'dark' // 'light' or 'dark'
  },
  emailNotifications: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  aiModel: {
    type: DataTypes.STRING,
    defaultValue: 'MeetMind AI v2 (Default)'
  },
  language: {
    type: DataTypes.STRING,
    defaultValue: 'English'
  }
});

module.exports = Settings;
