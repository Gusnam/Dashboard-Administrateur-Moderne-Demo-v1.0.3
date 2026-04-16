const { getTransactionsByUserId, createTransaction: createTransactionRecord } = require('../models/Transaction');

const getTransactions = async (req, res) => {
  const transactions = await getTransactionsByUserId(req.user.id);
  res.json(transactions);
};

const createTransaction = async (req, res) => {
  const { title, amount, type, status } = req.body;

  if (!title || !amount || !type) {
    return res.status(400).json({ message: 'Title, amount, and type are required.' });
  }

  const transaction = await createTransactionRecord({
    title,
    amount: Number(amount),
    type,
    status: status || 'pending',
    user_id: req.user.id,
  });

  res.status(201).json(transaction);
};

module.exports = {
  getTransactions,
  createTransaction,
};
