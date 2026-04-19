const bcrypt = require('bcryptjs');
const { findUserByEmail, createUser, updateUser } = require('../models/User');
const generateToken = require('../utils/generateToken');

const validateEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Le nom, l’email et le mot de passe sont requis.' });
  }

  if (!validateEmail(email)) {
    return res.status(400).json({ message: 'Format d’email invalide.' });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: 'Le mot de passe doit contenir au moins 6 caractères.' });
  }

  const existingUser = await findUserByEmail(email);
  if (existingUser) {
    return res.status(400).json({ message: 'Un utilisateur existe déjà avec cet email.' });
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

  res.status(400).json({ message: 'Impossible de créer l’utilisateur.' });
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email et mot de passe sont requis.' });
  }

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

  res.status(401).json({ message: 'Email ou mot de passe incorrect.' });
};

const resetPassword = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'L’email et le nouveau mot de passe sont requis.' });
  }

  if (!validateEmail(email)) {
    return res.status(400).json({ message: 'Format d’email invalide.' });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: 'Le mot de passe doit contenir au moins 6 caractères.' });
  }

  const user = await findUserByEmail(email);
  if (!user) {
    return res.status(200).json({ message: 'Si cet email existe, le mot de passe a été réinitialisé.' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  await updateUser(user.id, { password: hashedPassword });

  res.json({ message: 'Le mot de passe a été réinitialisé avec succès.' });
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
