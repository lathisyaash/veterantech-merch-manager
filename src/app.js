const express = require("express");

const app = express();
const PORT = 3000;

// Import koneksi database
const connectDB = require("./config/database");

// Import routes
const productRoutes = require("./routes/productRoutes");
const bundleRoutes = require("./routes/bundleRoutes");
const purchaseRoutes = require("./routes/purchaseRoutes");
const pricingRoutes = require("./routes/pricingRoutes");
const inventoryRoutes = require("./routes/inventoryRoutes");
const orderRoutes = require("./routes/orderRoutes");
const expenseRoutes = require("./routes/expenseRoutes");
const reportRoutes = require("./routes/reportRoutes");

// Import proses pembatalan pesanan kedaluwarsa
const expireOrders = require("./services/expireOrders");

// Middleware
app.use(express.json());

// Mengakses file bukti pembayaran
app.use("/uploads", express.static("uploads"));

// Endpoint utama
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to Veterantech Merch Manager API!",
    status: "Server is running",
  });
});

// Endpoint katalog produk
app.use("/api/products", productRoutes);

// Endpoint katalog bundling
app.use("/api/bundles", bundleRoutes);

// Endpoint pembelian
app.use("/api/purchases", purchaseRoutes);

// Endpoint perhitungan harga jual
app.use("/api/pricing", pricingRoutes);

// Endpoint Inventory
app.use("/api/inventory", inventoryRoutes);

// Endpoint Pesanan
app.use("/api/orders", orderRoutes);

// Endpoint Biaya Operasional
app.use("/api/expenses", expenseRoutes);

// Endpoint Laporan
app.use("/api/reports", reportRoutes);

// Jalankan koneksi database dan server
const startServer = async () => {
  await connectDB();

  // Periksa pesanan kedaluwarsa saat server dimulai
  await expireOrders();

  // Periksa kembali setiap 1 menit
  setInterval(() => {
    expireOrders();
  }, 60 * 1000);

  app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
  });
};

startServer();
