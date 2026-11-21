# Veterantech Merch Manager

**Veterantech Merch Manager** merupakan aplikasi backend berbasis REST API yang dikembangkan untuk membantu pengelolaan operasional penjualan merchandise Veterantech. Sistem ini mencakup pengelolaan produk, stok, pembelian, pesanan, pembayaran, biaya operasional, serta laporan keuangan.

## 1. Fitur Utama

- **Manajemen Produk:** Mengelola data produk dan varian merchandise.
- **Manajemen Bundling:** Mengelola paket bundling produk.
- **Manajemen Pembelian:** Mencatat pembelian barang dan penambahan stok.
- **Perhitungan Harga Jual:** Mendukung perhitungan harga jual produk.
- **Manajemen Pesanan:** Mengelola pesanan dan status pembayaran.
- **Verifikasi Pembayaran:** Mengunggah bukti pembayaran dan melakukan verifikasi.
- **Manajemen Inventaris:** Memantau persediaan dan pergerakan stok.
- **Biaya Operasional:** Mencatat pengeluaran operasional.
- **Laporan Keuangan:** Menampilkan pendapatan, Harga Pokok Penjualan (HPP), laba kotor, dan laba bersih.
- **Otomatisasi Pesanan:** Memeriksa dan membatalkan pesanan yang kedaluwarsa.

## 2. Teknologi yang Digunakan

| Teknologi  | Kegunaan                           |
| ---------- | ---------------------------------- |
| Node.js    | Runtime JavaScript                 |
| Express.js | Framework backend dan REST API     |
| MongoDB    | Database NoSQL                     |
| Mongoose   | ODM untuk MongoDB                  |
| Multer     | Middleware upload bukti pembayaran |
| Postman    | Pengujian endpoint API             |

## 3. Struktur Project

```text
veterantech-merch-manager/
│
├── src/
│   ├── config/
│   │   └── database.js
│   │
│   ├── middlewares/
│   │   └── uploadPayment.js
│   │
│   ├── models/
│   │   ├── Bundle.js
│   │   ├── Expense.js
│   │   ├── Order.js
│   │   ├── PricingHistory.js
│   │   ├── Product.js
│   │   ├── Purchase.js
│   │   └── StockMovement.js
│   │
│   ├── routes/
│   │   ├── bundleRoutes.js
│   │   ├── expenseRoutes.js
│   │   ├── inventoryRoutes.js
│   │   ├── orderRoutes.js
│   │   ├── pricingRoutes.js
│   │   ├── productRoutes.js
│   │   ├── purchaseRoutes.js
│   │   └── reportRoutes.js
│   │
│   ├── services/
│   │   └── expireOrders.js
│   │
│   └── app.js
│
├── .gitignore
├── package.json
├── package-lock.json
├── PRD.md
└── README.md
```

## 4. Persyaratan Sistem

Sebelum menjalankan project, pastikan sudah tersedia:

- Node.js dan npm.
- MongoDB yang berjalan secara lokal.
- MongoDB Replica Set dengan nama `rs0`.

Database yang digunakan adalah `veterantech_merch`.

## 5. Instalasi dan Menjalankan Project

**Langkah 1. Clone repository**

```bash
git clone https://github.com/lathisyaash/veterantech-merch-manager.git
```

**Langkah 2. Masuk ke direktori project**

```bash
cd veterantech-merch-manager
```

**Langkah 3. Install dependencies**

```bash
npm install
```

**Langkah 4. Jalankan server**

```bash
npm start
```

Jika berhasil, server berjalan pada:

```text
http://localhost:3000
```

Untuk memeriksa status server, akses endpoint:

```http
GET http://localhost:3000/
```

## 6. Daftar Endpoint API

| Endpoint               | Fungsi                             |
| ---------------------- | ---------------------------------- |
| `/api/products`        | Pengelolaan produk                 |
| `/api/bundles`         | Pengelolaan bundling               |
| `/api/purchases`       | Pencatatan pembelian               |
| `/api/pricing`         | Perhitungan harga jual             |
| `/api/inventory`       | Pengelolaan inventaris             |
| `/api/orders`          | Pengelolaan pesanan dan pembayaran |
| `/api/expenses`        | Pencatatan biaya operasional       |
| `/api/reports/summary` | Ringkasan laporan keuangan         |

Setiap endpoint dapat memiliki beberapa HTTP method, seperti GET, POST, PATCH, dan DELETE sesuai fungsi yang tersedia.

## 7. Pengujian API

Pengujian sistem dilakukan menggunakan **Postman** untuk memastikan setiap endpoint dapat berjalan sesuai fungsinya.

Pengujian mencakup:

- Pengambilan dan pengelolaan data produk.
- Pembuatan pesanan produk dan bundling.
- Upload dan verifikasi bukti pembayaran.
- Validasi ketersediaan stok.
- Pencatatan biaya operasional.
- Pengambilan laporan keuangan.
- Validasi input dan penanganan kesalahan.

## 8. Ruang Lingkup Project

Veterantech Merch Manager dikembangkan sebagai aplikasi backend berbasis REST API. Demonstrasi sistem dilakukan melalui pengujian endpoint menggunakan Postman dan belum mencakup pengembangan antarmuka frontend.

---

**Repository:** [github.com/lathisyaash/veterantech-merch-manager](https://github.com/lathisyaash/veterantech-merch-manager)
