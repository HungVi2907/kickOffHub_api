import User from '../models/user.model.js';

export function findAllUsers() {
  return User.findAll();
}

export function findUserById(id) {
  return User.findByPk(id);
}

export function findUserByEmail(email) {
  return User.findOne({ where: { email } });
}

export function findUserByEmailWithPassword(email) {
  return User.scope(null).findOne({ where: { email } });
}

export function createUser(payload) {
  return User.create(payload);
}

export async function updateUserById(id, payload) {
  const [affected] = await User.update(payload, { where: { id } });
  return affected;
}

export function deleteUserById(id) {
  return User.destroy({ where: { id } });
}
