const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const StockMovement = require("../models/StockMovement");

// GET: Menampilkan seluruh persediaan produk
router.get("/", async (req, res) => {
  try {
    const products = await Product.find();

    const inventory = products.map((product) => ({
      productId: product._id,
      productName: product.name,
      variants: product.variants.map((variant) => ({
        variantId: variant._id,
        design: variant.design,
        size: variant.size,
        color: variant.color,
        stock: variant.stock,
        averageCost: variant.averageCost,
        sellingPrice: variant.sellingPrice,
      })),
    }));

    res.status(200).json({
      message: "Berhasil mengambil data persediaan",
      totalProducts: inventory.length,
      data: inventory,
    });
  } catch (error) {
    res.status(500).json({
      message: "Gagal mengambil data persediaan",
      error: error.message,
    });
  }
});

// GET: Menampilkan seluruh riwayat pergerakan stok
router.get("/movements", async (req, res) => {
  try {
    const movements = await StockMovement.find()
      .populate("product", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Berhasil mengambil riwayat pergerakan stok",
      total: movements.length,
      data: movements,
    });
  } catch (error) {
    res.status(500).json({
      message: "Gagal mengambil riwayat pergerakan stok",
      error: error.message,
    });
  }
});

// POST: Melakukan penyesuaian stok secara manual
router.post("/adjustment", async (req, res) => {
  try {
    const { productId, variantId, actualStock, notes } = req.body;

    // Validasi input
    if (!productId || !variantId || actualStock === undefined) {
      return res.status(400).json({
        message: "productId, variantId, dan actualStock wajib diisi",
      });
    }

    if (!Number.isInteger(actualStock) || actualStock < 0) {
      return res.status(400).json({
        message: "Stok aktual harus berupa bilangan bulat minimal 0",
      });
    }

    // Mencari produk
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        message: "Produk tidak ditemukan",
      });
    }

    // Mencari varian produk
    const variant = product.variants.id(variantId);

    if (!variant) {
      return res.status(404).json({
        message: "Varian produk tidak ditemukan",
      });
    }

    const stockBefore = variant.stock;
    const stockAfter = actualStock;
    const difference = Math.abs(stockAfter - stockBefore);

    if (difference === 0) {
      return res.status(400).json({
        message: "Stok aktual sama dengan stok sistem, tidak perlu penyesuaian",
      });
    }

    // Memperbarui stok
    variant.stock = stockAfter;
    await product.save();

    // Mencatat pergerakan stok
    const movement = await StockMovement.create({
      product: product._id,
      variantId: variant._id,
      design: variant.design,
      size: variant.size,
      color: variant.color,
      type: "adjustment",
      quantity: difference,
      stockBefore,
      stockAfter,
      source: "manual",
      notes: notes || "Penyesuaian stok manual",
    });

    res.status(201).json({
      message: "Penyesuaian stok berhasil dilakukan",
      data: {
        productName: product.name,
        design: variant.design,
        size: variant.size,
        color: variant.color,
        stockBefore,
        stockAfter,
        difference,
        movement,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Gagal melakukan penyesuaian stok",
      error: error.message,
    });
  }
});

module.exports = router;
