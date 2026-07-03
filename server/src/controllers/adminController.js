const User = require("../models/User");
const AppError = require("../utilis/AppError");


const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    return res.status(200).json({ success: true, count: users.length, users });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllUsers };
