const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Transcript = sequelize.define('Transcript', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  meetingId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  rawText: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  segments: {
    type: DataTypes.TEXT, // Store JSON string of array: [{ speaker: string, start: number, end: number, text: string }]
    allowNull: true
  }
});

module.exports = Transcript;
