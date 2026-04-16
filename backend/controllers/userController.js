const bcrypt = require('bcryptjs');
const {
  findAllUsers,
  findUserById,
  findUserByEmail,
  updateUser,
} = require('../models/User');

const getAllUsers = async (req, res) => {
  const users = await findAllUsers();
  res.json(users);
};

const getUserProfile = async (req, res) => {
  const user = await findUserById(req.user.id);
  if (!user) {
    return res.status(404).json({ message: 'User not found.' });
  }
  res.json(user);
};

const updateUserProfile = async (req, res) => {
  const user = await findUserById(req.user.id);
  if (!user) {
    return res.status(404).json({ message: 'User not found.' });
  }

  if (req.body.email && req.body.email !== user.email) {
    const emailTaken = await findUserByEmail(req.body.email);
    if (emailTaken && emailTaken.id !== req.user.id) {
      return res.status(400).json({ message: 'Email is already in use.' });
    }
  }

  const updates = {
    name: req.body.name || user.name,
    email: req.body.email || user.email,
  };

  if (req.body.password) {
    updates.password = await bcrypt.hash(req.body.password, 10);
  }

  const updatedUser = await updateUser(req.user.id, updates);
  res.json({
    id: updatedUser.id,
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
