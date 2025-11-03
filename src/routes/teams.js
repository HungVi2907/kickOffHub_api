import express from 'express';
import teamsController from '../controllers/teamsController.js';

const router = express.Router();
// Định tuyến cho Teams
router.get('/', teamsController.getAllTeams);          // GET /api/teams
router.get('/:id', teamsController.getTeamById);     // GET /api/teams/:id
router.get('/:leagueID/teams', teamsController.getTeamsByLeague); // GET /api/teams/:leagueID/teams
router.post('/', teamsController.createTeam);          // POST /api/teams
router.put('/:id', teamsController.updateTeam);       // PUT /api/teams/:id
router.delete('/:id', teamsController.deleteTeam);    // DELETE /api/teams/:id

router.post('/import', teamsController.importTeamsFromLeague); // POST /api/teams/import-from-league
export default router;