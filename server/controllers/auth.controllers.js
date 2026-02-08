import Admin from '../models/Admin.js';
import jwt from 'jsonwebtoken';

export async function handleAdminLogin(req, res) {
  const { username, password } = req.body;
  const admin = await Admin.findOne({ username });

  if (admin && (await admin.matchPassword(password))) {
    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, {expiresIn: "1h"});
    res.json({ token, username: admin.username });
  } else {
    res.status(401).json({ error: "Invalid username or password" });
  }
}

export async function handleAdminRegister(req, res) {
  try {
    const { username, password } = req.body;
    await Admin.create({ username, password });
    res.status(201).json({ message: "Admin created" });
  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({ error: error.message });
  }
}
