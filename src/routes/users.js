import express from 'express';
import UserController from '../controllers/userController.js';
import auth from '../middlewares/auth.js';

const router = express.Router();

// Endpoint trả thông tin user đã đăng nhập
router.get('/profile', auth, (req, res) => {
  res.json({ user: req.user });
});

// Định tuyến cho User
router.get('/users', UserController.getAllUsers);          // GET /api/users
router.get('/users/:id', UserController.getUserById);      // GET /api/users/:id
router.post('/users', UserController.createUser);          // POST /api/users
router.put('/users/:id', UserController.updateUser);       // PUT /api/users/:id
router.delete('/users/:id', UserController.deleteUser);    // DELETE /api/users/:id

export default router;