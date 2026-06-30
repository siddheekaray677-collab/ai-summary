const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Report = sequelize.define('Report', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  meetingId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('pdf', 'docx', 'txt'),
    allowNull: false
  },
  filePath: {
    type: DataTypes.STRING,
    allowNull: true
  },
  userId: {
    type: DataTypes.STRING,
    allowNull: false
  }
});

module.exports = Report;
