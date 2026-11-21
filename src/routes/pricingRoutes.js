const express = require("express");
const router = express.Router();

// Import model Product
const Product = require("../models/Product");
const PricingHistory = require("../models/PricingHistory");

// POST: Menghitung rekomendasi harga jual
router.post("/calculate", async (req, res) => {
  try {
    const { productId, variantId, markup } = req.body;

    if (
      !productId ||
      !variantId ||
      typeof markup !== "number" ||
      !Number.isFinite(markup) ||
      markup < 0
    ) {
      return res.status(400).json({
        message: "ID produk, ID varian, dan markup yang valid wajib diisi",
      });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        message: "Produk tidak ditemukan",
      });
    }

    const variant = product.variants.id(variantId);

    if (!variant) {
      return res.status(404).json({
        message: "Varian produk tidak ditemukan",
      });
    }

    if (variant.averageCost <= 0) {
      return res.status(400).json({
        message: "Average Cost harus lebih dari 0",
      });
    }

    const suggestedPrice = Math.round(variant.averageCost * (1 + markup / 100));

    variant.markup = markup;
    variant.suggestedPrice = suggestedPrice;
    variant.pricingStatus = "pending";
    variant.pricingNotes = "";

    await product.save();

    res.status(200).json({
      message: "Rekomendasi harga jual berhasil dihitung",
      data: {
        product: product.name,
        design: variant.design,
        size: variant.size,
        color: variant.color,
        averageCost: variant.averageCost,
        markup: variant.markup,
        suggestedPrice: variant.suggestedPrice,
        currentSellingPrice: variant.sellingPrice,
        pricingStatus: variant.pricingStatus,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Gagal menghitung rekomendasi harga jual",
      error: error.message,
    });
  }
});

// POST: Menyetujui rekomendasi harga

router.post("/approve", async (req, res) => {
  try {
    const { productId, variantId } = req.body;

    if (!productId || !variantId) {
      return res.status(400).json({
        message: "ID produk dan ID varian wajib diisi",
      });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        message: "Produk tidak ditemukan",
      });
    }

    const variant = product.variants.id(variantId);

    if (!variant) {
      return res.status(404).json({
        message: "Varian produk tidak ditemukan",
      });
    }

    if (variant.pricingStatus !== "pending" || variant.suggestedPrice <= 0) {
      return res.status(400).json({
        message: "Tidak ada rekomendasi harga yang menunggu persetujuan",
      });
    }

    const previousPrice = variant.sellingPrice;

    // Memperbarui harga jual
    variant.sellingPrice = variant.suggestedPrice;
    variant.pricingStatus = "approved";
    variant.pricingNotes = "";

    await product.save();

    // Mencatat riwayat perubahan harga
    const history = new PricingHistory({
      product: product._id,
      variantId: variant._id,
      design: variant.design,
      size: variant.size,
      color: variant.color,
      previousPrice,
      newPrice: variant.sellingPrice,
      suggestedPrice: variant.suggestedPrice,
      markup: variant.markup,
      decision: "approved",
      notes: "Rekomendasi harga disetujui admin",
    });

    await history.save();

    res.status(200).json({
      message: "Rekomendasi harga berhasil disetujui dan riwayat tersimpan",
      data: {
        product: product.name,
        design: variant.design,
        sellingPrice: variant.sellingPrice,
        pricingStatus: variant.pricingStatus,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Gagal menyetujui harga",
      error: error.message,
    });
  }
});

// POST: Menetapkan harga jual secara manual

router.post("/adjust", async (req, res) => {
  try {
    const { productId, variantId, sellingPrice, notes } = req.body;

    if (
      !productId ||
      !variantId ||
      typeof sellingPrice !== "number" ||
      !Number.isFinite(sellingPrice) ||
      sellingPrice <= 0 ||
      !notes ||
      !notes.trim()
    ) {
      return res.status(400).json({
        message:
          "ID produk, ID varian, harga jual, dan alasan penyesuaian wajib diisi",
      });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        message: "Produk tidak ditemukan",
      });
    }

    const variant = product.variants.id(variantId);

    if (!variant) {
      return res.status(404).json({
        message: "Varian produk tidak ditemukan",
      });
    }

    // Menyimpan harga sebelumnya
    const previousPrice = variant.sellingPrice;

    // Memperbarui harga jual secara manual
    variant.sellingPrice = sellingPrice;
    variant.pricingStatus = "adjusted";
    variant.pricingNotes = notes.trim();

    await product.save();

    // Mencatat riwayat perubahan harga
    const history = new PricingHistory({
      product: product._id,
      variantId: variant._id,
      design: variant.design,
      size: variant.size,
      color: variant.color,
      previousPrice,
      newPrice: variant.sellingPrice,
      suggestedPrice: variant.suggestedPrice,
      markup: variant.markup,
      decision: "adjusted",
      notes: variant.pricingNotes,
    });

    await history.save();

    res.status(200).json({
      message: "Harga jual berhasil disesuaikan dan riwayat tersimpan",
      data: {
        product: product.name,
        design: variant.design,
        sellingPrice: variant.sellingPrice,
        suggestedPrice: variant.suggestedPrice,
        pricingStatus: variant.pricingStatus,
        pricingNotes: variant.pricingNotes,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Gagal menetapkan harga jual",
      error: error.message,
    });
  }
});

// GET: Menampilkan seluruh riwayat perubahan harga
router.get("/history", async (req, res) => {
  try {
    const histories = await PricingHistory.find()
      .populate("product", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Berhasil mengambil riwayat perubahan harga",
      total: histories.length,
      data: histories,
    });
  } catch (error) {
    res.status(500).json({
      message: "Gagal mengambil riwayat perubahan harga",
      error: error.message,
    });
  }
});

module.exports = router;
