import express from 'express';
import TagsController from '../controllers/tagsController.js';

const router = express.Router();

router.get('/tags', TagsController.list);

export default router;
