const express = require('express');
const router = express.Router();
const { coachTeamHistoryController } = require('../../controllers');

router.get('/', coachTeamHistoryController.listCoachTeamHistory);
router.get('/:historyId', coachTeamHistoryController.getCoachTeamHistoryEntry);
router.post('/', coachTeamHistoryController.createCoachTeamHistoryEntry);
router.put('/:historyId', coachTeamHistoryController.updateCoachTeamHistoryEntry);
router.delete('/:historyId', coachTeamHistoryController.deleteCoachTeamHistoryEntry);

module.exports = router;
