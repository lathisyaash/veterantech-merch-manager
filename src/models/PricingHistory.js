const mongoose = require("mongoose");

const pricingHistorySchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    variantId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    design: {
      type: String,
      required: true,
    },
    size: {
      type: String,
      default: null,
    },
    color: {
      type: String,
      default: null,
    },
    previousPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    newPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    suggestedPrice: {
      type: Number,
      default: 0,
      min: 0,
    },
    markup: {
      type: Number,
      default: 0,
      min: 0,
    },
    decision: {
      type: String,
      enum: ["approved", "adjusted"],
      required: true,
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

const PricingHistory = mongoose.model("PricingHistory", pricingHistorySchema);

module.exports = PricingHistory;
