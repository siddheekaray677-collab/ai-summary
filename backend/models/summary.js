const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Summary = sequelize.define('Summary', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  meetingId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  executiveSummary: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  keyPoints: {
    type: DataTypes.TEXT, // Store JSON array of key discussion points
    allowNull: true
  },
  decisions: {
    type: DataTypes.TEXT, // Store JSON array of decisions made
    allowNull: true
  },
  risks: {
    type: DataTypes.TEXT, // Store JSON array of risks identified
    allowNull: true
  },
  followUps: {
    type: DataTypes.TEXT, // Store JSON array of follow-up tasks
    allowNull: true
  },
  productivityScore: {
    type: DataTypes.INTEGER, // Meeting efficiency metric (e.g. 0-100)
    allowNull: false,
    defaultValue: 80
  },
  sentiment: {
    type: DataTypes.STRING, // Positive, Negative, Neutral, Collaborative, etc.
    allowNull: false,
    defaultValue: 'Neutral'
  },
  speakerInsights: {
    type: DataTypes.TEXT, // Store JSON containing speaking duration and metrics per speaker
    allowNull: true
  }
});

module.exports = Summary;
