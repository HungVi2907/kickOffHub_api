/**
 * =============================================================================
 * FILE: src/modules/auth/routes/auth.routes.js
 * =============================================================================
 * 
 * @fileoverview Authentication API Routes
 * 
 * @description
 * Định nghĩa Express routes cho authentication endpoints.
 * Bao gồm Swagger/OpenAPI documentation cho từng endpoint.
 * 
 * ## Endpoints:
 * | Method | Path           | Description          | Auth |
 * |--------|----------------|----------------------|------|
 * | POST   | /auth/register | User registration    | No   |
 * | POST   | /auth/login    | User authentication  | No   |
 * 
 * ## Middleware Chain:
 * 1. validateSchema - Zod validation
 * 2. AuthController - Handler
 * 
 * @module modules/auth/routes/auth.routes
 * @requires express
 * @requires middlewares/validateSchema
 * @requires modules/auth/controllers/auth.controller
 * @requires modules/auth/validation/auth.validation
 * 
 * =============================================================================
 */

import { Router } from 'express';
import { validateSchema } from '../../../middlewares/validateSchema.js';
import AuthController from '../controllers/auth.controller.js';
import { loginSchema, registerSchema } from '../validation/auth.validation.js';

const router = Router();

/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     summary: Register a user
 *     description: Creates a new user account and returns a token plus profile metadata.
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 description: Full name.
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 6
 *           example:
 *             name: "Jane Doe"
 *             email: "jane@example.com"
 *             password: "secret123"
 *     responses:
 *       201:
 *         description: User registered successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   additionalProperties: true
 *             example:
 *               success: true
 *               message: "Đăng ký thành công"
 *               data:
 *                 token: "jwt-token"
 *                 userId: 1
 *       400:
 *         description: Bad request – validation failed.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   nullable: true
 *             example:
 *               success: false
 *               message: "Email is invalid"
 *               data: null
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   nullable: true
 *             example:
 *               success: false
 *               message: "Unexpected error"
 *               data: null
 */
router.post('/auth/register', validateSchema(registerSchema), AuthController.register);

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     summary: Login
 *     description: Authenticates an existing user and returns a JWT plus profile information.
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *           example:
 *             email: "jane@example.com"
 *             password: "secret123"
 *     responses:
 *       200:
 *         description: Login successful.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   additionalProperties: true
 *             example:
 *               success: true
 *               message: "Login successful"
 *               data:
 *                 token: "jwt-token"
 *       400:
 *         description: Bad request – validation error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   nullable: true
 *             example:
 *               success: false
 *               message: "Email is invalid"
 *               data: null
 *       500:
 *         description: Internal server error during authentication.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   nullable: true
 *             example:
 *               success: false
 *               message: "Unexpected error"
 *               data: null
 */
router.post('/auth/login', validateSchema(loginSchema), AuthController.login);

export default router;
