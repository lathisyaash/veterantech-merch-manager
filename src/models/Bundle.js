const mongoose = require("mongoose");

// Struktur komponen dalam bundling
const componentSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  variantOptions: [
    {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
  ],
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1,
  },
});

// Struktur utama bundling
const bundleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    components: {
      type: [componentSchema],
      required: true,
    },
    sellingPrice: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: true,
  },
);

const Bundle = mongoose.model("Bundle", bundleSchema);

module.exports = Bundle;
