const mongoose = require("mongoose");

// Struktur setiap barang dalam pembelian
const purchaseItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  variantId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  unitCost: {
    type: Number,
    required: true,
    min: 0,
  },
  subtotal: {
    type: Number,
    required: true,
    min: 0,
  },
});

// Struktur utama transaksi pembelian
const purchaseSchema = new mongoose.Schema(
  {
    supplierName: {
      type: String,
      required: true,
      trim: true,
    },
    purchaseDate: {
      type: Date,
      default: Date.now,
    },
    items: {
      type: [purchaseItemSchema],
      required: true,
      validate: {
        validator: function (items) {
          return items.length > 0;
        },
        message: "Pembelian harus memiliki minimal satu barang",
      },
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
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

const Purchase = mongoose.model("Purchase", purchaseSchema);

module.exports = Purchase;
