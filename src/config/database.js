const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(
      "mongodb://127.0.0.1:27017/veterantech_merch?replicaSet=rs0",
    );

    console.log("MongoDB berhasil terhubung!");
  } catch (error) {
    console.error("Koneksi MongoDB gagal:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
