const { pool } = require('../config/db');

const findUserByEmail = async (email) => {
  const [rows] = await pool.query(
    'SELECT id, name, email, password, role, created_at, updated_at FROM users WHERE email = ?',
    [email]
  );
  return rows[0];
};

const findUserById = async (id) => {
  const [rows] = await pool.query(
    'SELECT id, name, email, role, created_at, updated_at FROM users WHERE id = ?',
    [id]
  );
  return rows[0];
};

const findAllUsers = async () => {
  const [rows] = await pool.query(
    'SELECT id, name, email, role, created_at, updated_at FROM users ORDER BY id DESC'
  );
  return rows;
};

const createUser = async ({ name, email, password, role = 'user' }) => {
  const [result] = await pool.query(
    'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
    [name, email, password, role]
  );

  return {
    id: result.insertId,
    name,
    email,
    role,
  };
};

const updateUser = async (id, updates) => {
  const fields = [];
  const values = [];

  if (updates.name) {
    fields.push('name = ?');
    values.push(updates.name);
  }
  if (updates.email) {
    fields.push('email = ?');
    values.push(updates.email);
  }
  if (updates.password) {
    fields.push('password = ?');
    values.push(updates.password);
  }
  if (updates.role) {
    fields.push('role = ?');
    values.push(updates.role);
  }

  if (fields.length === 0) {
    return findUserById(id);
  }

  values.push(id);
  await pool.query(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, values);
  return findUserById(id);
};

module.exports = {
  findUserByEmail,
  findUserById,
  findAllUsers,
  createUser,
  updateUser,
};
