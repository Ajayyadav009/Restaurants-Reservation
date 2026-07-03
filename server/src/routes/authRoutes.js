const express = require("express");
const { register, login, getMe, logout, registerAdmin } = require("../controllers/authController");
const { authenticate } = require("../middlewares/auth");

const router = express.Router();


router.post("/register", register);


router.post("/register-admin", registerAdmin);


router.post("/login", login);


router.get("/me", authenticate, getMe);


router.post("/logout", logout);

module.exports = router;

