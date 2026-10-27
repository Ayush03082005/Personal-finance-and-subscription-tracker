const express = require("express");
const router = express.Router();
const {
  getSubscriptions,
  getUpcomingRenewals,
  getSubscriptionById,
  createSubscription,
  updateSubscription,
  toggleSubscriptionStatus,
  deleteSubscription,
  logRenewalAsTransaction,
} = require("../controllers/subscription.controller");
const { protect } = require("../middlewares/auth.middleware");

router.use(protect);

router.get("/", getSubscriptions);
router.get("/upcoming", getUpcomingRenewals);
router.get("/:id", getSubscriptionById);
router.post("/", createSubscription);
router.put("/:id", updateSubscription);
router.patch("/:id/status", toggleSubscriptionStatus);
router.post("/:id/log-payment", logRenewalAsTransaction);
router.delete("/:id", deleteSubscription);

module.exports = router;
