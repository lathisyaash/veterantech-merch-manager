const express = require("express");
const router = express.Router();

// Import model
const Bundle = require("../models/Bundle");
const Product = require("../models/Product");

// GET: Menampilkan seluruh katalog bundling
router.get("/", async (req, res) => {
  try {
    const bundles = await Bundle.find().populate("components.product");

    res.status(200).json({
      message: "Berhasil mengambil katalog bundling",
      data: bundles,
    });
  } catch (error) {
    res.status(500).json({
      message: "Gagal mengambil katalog bundling",
      error: error.message,
    });
  }
});

// GET: Menampilkan detail bundling berdasarkan ID
router.get("/:id", async (req, res) => {
  try {
    const bundle = await Bundle.findById(req.params.id).populate(
      "components.product",
    );

    if (!bundle) {
      return res.status(404).json({
        message: "Bundling tidak ditemukan",
      });
    }

    res.status(200).json({
      message: "Berhasil mengambil detail bundling",
      data: bundle,
    });
  } catch (error) {
    res.status(500).json({
      message: "Gagal mengambil detail bundling",
      error: error.message,
    });
  }
});

// POST: Menambahkan bundling baru
router.post("/", async (req, res) => {
  try {
    const { name, components, sellingPrice } = req.body;

    // Validasi nama dan komponen bundling
    if (!name || !Array.isArray(components) || components.length === 0) {
      return res.status(400).json({
        message: "Nama dan komponen bundling wajib diisi",
      });
    }

    // Validasi harga jual
    if (
      sellingPrice === undefined ||
      typeof sellingPrice !== "number" ||
      !Number.isFinite(sellingPrice) ||
      sellingPrice < 0
    ) {
      return res.status(400).json({
        message: "Harga jual bundling tidak valid",
      });
    }

    // Validasi komponen bundling
    for (const component of components) {
      if (!component.product) {
        return res.status(400).json({
          message: "ID produk komponen wajib diisi",
        });
      }

      const product = await Product.findById(component.product);

      if (!product) {
        return res.status(404).json({
          message: "Produk komponen tidak ditemukan",
        });
      }

      if (
        !Array.isArray(component.variantOptions) ||
        component.variantOptions.length === 0
      ) {
        return res.status(400).json({
          message: `Pilihan varian untuk ${product.name} belum diisi`,
        });
      }

      // Memastikan semua varian berasal dari produk yang dipilih
      const validVariantIds = product.variants.map((variant) =>
        variant._id.toString(),
      );

      const invalidVariant = component.variantOptions.some(
        (variantId) => !validVariantIds.includes(variantId.toString()),
      );

      if (invalidVariant) {
        return res.status(400).json({
          message: `Terdapat varian yang tidak sesuai dengan produk ${product.name}`,
        });
      }

      // Validasi jumlah komponen
      if (
        component.quantity !== undefined &&
        (!Number.isInteger(component.quantity) || component.quantity < 1)
      ) {
        return res.status(400).json({
          message: "Jumlah komponen harus berupa bilangan bulat minimal 1",
        });
      }
    }

    // Simpan bundling ke MongoDB
    const newBundle = new Bundle({
      name,
      components,
      sellingPrice,
    });

    const savedBundle = await newBundle.save();

    res.status(201).json({
      message: "Bundling berhasil ditambahkan",
      data: savedBundle,
    });
  } catch (error) {
    res.status(400).json({
      message: "Gagal menambahkan bundling",
      error: error.message,
    });
  }
});

module.exports = router;
