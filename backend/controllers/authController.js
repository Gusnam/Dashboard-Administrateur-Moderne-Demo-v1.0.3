const bcrypt = require('bcryptjs');
const { findUserByEmail, createUser, updateUser } = require('../models/User');
const generateToken = require('../utils/generateToken');

const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required.' });
  }

  const existingUser = await findUserByEmail(email);
  if (existingUser) {
    return res.status(400).json({ message: 'User already exists with that email.' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await createUser({ name, email, password: hashedPassword });

  if (user) {
    return res.status(201).json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user.id),
    });
  }

  res.status(400).json({ message: 'Unable to create user.' });
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  const user = await findUserByEmail(email);
  if (user && (await bcrypt.compare(password, user.password))) {
    return res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user.id),
    });
  }

  res.status(401).json({ message: 'Invalid email or password.' });
};

const resetPassword = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and new password are required.' });
  }

  const user = await findUserByEmail(email);
  if (!user) {
    return res.status(200).json({ message: 'If this email exists, the password was reset successfully.' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  await updateUser(user.id, { password: hashedPassword });

  res.json({ message: 'Password has been reset successfully.' });
};

const getCurrentUser = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authorized.' });
  }

  res.json({
    id: req.user.id,
    name: req.user.name,
    email: req.user.email,
    role: req.user.role,
  });
};

module.exports = {
  registerUser,
  loginUser,
  resetPassword,
  getCurrentUser,
};
