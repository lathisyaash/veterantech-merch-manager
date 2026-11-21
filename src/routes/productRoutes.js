const express = require("express");
const router = express.Router();

// Import Product Model
const Product = require("../models/Product");

// GET: Menampilkan seluruh produk
router.get("/", async (req, res) => {
  try {
    const products = await Product.find();

    res.status(200).json({
      message: "Berhasil mengambil data produk",
      data: products,
    });
  } catch (error) {
    res.status(500).json({
      message: "Gagal mengambil data produk",
      error: error.message,
    });
  }
});

// GET: Menampilkan produk berdasarkan ID
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: "Produk tidak ditemukan",
      });
    }

    res.status(200).json({
      message: "Berhasil mengambil detail produk",
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      message: "Gagal mengambil detail produk",
      error: error.message,
    });
  }
});

// POST: Menambahkan produk baru
router.post("/", async (req, res) => {
  try {
    const newProduct = new Product(req.body);

    const savedProduct = await newProduct.save();

    res.status(201).json({
      message: "Produk berhasil ditambahkan",
      data: savedProduct,
    });
  } catch (error) {
    res.status(400).json({
      message: "Gagal menambahkan produk",
      error: error.message,
    });
  }
});

module.exports = router;
