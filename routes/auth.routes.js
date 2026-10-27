const express = require("express");
const router = express.Router();
const {
  register,
  login,
  demoLogin,
  logout,
  getMe,
  updateProfile,
} = require("../controllers/auth.controller");
const { protect } = require("../middlewares/auth.middleware");

router.post("/register", register);
router.post("/login", login);
router.post("/demo", demoLogin);
router.post("/logout", logout);
router.get("/me", protect, getMe);
router.put("/profile", protect, updateProfile);

module.exports = router;
