const Transaction = require('../models/Transaction');

const getTransactions = async (req, res) => {
  const transactions = await Transaction.find({ user: req.user._id }).sort('-createdAt');
  res.json(transactions);
};

const createTransaction = async (req, res) => {
  const { title, amount, type, status } = req.body;

  if (!title || !amount || !type) {
    return res.status(400).json({ message: 'Title, amount, and type are required.' });
  }

  const transaction = await Transaction.create({
    title,
    amount,
    type,
    status: status || 'pending',
    user: req.user._id,
  });

  res.status(201).json(transaction);
};

module.exports = {
  getTransactions,
  createTransaction,
};
