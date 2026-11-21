const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 1,
    },
    expenseDate: {
      type: Date,
      default: Date.now,
    },
    proof: {
      type: String,
      default: null,
    },
    notes: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

const Expense = mongoose.model("Expense", expenseSchema);

module.exports = Expense;
