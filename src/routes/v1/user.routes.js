const express = require('express');
const router = express.Router();
const { getAllUsers, addUser } = require('../../controllers/userController');

router.get('/users', getAllUsers);

router.post('/users', addUser);
module.exports = router;