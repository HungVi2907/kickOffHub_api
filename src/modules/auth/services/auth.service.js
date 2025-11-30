import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { JWT_EXPIRES_IN, JWT_SECRET } from '../../../config/auth.js';
import {
  createUser,
  findUserByEmail,
  findUserByEmailWithPassword,
} from '../../users/repositories/users.repository.js';

function buildTokenPayload(user) {
  return { id: user.id, email: user.email };
}

function signToken(user) {
  return jwt.sign(buildTokenPayload(user), JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

function generateUsername(email) {
  const localPart = email.split('@')[0] || 'user';
  return `${localPart}_${Date.now()}`;
}

export async function registerUser(payload) {
  const existing = await findUserByEmail(payload.email);
  if (existing) {
    const error = new Error('EMAIL_EXISTS');
    error.statusCode = 409;
    throw error;
  }

  const user = await createUser({
    name: payload.name,
    email: payload.email,
    username: generateUsername(payload.email),
    password: payload.password,
  });

  const token = signToken(user);
  return { token, user: user.toJSON() };
}

export async function loginUser(payload) {
  const user = await findUserByEmailWithPassword(payload.email);
  if (!user) {
    const error = new Error('INVALID_CREDENTIALS');
    error.statusCode = 401;
    throw error;
  }

  const match = await bcrypt.compare(payload.password, user.password);
  if (!match) {
    const error = new Error('INVALID_CREDENTIALS');
    error.statusCode = 401;
    throw error;
  }

  const token = signToken(user);
  const sanitized = user.toJSON();
  return { token, user: sanitized };
}
