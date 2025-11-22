import express from 'express';
import { body } from 'express-validator';
import UserController from '../controllers/userController.js';
import validateRequest from '../middlewares/validateRequest.js';

const router = express.Router();

router.post(
	'/auth/register',
	[
		body('name').trim().notEmpty().withMessage('Tên không được để trống'),
		body('email').trim().isEmail().withMessage('Email không hợp lệ'),
		body('password').isLength({ min: 6 }).withMessage('Mật khẩu phải có ít nhất 6 ký tự')
	],
	validateRequest,
	UserController.register
);

router.post(
	'/auth/login',
	[
		body('email').trim().isEmail().withMessage('Email không hợp lệ'),
		body('password').notEmpty().withMessage('Mật khẩu không được bỏ trống')
	],
	validateRequest,
	UserController.login
);

export default router;