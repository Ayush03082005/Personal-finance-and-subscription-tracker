const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/\S+@\S+\.\S+/, "Please provide a valid email address"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
    },
    currency: {
      type: String,
      default: "$",
      enum: ["$", "€", "£", "₹", "¥", "C$", "A$"],
    },
    monthlyIncomeTarget: {
      type: Number,
      default: 5000,
      min: 0,
    },
    monthlyBudgetLimit: {
      type: Number,
      default: 3500,
      min: 0,
    },
    savingsGoalTarget: {
      type: Number,
      default: 1500,
      min: 0,
    },
    alertPreferences: {
      renewalNoticeDays: {
        type: Number,
        default: 3,
      },
      budgetWarningThreshold: {
        type: Number,
        default: 80, // percentage
      },
      enableAlerts: {
        type: Boolean,
        default: true,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password helper
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
