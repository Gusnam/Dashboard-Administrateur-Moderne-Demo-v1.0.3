const User = require('../models/User');
const Transaction = require('../models/Transaction');

const getDashboardStats = async (req, res) => {
  const userCount = await User.countDocuments();
  const transactionCount = await Transaction.countDocuments();

  res.json({
    userCount,
    transactionCount,
    message: 'Basic dashboard statistics',
  });
};

module.exports = {
  getDashboardStats,
};
