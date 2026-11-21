const express = require("express");
const mongoose = require("mongoose");
const fs = require("fs");

const router = express.Router();

const Order = require("../models/Order");
const Product = require("../models/Product");
const Bundle = require("../models/Bundle");
const StockMovement = require("../models/StockMovement");
const uploadPayment = require("../middlewares/uploadPayment");

// POST: Membuat pesanan baru
router.post("/", async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const { buyerName, buyerPhone, buyerEmail, items, notes } = req.body;

    if (!buyerName || !buyerPhone) {
      return res.status(400).json({
        message: "Nama dan nomor telepon pembeli wajib diisi",
      });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        message: "Pesanan harus memiliki minimal satu barang",
      });
    }

    let savedOrder;

    await session.withTransaction(async () => {
      const orderItems = [];
      const stockDemands = new Map();

      let totalAmount = 0;

      const addStockDemand = (productId, variantId, quantity) => {
        const key = `${productId}_${variantId}`;

        if (!stockDemands.has(key)) {
          stockDemands.set(key, {
            productId,
            variantId,
            quantity: 0,
          });
        }

        stockDemands.get(key).quantity += quantity;
      };

      // Memeriksa seluruh barang pesanan
      for (const item of items) {
        const {
          itemType,
          productId,
          variantId,
          bundleId,
          bundleComponents,
          quantity,
        } = item;

        if (!Number.isInteger(quantity) || quantity < 1) {
          throw new Error(
            "Jumlah barang harus berupa bilangan bulat minimal 1",
          );
        }

        let orderItem;

        // Pesanan produk satuan
        if (itemType === "product") {
          if (!productId || !variantId) {
            throw new Error("productId dan variantId wajib diisi");
          }

          const product = await Product.findById(productId).session(session);

          if (!product) {
            throw new Error("Produk tidak ditemukan");
          }

          const variant = product.variants.id(variantId);

          if (!variant) {
            throw new Error("Varian produk tidak ditemukan");
          }

          addStockDemand(product._id, variant._id, quantity);

          // Mengambil HPP saat pesanan dibuat
          const hasCost =
            Number.isFinite(variant.averageCost) && variant.averageCost > 0;

          const unitCostSnapshot = hasCost ? variant.averageCost : null;

          orderItem = {
            itemType: "product",
            product: product._id,
            variantId: variant._id,
            quantity,
            unitPrice: variant.sellingPrice,
            subtotal: variant.sellingPrice * quantity,

            // Snapshot HPP produk
            unitCostSnapshot,
            costSubtotalSnapshot: hasCost ? unitCostSnapshot * quantity : null,
            costSnapshotStatus: hasCost ? "complete" : "incomplete",
          };
        }

        // Pesanan bundle
        else if (itemType === "bundle") {
          if (!bundleId) {
            throw new Error("bundleId wajib diisi");
          }

          const bundle = await Bundle.findById(bundleId).session(session);

          if (!bundle) {
            throw new Error("Bundling tidak ditemukan");
          }

          if (
            !Array.isArray(bundleComponents) ||
            bundleComponents.length !== bundle.components.length
          ) {
            throw new Error(
              "Setiap komponen bundling wajib memiliki satu pilihan varian",
            );
          }

          const selectedComponents = [];
          let bundleCost = 0;
          let isBundleCostComplete = true;

          for (const component of bundle.components) {
            const selection = bundleComponents.find(
              (selected) =>
                selected.productId?.toString() === component.product.toString(),
            );

            if (!selection || !selection.variantId) {
              throw new Error("Pilihan varian komponen bundling belum lengkap");
            }

            const allowedVariant = component.variantOptions.some(
              (id) => id.toString() === selection.variantId,
            );

            if (!allowedVariant) {
              throw new Error(
                "Varian yang dipilih tidak tersedia dalam bundling",
              );
            }

            const product = await Product.findById(component.product).session(
              session,
            );

            if (!product) {
              throw new Error("Produk komponen bundling tidak ditemukan");
            }

            const variant = product.variants.id(selection.variantId);

            if (!variant) {
              throw new Error("Varian komponen bundling tidak ditemukan");
            }

            addStockDemand(
              product._id,
              variant._id,
              component.quantity * quantity,
            );

            // Mengambil HPP setiap komponen bundle
            const hasComponentCost =
              Number.isFinite(variant.averageCost) && variant.averageCost > 0;

            const unitCostSnapshot = hasComponentCost
              ? variant.averageCost
              : null;

            const costSubtotalSnapshot = hasComponentCost
              ? unitCostSnapshot * component.quantity
              : null;

            if (hasComponentCost) {
              bundleCost += costSubtotalSnapshot;
            } else {
              isBundleCostComplete = false;
            }

            selectedComponents.push({
              product: product._id,
              variantId: variant._id,
              quantity: component.quantity,
              unitCostSnapshot,
              costSubtotalSnapshot,
            });
          }

          // HPP total untuk satu bundle
          const unitCostSnapshot = isBundleCostComplete ? bundleCost : null;

          orderItem = {
            itemType: "bundle",
            bundle: bundle._id,
            bundleComponents: selectedComponents,
            quantity,
            unitPrice: bundle.sellingPrice,
            subtotal: bundle.sellingPrice * quantity,

            // Snapshot HPP bundle
            unitCostSnapshot,
            costSubtotalSnapshot: isBundleCostComplete
              ? unitCostSnapshot * quantity
              : null,
            costSnapshotStatus: isBundleCostComplete
              ? "complete"
              : "incomplete",
          };
        } else {
          throw new Error("itemType harus product atau bundle");
        }

        orderItems.push(orderItem);
        totalAmount += orderItem.subtotal;
      }

      // Memeriksa dan melakukan reservasi stok
      const productsToUpdate = new Map();

      for (const demand of stockDemands.values()) {
        const product = await Product.findById(demand.productId).session(
          session,
        );

        if (!product) {
          throw new Error("Produk tidak ditemukan");
        }

        const variant = product.variants.id(demand.variantId);

        if (!variant) {
          throw new Error("Varian produk tidak ditemukan");
        }

        const availableStock = variant.stock - variant.reservedStock;

        if (availableStock < demand.quantity) {
          throw new Error(
            `Stok ${product.name} tidak mencukupi. Tersedia: ${availableStock}, dibutuhkan: ${demand.quantity}`,
          );
        }

        variant.reservedStock += demand.quantity;

        productsToUpdate.set(product._id.toString(), product);
      }

      for (const product of productsToUpdate.values()) {
        await product.save({ session });
      }

      const orderCode = `VT-${Date.now()}`;
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

      const orders = await Order.create(
        [
          {
            orderCode,
            buyerName,
            buyerPhone,
            buyerEmail: buyerEmail || "",
            items: orderItems,
            totalAmount,
            status: "pending_payment",
            expiresAt,
            notes: notes || "",
          },
        ],
        { session },
      );

      savedOrder = orders[0];
    });

    return res.status(201).json({
      message: "Pesanan berhasil dibuat dan stok berhasil direservasi",
      data: savedOrder,
    });
  } catch (error) {
    console.error("Gagal membuat pesanan:", error);

    return res.status(400).json({
      message: "Gagal membuat pesanan",
      error: error.message,
    });
  } finally {
    await session.endSession();
  }
});

// POST: Mengunggah bukti pembayaran
router.post("/:orderId/payment-proof", (req, res) => {
  uploadPayment.single("paymentProof")(req, res, async (error) => {
    if (error) {
      return res.status(400).json({
        message: "Gagal mengunggah bukti pembayaran",
        error: error.message,
      });
    }

    try {
      const { orderId } = req.params;

      if (!mongoose.Types.ObjectId.isValid(orderId)) {
        return res.status(400).json({
          message: "ID pesanan tidak valid",
        });
      }

      if (!req.file) {
        return res.status(400).json({
          message: "Bukti pembayaran wajib diunggah",
        });
      }

      const order = await Order.findById(orderId);

      if (!order) {
        fs.unlink(req.file.path, () => {});

        return res.status(404).json({
          message: "Pesanan tidak ditemukan",
        });
      }

      if (order.status !== "pending_payment") {
        fs.unlink(req.file.path, () => {});

        return res.status(400).json({
          message:
            "Bukti pembayaran hanya dapat diunggah untuk pesanan yang menunggu pembayaran",
        });
      }

      order.paymentProof = `uploads/payment-proofs/${req.file.filename}`;
      order.status = "waiting_verification";

      await order.save();

      return res.status(200).json({
        message:
          "Bukti pembayaran berhasil diunggah dan menunggu verifikasi admin",
        data: order,
      });
    } catch (error) {
      if (req.file) {
        fs.unlink(req.file.path, () => {});
      }

      console.error("Gagal menyimpan bukti pembayaran:", error);

      return res.status(500).json({
        message: "Gagal menyimpan bukti pembayaran",
        error: error.message,
      });
    }
  });
});

// PATCH: Verifikasi pembayaran oleh admin
router.patch("/:orderId/verify-payment", async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const { orderId } = req.params;
    const { decision } = req.body;

    // Memeriksa format ID pesanan
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({
        message: "ID pesanan tidak valid",
      });
    }

    // Memeriksa keputusan admin
    if (!["approve", "reject"].includes(decision)) {
      return res.status(400).json({
        message: "Keputusan harus approve atau reject",
      });
    }

    let updatedOrder;

    await session.withTransaction(async () => {
      const order = await Order.findById(orderId).session(session);

      if (!order) {
        throw new Error("Pesanan tidak ditemukan");
      }

      // Hanya pesanan yang menunggu verifikasi yang dapat diproses
      if (order.status !== "waiting_verification") {
        throw new Error("Pesanan tidak sedang menunggu verifikasi pembayaran");
      }

      // Mengumpulkan kebutuhan stok setiap varian
      const stockDemands = new Map();

      // Menampung riwayat stok keluar dari penjualan
      const stockMovementDocuments = [];

      const addStockDemand = (productId, variantId, quantity) => {
        const key = `${productId}_${variantId}`;

        if (!stockDemands.has(key)) {
          stockDemands.set(key, {
            productId,
            variantId,
            quantity: 0,
          });
        }

        stockDemands.get(key).quantity += quantity;
      };

      // Mengumpulkan kebutuhan stok dari pesanan
      for (const item of order.items) {
        if (item.itemType === "product") {
          addStockDemand(item.product, item.variantId, item.quantity);
        } else if (item.itemType === "bundle") {
          for (const component of item.bundleComponents) {
            addStockDemand(
              component.product,
              component.variantId,
              component.quantity * item.quantity,
            );
          }
        }
      }

      // Memperbarui stok setiap produk
      const productsToUpdate = new Map();

      for (const demand of stockDemands.values()) {
        const product = await Product.findById(demand.productId).session(
          session,
        );

        if (!product) {
          throw new Error("Produk pesanan tidak ditemukan");
        }

        const variant = product.variants.id(demand.variantId);

        if (!variant) {
          throw new Error("Varian produk pesanan tidak ditemukan");
        }

        if (variant.reservedStock < demand.quantity) {
          throw new Error(`Reservasi stok ${product.name} tidak mencukupi`);
        }

        if (decision === "approve") {
          if (variant.stock < demand.quantity) {
            throw new Error(`Stok fisik ${product.name} tidak mencukupi`);
          }

          // Menyimpan stok sebelum dikurangi
          const stockBefore = variant.stock;

          // Mengurangi stok fisik
          variant.stock -= demand.quantity;

          // Menyimpan stok setelah dikurangi
          const stockAfter = variant.stock;

          // Menyiapkan riwayat stok keluar
          stockMovementDocuments.push({
            product: product._id,
            variantId: variant._id,
            design: variant.design,
            size: variant.size || null,
            color: variant.color || null,
            type: "out",
            quantity: demand.quantity,
            stockBefore,
            stockAfter,
            source: "sale",
            referenceId: order._id,
            notes: `Penjualan melalui pesanan ${order.orderCode}`,
          });
        }

        // Melepaskan reservasi stok
        variant.reservedStock -= demand.quantity;

        productsToUpdate.set(product._id.toString(), product);
      }

      // Menyimpan perubahan stok produk
      for (const product of productsToUpdate.values()) {
        await product.save({ session });
      }

      // Menyimpan riwayat stok keluar jika pembayaran disetujui
      if (decision === "approve" && stockMovementDocuments.length > 0) {
        await StockMovement.insertMany(stockMovementDocuments, {
          session,
        });
      }

      // Memperbarui status pesanan
      order.status = decision === "approve" ? "paid" : "rejected";

      await order.save({ session });

      updatedOrder = order;
    });

    return res.status(200).json({
      message:
        decision === "approve"
          ? "Pembayaran berhasil diverifikasi dan stok berhasil dikurangi"
          : "Pembayaran ditolak dan reservasi stok berhasil dilepaskan",
      data: updatedOrder,
    });
  } catch (error) {
    console.error("Gagal memverifikasi pembayaran:", error);

    return res.status(400).json({
      message: "Gagal memverifikasi pembayaran",
      error: error.message,
    });
  } finally {
    await session.endSession();
  }
});

// GET: Menampilkan seluruh pesanan
router.get("/", async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });

    res.status(200).json({
      message: "Berhasil mengambil data pesanan",
      total: orders.length,
      data: orders,
    });
  } catch (error) {
    res.status(500).json({
      message: "Gagal mengambil data pesanan",
      error: error.message,
    });
  }
});

module.exports = router;
