const express = require("express");
const router = express.Router();
const { resetDemoData } = require("../controllers/demo.controller");
const { protect } = require("../middlewares/auth.middleware");

router.post("/reset", protect, resetDemoData);

module.exports = router;
