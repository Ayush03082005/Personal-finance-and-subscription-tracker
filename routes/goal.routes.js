const express = require("express");
const router = express.Router();
const {
  getGoals,
  createGoal,
  updateGoal,
  depositToGoal,
  deleteGoal,
} = require("../controllers/goal.controller");
const { protect } = require("../middlewares/auth.middleware");

router.use(protect);

router.get("/", getGoals);
router.post("/", createGoal);
router.put("/:id", updateGoal);
router.post("/:id/deposit", depositToGoal);
router.delete("/:id", deleteGoal);

module.exports = router;
