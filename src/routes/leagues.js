import express from 'express';
import LeaguesController from '../controllers/leaguesController.js';

const router = express.Router();

// Định tuyến cho Leagues
router.get('/', LeaguesController.getAllLeagues);          // GET /api/leagues
router.get('/:id', LeaguesController.getLeagueById);      // GET /api/leagues/:id
router.post('/', LeaguesController.createLeague);          // POST /api/leagues
router.put('/:id', LeaguesController.updateLeague);       // PUT /api/leagues/:id
router.delete('/:id', LeaguesController.deleteLeague);    // DELETE /api/leagues/:id

export default router;