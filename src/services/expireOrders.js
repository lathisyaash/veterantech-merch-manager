const mongoose = require("mongoose");

const Order = require("../models/Order");
const Product = require("../models/Product");

// Membatalkan pesanan yang sudah melewati batas pembayaran
const expireOrders = async () => {
  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      const expiredOrders = await Order.find({
        status: "pending_payment",
        expiresAt: { $lte: new Date() },
      }).session(session);

      console.log(
        "Jumlah pesanan kedaluwarsa ditemukan:",
        expiredOrders.length,
      );

      for (const order of expiredOrders) {
        const stockDemands = new Map();

        // Menghitung stok yang harus dilepaskan
        for (const item of order.items) {
          if (item.itemType === "product") {
            const key = `${item.product}_${item.variantId}`;

            stockDemands.set(key, {
              productId: item.product,
              variantId: item.variantId,
              quantity: (stockDemands.get(key)?.quantity || 0) + item.quantity,
            });
          } else if (item.itemType === "bundle") {
            for (const component of item.bundleComponents) {
              const key = `${component.product}_${component.variantId}`;

              stockDemands.set(key, {
                productId: component.product,
                variantId: component.variantId,
                quantity:
                  (stockDemands.get(key)?.quantity || 0) +
                  component.quantity * item.quantity,
              });
            }
          }
        }

        // Melepaskan reservasi stok
        for (const demand of stockDemands.values()) {
          const product = await Product.findById(demand.productId).session(
            session,
          );

          if (!product) {
            throw new Error("Produk tidak ditemukan saat melepas reservasi");
          }

          const variant = product.variants.id(demand.variantId);

          if (!variant) {
            throw new Error("Varian tidak ditemukan saat melepas reservasi");
          }

          if (variant.reservedStock < demand.quantity) {
            throw new Error("Jumlah reservasi stok tidak mencukupi");
          }

          variant.reservedStock -= demand.quantity;

          await product.save({ session });
        }

        // Mengubah status pesanan
        order.status = "cancelled";
        await order.save({ session });
      }
    });

    return true;
  } catch (error) {
    console.error("Gagal memproses pesanan kedaluwarsa:", error);
    return false;
  } finally {
    await session.endSession();
  }
};

module.exports = expireOrders;
