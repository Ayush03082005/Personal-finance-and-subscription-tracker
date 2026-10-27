const express = require("express");
const router = express.Router();
const {
  getBudgets,
  createBudget,
  updateBudget,
  deleteBudget,
} = require("../controllers/budget.controller");
const { protect } = require("../middlewares/auth.middleware");

router.use(protect);

router.get("/", getBudgets);
router.post("/", createBudget);
router.put("/:id", updateBudget);
router.delete("/:id", deleteBudget);

module.exports = router;
