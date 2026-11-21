const express = require("express");

const router = express.Router();

const Order = require("../models/Order");
const Expense = require("../models/Expense");
const Purchase = require("../models/Purchase");
const Product = require("../models/Product");
const StockMovement = require("../models/StockMovement");

// GET: Laporan keuangan dan persediaan
// Contoh: GET /api/reports/summary
// Dengan periode: GET /api/reports/summary?startDate=2026-09-01&endDate=2026-11-30

router.get("/summary", async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Membuat filter tanggal
    const dateFilter = {};

    if (startDate) {
      const start = new Date(`${startDate}T00:00:00.000`);

      if (Number.isNaN(start.getTime())) {
        return res.status(400).json({
          message: "Format startDate tidak valid. Gunakan YYYY-MM-DD",
        });
      }

      dateFilter.$gte = start;
    }

    if (endDate) {
      const end = new Date(`${endDate}T23:59:59.999`);

      if (Number.isNaN(end.getTime())) {
        return res.status(400).json({
          message: "Format endDate tidak valid. Gunakan YYYY-MM-DD",
        });
      }

      dateFilter.$lte = end;
    }

    if (
      startDate &&
      endDate &&
      new Date(`${startDate}T00:00:00.000`) >
        new Date(`${endDate}T23:59:59.999`)
    ) {
      return res.status(400).json({
        message: "startDate tidak boleh melebihi endDate",
      });
    }

    // Filter tanggal untuk masing-masing data
    const orderFilter = { status: "paid" };
    const expenseFilter = {};
    const purchaseFilter = {};

    if (Object.keys(dateFilter).length > 0) {
      orderFilter.createdAt = dateFilter;
      expenseFilter.expenseDate = dateFilter;
      purchaseFilter.purchaseDate = dateFilter;
    }

    // Mengambil data sesuai periode
    const [orders, expenses, purchases] = await Promise.all([
      Order.find(orderFilter),
      Expense.find(expenseFilter).sort({ expenseDate: -1 }),
      Purchase.find(purchaseFilter)
        .populate("items.product", "name")
        .sort({ purchaseDate: -1 }),
    ]);

    // Menghitung omzet dan HPP dari pesanan lunas
    let totalRevenue = 0;
    let totalCOGS = 0;
    let incompleteOrderCount = 0;

    for (const order of orders) {
      totalRevenue += order.totalAmount;

      let orderCostComplete = true;

      for (const item of order.items) {
        if (
          item.costSnapshotStatus !== "complete" ||
          !Number.isFinite(item.costSubtotalSnapshot)
        ) {
          orderCostComplete = false;
        } else {
          totalCOGS += item.costSubtotalSnapshot;
        }
      }

      if (!orderCostComplete) {
        incompleteOrderCount += 1;
      }
    }

    // Menghitung biaya operasional
    let totalExpenses = 0;
    const expenseByCategory = {};

    for (const expense of expenses) {
      totalExpenses += expense.amount;

      if (!expenseByCategory[expense.category]) {
        expenseByCategory[expense.category] = 0;
      }

      expenseByCategory[expense.category] += expense.amount;
    }

    // Menghitung laba
    const grossProfit = totalRevenue - totalCOGS;
    const netProfit = grossProfit - totalExpenses;

    // Mengambil seluruh riwayat stok masuk dan keluar
    const [stockIns, stockOuts, products] = await Promise.all([
      StockMovement.find({
        type: "in",
        source: "purchase",
      }),
      StockMovement.find({
        type: "out",
        source: "sale",
      }),
      Product.find(),
    ]);

    // Mengelompokkan stok berdasarkan produk dan varian
    const inventoryMap = new Map();

    for (const product of products) {
      for (const variant of product.variants) {
        const key = `${product._id}_${variant._id}`;

        inventoryMap.set(key, {
          productId: product._id,
          productName: product.name,
          variantId: variant._id,
          design: variant.design,
          size: variant.size,
          color: variant.color,
          openingStock: 0,
          sold: 0,
          remainingStock: variant.stock,
          reservedStock: variant.reservedStock,
        });
      }
    }

    // Menghitung total stok masuk dari pembelian
    for (const movement of stockIns) {
      const key = `${movement.product}_${movement.variantId}`;
      const inventory = inventoryMap.get(key);

      if (inventory) {
        inventory.openingStock += movement.quantity;
      }
    }

    // Menghitung total stok keluar dari penjualan
    for (const movement of stockOuts) {
      const key = `${movement.product}_${movement.variantId}`;
      const inventory = inventoryMap.get(key);

      if (inventory) {
        inventory.sold += movement.quantity;
      }
    }

    const inventory = Array.from(inventoryMap.values());

    const totalOpeningStock = inventory.reduce(
      (total, item) => total + item.openingStock,
      0,
    );

    const totalSold = inventory.reduce((total, item) => total + item.sold, 0);

    const totalRemainingStock = inventory.reduce(
      (total, item) => total + item.remainingStock,
      0,
    );

    // Ringkasan total pembelian pada periode laporan
    const totalPurchases = purchases.reduce(
      (total, purchase) => total + purchase.totalAmount,
      0,
    );

    return res.status(200).json({
      message: "Laporan berhasil dibuat",

      period: {
        startDate: startDate || "Semua tanggal",
        endDate: endDate || "Semua tanggal",
      },

      financialSummary: {
        totalOrders: orders.length,
        totalRevenue,
        totalCOGS,
        grossProfit,
        totalExpenses,
        netProfit,
        totalPurchases,

        costStatus: incompleteOrderCount > 0 ? "provisional" : "complete",

        incompleteOrderCount,

        expenseByCategory,
      },

      purchaseHistory: {
        totalTransactions: purchases.length,
        totalAmount: totalPurchases,
        data: purchases,
      },

      expenseHistory: {
        totalTransactions: expenses.length,
        totalAmount: totalExpenses,
        data: expenses,
      },

      inventorySummary: {
        totalOpeningStock,
        totalSold,
        totalRemainingStock,
        data: inventory,
      },
    });
  } catch (error) {
    console.error("Gagal membuat laporan:", error);

    return res.status(500).json({
      message: "Gagal membuat laporan",
      error: error.message,
    });
  }
});

module.exports = router;
