const express = require("express");
const mongoose = require("mongoose");

const router = express.Router();
const Expense = require("../models/Expense");

// POST: Menambahkan biaya operasional
router.post("/", async (req, res) => {
  try {
    const { category, description, amount, expenseDate, proof, notes } =
      req.body;

    if (!category || !description || amount === undefined) {
      return res.status(400).json({
        message: "Kategori, deskripsi, dan nominal wajib diisi",
      });
    }

    const expense = await Expense.create({
      category,
      description,
      amount,
      expenseDate,
      proof,
      notes,
    });

    res.status(201).json({
      message: "Biaya operasional berhasil ditambahkan",
      data: expense,
    });
  } catch (error) {
    res.status(500).json({
      message: "Gagal menambahkan biaya operasional",
      error: error.message,
    });
  }
});

// GET: Melihat seluruh biaya operasional
router.get("/", async (req, res) => {
  try {
    const expenses = await Expense.find().sort({ expenseDate: -1 });

    res.status(200).json({
      message: "Data biaya operasional berhasil diambil",
      data: expenses,
    });
  } catch (error) {
    res.status(500).json({
      message: "Gagal mengambil biaya operasional",
      error: error.message,
    });
  }
});

// GET: Melihat detail biaya operasional
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "ID biaya operasional tidak valid",
      });
    }

    const expense = await Expense.findById(id);

    if (!expense) {
      return res.status(404).json({
        message: "Biaya operasional tidak ditemukan",
      });
    }

    res.status(200).json({
      message: "Detail biaya operasional berhasil diambil",
      data: expense,
    });
  } catch (error) {
    res.status(500).json({
      message: "Gagal mengambil detail biaya operasional",
      error: error.message,
    });
  }
});

// PATCH: Mengubah biaya operasional
router.patch("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "ID biaya operasional tidak valid",
      });
    }

    const allowedFields = [
      "category",
      "description",
      "amount",
      "expenseDate",
      "proof",
      "notes",
    ];

    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    const expense = await Expense.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!expense) {
      return res.status(404).json({
        message: "Biaya operasional tidak ditemukan",
      });
    }

    res.status(200).json({
      message: "Biaya operasional berhasil diperbarui",
      data: expense,
    });
  } catch (error) {
    res.status(500).json({
      message: "Gagal memperbarui biaya operasional",
      error: error.message,
    });
  }
});

// DELETE: Menghapus biaya operasional
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "ID biaya operasional tidak valid",
      });
    }

    const expense = await Expense.findByIdAndDelete(id);

    if (!expense) {
      return res.status(404).json({
        message: "Biaya operasional tidak ditemukan",
      });
    }

    res.status(200).json({
      message: "Biaya operasional berhasil dihapus",
      data: expense,
    });
  } catch (error) {
    res.status(500).json({
      message: "Gagal menghapus biaya operasional",
      error: error.message,
    });
  }
});

module.exports = router;
