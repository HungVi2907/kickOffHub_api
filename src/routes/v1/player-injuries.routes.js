const express = require('express');
const router = express.Router();
const { playerInjuriesController } = require('../../controllers');

router.get('/', playerInjuriesController.listPlayerInjuries);
router.get('/:injuryId', playerInjuriesController.getPlayerInjuryById);
router.post('/', playerInjuriesController.createPlayerInjury);
router.put('/:injuryId', playerInjuriesController.updatePlayerInjury);
router.delete('/:injuryId', playerInjuriesController.deletePlayerInjury);

module.exports = router;
