const mongoose = require("mongoose");

// Struktur komponen pilihan dalam bundling
const bundleComponentSchema = new mongoose.Schema({
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
  // Snapshot HPP komponen saat pesanan dibuat
  unitCostSnapshot: {
    type: Number,
    default: null,
    min: 0,
  },
  costSubtotalSnapshot: {
    type: Number,
    default: null,
    min: 0,
  },
});

// Struktur setiap barang dalam pesanan
const orderItemSchema = new mongoose.Schema({
  itemType: {
    type: String,
    enum: ["product", "bundle"],
    required: true,
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    default: null,
  },
  variantId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null,
  },
  bundle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Bundle",
    default: null,
  },
  bundleComponents: {
    type: [bundleComponentSchema],
    default: [],
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  unitPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  subtotal: {
    type: Number,
    required: true,
    min: 0,
  },
  // Snapshot HPP barang atau total HPP bundling
  unitCostSnapshot: {
    type: Number,
    default: null,
    min: 0,
  },
  costSubtotalSnapshot: {
    type: Number,
    default: null,
    min: 0,
  },
  costSnapshotStatus: {
    type: String,
    enum: ["complete", "incomplete"],
    default: "incomplete",
  },
});

// Struktur utama pesanan
const orderSchema = new mongoose.Schema(
  {
    orderCode: {
      type: String,
      required: true,
      unique: true,
    },
    buyerName: {
      type: String,
      required: true,
      trim: true,
    },
    buyerPhone: {
      type: String,
      required: true,
      trim: true,
    },
    buyerEmail: {
      type: String,
      trim: true,
      default: "",
    },
    items: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator: function (items) {
          return items.length > 0;
        },
        message: "Pesanan harus memiliki minimal satu barang",
      },
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: [
        "pending_payment",
        "waiting_verification",
        "paid",
        "rejected",
        "cancelled",
      ],
      default: "pending_payment",
    },
    paymentProof: {
      type: String,
      default: null,
    },
    reservedAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
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

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
