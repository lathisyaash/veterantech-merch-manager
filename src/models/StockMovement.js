const mongoose = require("mongoose");

const stockMovementSchema = new mongoose.Schema(
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
    type: {
      type: String,
      enum: ["in", "out", "adjustment"],
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    stockBefore: {
      type: Number,
      required: true,
      min: 0,
    },
    stockAfter: {
      type: Number,
      required: true,
      min: 0,
    },
    source: {
      type: String,
      enum: ["purchase", "sale", "manual"],
      required: true,
    },
    referenceId: {
      type: mongoose.Schema.Types.ObjectId,
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

const StockMovement = mongoose.model("StockMovement", stockMovementSchema);

module.exports = StockMovement;
