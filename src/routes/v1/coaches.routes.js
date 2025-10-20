const express = require('express');
const router = express.Router();
const { coachesController } = require('../../controllers');

router.get('/', coachesController.listCoaches);
router.get('/:coachId', coachesController.getCoachById);
router.post('/', coachesController.createCoach);
router.put('/:coachId', coachesController.updateCoach);
router.delete('/:coachId', coachesController.deleteCoach);
router.post('/sync/api-football', coachesController.syncCoachesFromApi);

module.exports = router;
