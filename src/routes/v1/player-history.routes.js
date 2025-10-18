const express = require('express');
const router = express.Router();
const { playerHistoryController } = require('../../controllers');

router.get('/', playerHistoryController.listPlayerHistory);
router.get('/:historyId', playerHistoryController.getPlayerHistoryEntry);
router.post('/', playerHistoryController.createPlayerHistoryEntry);
router.put('/:historyId', playerHistoryController.updatePlayerHistoryEntry);
router.delete('/:historyId', playerHistoryController.deletePlayerHistoryEntry);

module.exports = router;
