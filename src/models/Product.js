const mongoose = require("mongoose");

// Struktur varian produk
const variantSchema = new mongoose.Schema({
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
  stock: {
    type: Number,
    default: 0,
    min: 0,
  },
  reservedStock: {
    type: Number,
    default: 0,
    min: 0,
  },
  averageCost: {
    type: Number,
    default: 0,
    min: 0,
  },
  markup: {
    type: Number,
    default: 0,
    min: 0,
  },
  suggestedPrice: {
    type: Number,
    default: 0,
    min: 0,
  },
  pricingStatus: {
    type: String,
    enum: ["pending", "approved", "adjusted"],
    default: "approved",
  },
  pricingNotes: {
    type: String,
    default: "",
  },
  sellingPrice: {
    type: Number,
    required: true,
    min: 0,
  },
});

// Struktur utama produk
const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    variants: {
      type: [variantSchema],
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const Product =
  mongoose.models.Product || mongoose.model("Product", productSchema);

module.exports = Product;
