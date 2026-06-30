const { User, Meeting, Summary, ActionItem, Report } = require('../models');
const fs = require('fs');
const path = require('path');
const dbConfig = require('../config/database');

const getAdminStats = async (req, res) => {
  try {
    // Basic counts
    const totalUsers = await User.count();
    const totalMeetings = await Meeting.count();
    const totalSummaries = await Summary.count();
    const pendingActionItems = await ActionItem.count({ where: { status: 'pending' } });
    
    // Average productivity score
    const summaries = await Summary.findAll({ attributes: ['productivityScore'] });
    const avgProductivity = summaries.length > 0 
      ? Math.round(summaries.reduce((sum, s) => sum + s.productivityScore, 0) / summaries.length)
      : 85;

    // Database / Storage monitoring
    let storageSizeMb = 0.82; // Default mock footprint
    try {
      if (dbConfig.getDialect() === 'postgres') {
        const result = await dbConfig.query(
          "SELECT pg_database_size(current_database()) AS size_bytes",
          { type: dbConfig.QueryTypes.SELECT }
        );
        if (result && result.length > 0 && result[0].size_bytes) {
          const sizeBytes = parseInt(result[0].size_bytes, 10);
          storageSizeMb = Number((sizeBytes / (1024 * 1024)).toFixed(2));
        }
      } else {
        const dbPath = dbConfig.options.storage;
        if (dbPath && fs.existsSync(dbPath)) {
          const stats = fs.statSync(dbPath);
          storageSizeMb = Number((stats.size / (1024 * 1024)).toFixed(2));
        }
      }
    } catch (e) {
      console.error('Error reading database file size:', e);
    }

    // Add additional mock storage for uploaded media assets
    const mediaStorageMb = totalMeetings * 8.5; // Simulate 8.5 MB per meeting upload
    const totalStorageMb = Number((storageSizeMb + mediaStorageMb).toFixed(2));

    // Category distribution
    const meetingsByCategory = await Meeting.findAll({
      attributes: ['category', [Meeting.sequelize.fn('COUNT', Meeting.sequelize.col('id')), 'count']],
      group: ['category']
    });

    // Recent activity trends (last 7 days - simulated/calculated)
    const recentActivity = {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      meetings: [4, 6, 8, 5, 9, 2, 3],
      tokensUsed: [14200, 18900, 24000, 16100, 28500, 8900, 11000]
    };

    res.json({
      metrics: {
        totalUsers,
        totalMeetings,
        totalSummaries,
        pendingActionItems,
        avgProductivity,
        totalStorageMb,
        mediaStorageMb,
        dbStorageMb: storageSizeMb
      },
      categoryDistribution: meetingsByCategory,
      activityTrends: recentActivity
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error generating admin stats' });
  }
};

// List all users (admin-only)
const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']]
    });
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching user database list' });
  }
};

// List all meetings (admin-only)
const getAllMeetings = async (req, res) => {
  try {
    const meetings = await Meeting.findAll({
      include: [
        {
          model: User,
          attributes: ['name', 'email']
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json(meetings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error listing administrative meetings' });
  }
};

module.exports = {
  getAdminStats,
  getAllUsers,
  getAllMeetings
};
