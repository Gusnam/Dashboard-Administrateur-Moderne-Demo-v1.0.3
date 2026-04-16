const User = require('../models/User');

const getAllUsers = async (req, res) => {
  const users = await User.find({}).select('-password');
  res.json(users);
};

const getUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  if (!user) {
    return res.status(404).json({ message: 'User not found.' });
  }
  res.json(user);
};

const updateUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    return res.status(404).json({ message: 'User not found.' });
  }

  user.name = req.body.name || user.name;
  user.email = req.body.email || user.email;
  if (req.body.password) {
    user.password = req.body.password;
  }

  const updatedUser = await user.save();
  res.json({
    id: updatedUser._id,
    name: updatedUser.name,
    email: updatedUser.email,
    role: updatedUser.role,
  });
};

module.exports = {
  getAllUsers,
  getUserProfile,
  updateUserProfile,
};
