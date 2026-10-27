const express = require("express");
const router = express.Router();
const {
  getFinancialSummary,
  getSmartInsights,
  getCashflowForecast,
} = require("../controllers/analytics.controller");
const { protect } = require("../middlewares/auth.middleware");

router.use(protect);

router.get("/summary", getFinancialSummary);
router.get("/insights", getSmartInsights);
router.get("/cashflow", getCashflowForecast);

module.exports = router;
