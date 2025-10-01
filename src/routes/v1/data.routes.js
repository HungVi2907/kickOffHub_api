// src/routes/v1/data.routes.js
const express = require('express');
const router = express.Router();
// const dataController = require('../controllers/dataController'); // Cần import controller sau này

// Ví dụ về một route test:
router.get('/test', (req, res) => {
    res.json({ message: 'Router is working!' });
});

// QUAN TRỌNG: Xuất (Export) Router bằng module.exports
module.exports = router;