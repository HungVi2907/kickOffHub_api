import {
  createUser,
  deleteUserById,
  findAllUsers,
  findUserByEmail,
  findUserById,
  updateUserById,
} from '../repositories/users.repository.js';

function parseUserId(rawId) {
  const parsed = Number.parseInt(rawId, 10);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    const error = new Error('USER_ID_INVALID');
    error.statusCode = 400;
    throw error;
  }
  return parsed;
}

export async function listUsers() {
  return findAllUsers();
}

export async function getUserById(idRaw) {
  const id = parseUserId(idRaw);
  const user = await findUserById(id);
  if (!user) {
    const error = new Error('USER_NOT_FOUND');
    error.statusCode = 404;
    throw error;
  }
  return user;
}

export async function createUserRecord(payload) {
  const existing = await findUserByEmail(payload.email);
  if (existing) {
    const error = new Error('EMAIL_EXISTS');
    error.statusCode = 409;
    throw error;
  }
  return createUser(payload);
}

export async function updateUserRecord(idRaw, payload) {
  const id = parseUserId(idRaw);
  const affected = await updateUserById(id, payload);
  if (!affected) {
    const error = new Error('USER_NOT_FOUND');
    error.statusCode = 404;
    throw error;
  }
  return findUserById(id);
}

export async function removeUser(idRaw) {
  const id = parseUserId(idRaw);
  const removed = await deleteUserById(id);
  if (!removed) {
    const error = new Error('USER_NOT_FOUND');
    error.statusCode = 404;
    throw error;
  }
  return true;
}
