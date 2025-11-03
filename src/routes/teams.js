import express from 'express';
import teamsController from '../controllers/teamsController.js';

const router = express.Router();
// Định tuyến cho Teams
router.get('/', teamsController.getAllTeams);          // GET /api/teams
router.get('/league/:leagueID', teamsController.getTeamsByLeague); // GET /api/teams/league/:leagueID
router.get('/:teamId/stats', teamsController.getStatsByTeamIdAndSeason); // GET /api/teams/:teamId/stats
router.get('/:name/search', teamsController.searchTeamsByName); // GET /api/teams/:name/search
router.post('/', teamsController.createTeam);          // POST /api/teams
router.put('/:id', teamsController.updateTeam);       // PUT /api/teams/:id
router.delete('/:id', teamsController.deleteTeam);    // DELETE /api/teams/:id
router.post('/import', teamsController.importTeamsFromLeague); // POST /api/teams/import-from-league
router.get('/:id', teamsController.getTeamById);     // GET /api/teams/:id

export default router;