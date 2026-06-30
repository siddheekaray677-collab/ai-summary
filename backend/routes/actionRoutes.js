const express = require('express');
const router = express.Router();
const { getActionItems, updateActionItem } = require('../controllers/actionController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getActionItems);
router.put('/:id', protect, updateActionItem);

module.exports = router;
