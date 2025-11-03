import express from 'express';
import UserController from '../controllers/userController.js';

const router = express.Router();

// Định tuyến cho User
router.get('/users', UserController.getAllUsers);          // GET /api/users
router.get('/users/:id', UserController.getUserById);      // GET /api/users/:id
router.post('/users', UserController.createUser);          // POST /api/users
router.put('/users/:id', UserController.updateUser);       // PUT /api/users/:id
router.delete('/users/:id', UserController.deleteUser);    // DELETE /api/users/:id

export default router;