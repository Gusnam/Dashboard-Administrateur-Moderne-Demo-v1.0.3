const { pool } = require('../config/db');
const { devTransactionOperations } = require('../config/devData');

const isDevMode = process.env.DEV_MODE === 'true';

const getTransactionsByUserId = async (userId) => {
  if (isDevMode) {
    return devTransactionOperations.getTransactionsByUserId(userId);
  }

  const [rows] = await pool.query(
    'SELECT id, title, amount, type, status, date, user_id, created_at, updated_at FROM transactions WHERE user_id = ? ORDER BY created_at DESC',
    [userId]
  );
  return rows;
};

const createTransaction = async ({ title, amount, type, status = 'pending', user_id }) => {
  if (isDevMode) {
    return devTransactionOperations.createTransaction({ title, amount, type, status, user_id });
  }

  const [result] = await pool.query(
    'INSERT INTO transactions (title, amount, type, status, user_id) VALUES (?, ?, ?, ?, ?)',
    [title, amount, type, status, user_id]
  );

  const [rows] = await pool.query(
    'SELECT id, title, amount, type, status, date, user_id, created_at, updated_at FROM transactions WHERE id = ?',
    [result.insertId]
  );
  return rows[0];
};

module.exports = {
  getTransactionsByUserId,
  createTransaction,
};
