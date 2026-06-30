const sequelize = require('../config/database');
const User = require('./user');
const Meeting = require('./meeting');
const Transcript = require('./transcript');
const Summary = require('./summary');
const ActionItem = require('./actionitem');
const Report = require('./report');
const Settings = require('./settings');

// User <-> Meeting
User.hasMany(Meeting, { foreignKey: 'userId', onDelete: 'CASCADE' });
Meeting.belongsTo(User, { foreignKey: 'userId' });

// Meeting <-> Transcript
Meeting.hasOne(Transcript, { foreignKey: 'meetingId', onDelete: 'CASCADE' });
Transcript.belongsTo(Meeting, { foreignKey: 'meetingId' });

// Meeting <-> Summary
Meeting.hasOne(Summary, { foreignKey: 'meetingId', onDelete: 'CASCADE' });
Summary.belongsTo(Meeting, { foreignKey: 'meetingId' });

// Meeting <-> ActionItem
Meeting.hasMany(ActionItem, { foreignKey: 'meetingId', onDelete: 'CASCADE' });
ActionItem.belongsTo(Meeting, { foreignKey: 'meetingId' });

// Meeting <-> Report
Meeting.hasMany(Report, { foreignKey: 'meetingId', onDelete: 'CASCADE' });
Report.belongsTo(Meeting, { foreignKey: 'meetingId' });

// User <-> Settings
User.hasOne(Settings, { foreignKey: 'userId', onDelete: 'CASCADE' });
Settings.belongsTo(User, { foreignKey: 'userId' });

// User <-> ActionItem
User.hasMany(ActionItem, { foreignKey: 'userId', onDelete: 'CASCADE' });
ActionItem.belongsTo(User, { foreignKey: 'userId' });

// User <-> Report
User.hasMany(Report, { foreignKey: 'userId', onDelete: 'CASCADE' });
Report.belongsTo(User, { foreignKey: 'userId' });

module.exports = {
  sequelize,
  User,
  Meeting,
  Transcript,
  Summary,
  ActionItem,
  Report,
  Settings
};
