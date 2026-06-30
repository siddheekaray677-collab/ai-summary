const { ActionItem, Meeting } = require('../models');

// Get all action items for the active user
const getActionItems = async (req, res) => {
  try {
    const { status, meetingId } = req.query;
    const whereClause = { userId: req.user.id };

    if (status && status !== 'All') {
      whereClause.status = status;
    }

    if (meetingId) {
      whereClause.meetingId = meetingId;
    }

    const actionItems = await ActionItem.findAll({
      where: whereClause,
      include: [
        {
          model: Meeting,
          attributes: ['title', 'category']
        }
      ],
      order: [['dueDate', 'ASC']]
    });

    res.json(actionItems);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error listing action items' });
  }
};

// Update an action item (status, progress, owner, due date)
const updateActionItem = async (req, res) => {
  try {
    const actionItem = await ActionItem.findOne({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!actionItem) {
      return res.status(404).json({ message: 'Action item not found' });
    }

    const { status, progress, owner, dueDate } = req.body;

    if (status !== undefined) {
      actionItem.status = status;
      if (status === 'completed') {
        actionItem.progress = 100;
      } else if (status === 'pending' && actionItem.progress === 100) {
        actionItem.progress = 0;
      }
    }
    
    if (progress !== undefined) {
      actionItem.progress = progress;
      if (progress === 100) {
        actionItem.status = 'completed';
      } else if (progress > 0 && actionItem.status === 'pending') {
        actionItem.status = 'in progress';
      } else if (progress === 0 && actionItem.status === 'in progress') {
        actionItem.status = 'pending';
      }
    }

    if (owner !== undefined) actionItem.owner = owner;
    if (dueDate !== undefined) actionItem.dueDate = dueDate;

    await actionItem.save();

    // Reload to get association details
    const updatedItem = await ActionItem.findByPk(actionItem.id, {
      include: [
        {
          model: Meeting,
          attributes: ['title', 'category']
        }
      ]
    });

    res.json({
      message: 'Action item updated successfully',
      actionItem: updatedItem
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error updating action item' });
  }
};

module.exports = {
  getActionItems,
  updateActionItem
};
