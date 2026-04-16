const { pool } = require('../config/db');

const getDashboardStats = async (req, res) => {
  const [userRows] = await pool.query('SELECT COUNT(*) AS totalUsers FROM users');
  const [transactionRows] = await pool.query('SELECT COUNT(*) AS totalTransactions, IFNULL(SUM(amount), 0) AS totalAmount FROM transactions');
  const [pendingRows] = await pool.query("SELECT COUNT(*) AS pendingTransactions FROM transactions WHERE status = 'pending'");

  res.json({
    totalUsers: userRows[0].totalUsers || 0,
    totalTransactions: transactionRows[0].totalTransactions || 0,
    totalTransactionAmount: parseFloat(transactionRows[0].totalAmount) || 0,
    pendingTransactions: pendingRows[0].pendingTransactions || 0,
  });
};

module.exports = {
  getDashboardStats,
};
