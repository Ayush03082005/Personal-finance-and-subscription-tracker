const express = require("express");
const router = express.Router();
const {
  getTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  exportTransactionsCSV,
} = require("../controllers/transaction.controller");
const { protect } = require("../middlewares/auth.middleware");

router.use(protect);

router.get("/", getTransactions);
router.get("/export/csv", exportTransactionsCSV);
router.get("/:id", getTransactionById);
router.post("/", createTransaction);
router.put("/:id", updateTransaction);
router.delete("/:id", deleteTransaction);

module.exports = router;
