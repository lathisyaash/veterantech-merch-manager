const express = require("express");
const router = express.Router();

// Import model
const Purchase = require("../models/Purchase");
const Product = require("../models/Product");
const StockMovement = require("../models/StockMovement");

// POST: Mencatat pembelian baru
router.post("/", async (req, res) => {
  try {
    const { supplierName, purchaseDate, items, notes } = req.body;

    // Validasi data pembelian
    if (!supplierName || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        message: "Nama supplier dan minimal satu barang wajib diisi",
      });
    }

    // Menyimpan perubahan stok sementara
    const updatedProducts = new Map();
    const purchaseItems = [];
    const stockMovements = [];

    let totalAmount = 0;

    // Memproses setiap barang yang dibeli
    for (const item of items) {
      const { product, variantId, quantity, unitCost } = item;

      if (
        !product ||
        !variantId ||
        !Number.isInteger(quantity) ||
        quantity < 1 ||
        typeof unitCost !== "number" ||
        !Number.isFinite(unitCost) ||
        unitCost < 0
      ) {
        return res.status(400).json({
          message: "Data produk, varian, jumlah, atau harga beli tidak valid",
        });
      }

      // Mencari produk
      let existingProduct = updatedProducts.get(product);

      if (!existingProduct) {
        existingProduct = await Product.findById(product);

        if (!existingProduct) {
          return res.status(404).json({
            message: "Produk tidak ditemukan",
          });
        }

        updatedProducts.set(product, existingProduct);
      }

      // Mencari varian produk
      const variant = existingProduct.variants.id(variantId);

      if (!variant) {
        return res.status(404).json({
          message: `Varian produk ${existingProduct.name} tidak ditemukan`,
        });
      }

      // Menghitung Weighted Average Cost
      const oldStock = variant.stock;
      const oldAverageCost = variant.averageCost;

      const subtotal = quantity * unitCost;

      const newStock = oldStock + quantity;

      const newAverageCost = (oldStock * oldAverageCost + subtotal) / newStock;

      // Memperbarui stok dan rata-rata biaya
      variant.stock = newStock;
      variant.averageCost = newAverageCost;

      totalAmount += subtotal;

      // Menyimpan detail barang pembelian
      purchaseItems.push({
        product,
        variantId,
        quantity,
        unitCost,
        subtotal,
      });

      // Menyiapkan riwayat pergerakan stok masuk
      stockMovements.push({
        product: existingProduct._id,
        variantId: variant._id,
        design: variant.design,
        size: variant.size,
        color: variant.color,
        type: "in",
        quantity,
        stockBefore: oldStock,
        stockAfter: newStock,
        source: "purchase",
        notes: `Pembelian dari supplier ${supplierName}`,
      });
    }

    // Menyimpan seluruh perubahan produk
    for (const product of updatedProducts.values()) {
      await product.save();
    }

    // Membuat transaksi pembelian
    const newPurchase = new Purchase({
      supplierName,
      purchaseDate: purchaseDate || Date.now(),
      items: purchaseItems,
      totalAmount,
      notes,
    });

    const savedPurchase = await newPurchase.save();

    // Menambahkan ID pembelian sebagai referensi riwayat stok
    const movementsWithReference = stockMovements.map((movement) => ({
      ...movement,
      referenceId: savedPurchase._id,
    }));

    // Menyimpan riwayat pergerakan stok
    await StockMovement.insertMany(movementsWithReference);

    res.status(201).json({
      message: "Pembelian berhasil dicatat dan stok berhasil diperbarui",
      data: savedPurchase,
    });
  } catch (error) {
    res.status(400).json({
      message: "Gagal mencatat pembelian",
      error: error.message,
    });
  }
});

// GET: Menampilkan seluruh riwayat pembelian
router.get("/", async (req, res) => {
  try {
    const purchases = await Purchase.find().populate("items.product");

    res.status(200).json({
      message: "Berhasil mengambil riwayat pembelian",
      data: purchases,
    });
  } catch (error) {
    res.status(500).json({
      message: "Gagal mengambil riwayat pembelian",
      error: error.message,
    });
  }
});

module.exports = router;
