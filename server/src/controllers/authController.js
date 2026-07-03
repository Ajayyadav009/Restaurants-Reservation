const jwt = require("jsonwebtoken");
const User = require("../models/User");
const AppError = require("../utilis/AppError");
const { validateRegister, validateLogin, validateRegisterAdmin } = require("../validators/authValidator");


const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};


const sendTokenResponse = (res, statusCode, user, token) => {
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, 
  });

  return res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
};


const register = async (req, res, next) => {
  try {
    const { isValid, errors } = validateRegister(req.body);
    if (!isValid) {
      return next(new AppError("Validation failed", 400, errors));
    }

    const { name, email, password } = req.body;

    
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return next(new AppError("An account with that email already exists", 409));
    }

    const user = await User.create({ name: name.trim(), email: email.toLowerCase().trim(), password });
    const token = signToken(user._id);

    return sendTokenResponse(res, 201, user, token);
  } catch (error) {
    next(error);
  }
};


const login = async (req, res, next) => {
  try {
    const { isValid, errors } = validateLogin(req.body);
    if (!isValid) {
      return next(new AppError("Validation failed", 400, errors));
    }

    const { email, password } = req.body;

    
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select("+password");
    if (!user) {
      return next(new AppError("Invalid email or password", 401));
    }

    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      return next(new AppError("Invalid email or password", 401));
    }

    const token = signToken(user._id);
    return sendTokenResponse(res, 200, user, token);
  } catch (error) {
    next(error);
  }
};


const getMe = async (req, res, next) => {
  try {
    return res.status(200).json({
      success: true,
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};


const logout = (req, res) => {
  res.cookie("token", "", {
    httpOnly: true,
    expires: new Date(0),
  });
  return res.status(200).json({ success: true, message: "Logged out successfully" });
};


const registerAdmin = async (req, res, next) => {
  try {
    const { isValid, errors } = validateRegisterAdmin(req.body);
    if (!isValid) {
      return next(new AppError("Validation failed", 400, errors));
    }

    const { name, email, password, adminSecret } = req.body;

    
    const expectedSecret = process.env.ADMIN_SECRET;
    if (!expectedSecret) {
      return next(new AppError("Admin registration is not configured on this server", 503));
    }
    if (adminSecret.trim() !== expectedSecret) {
      return next(new AppError("Invalid admin secret key", 403));
    }

    
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return next(new AppError("An account with that email already exists", 409));
    }

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: "admin",
    });

    const token = signToken(user._id);
    return sendTokenResponse(res, 201, user, token);
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, getMe, logout, registerAdmin };

