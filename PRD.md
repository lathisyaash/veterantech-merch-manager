# PRODUCT REQUIREMENTS DOCUMENT (PRD)
# Veterantech Merch Manager

**Versi:** 1.2  
**Status:** Final  
**Platform:** Backend REST API  
**Organisasi:** KSM VeteranTech

---

## 1. PROJECT OVERVIEW

### 1.1 Deskripsi Produk

Veterantech Merch Manager merupakan sistem backend berbasis REST API yang dirancang untuk membantu pengelolaan merchandise KSM VeteranTech.

Sistem ini mengintegrasikan proses pengelolaan produk, pembelian barang, persediaan, harga jual, bundling, pemesanan, pembayaran, pengeluaran, dan laporan keuangan dalam satu sistem terpusat.

Sistem dikembangkan untuk menggantikan proses pencatatan yang sebelumnya dilakukan melalui beberapa spreadsheet dan diperbarui secara manual.

### 1.2 Latar Belakang

Pengelolaan merchandise membutuhkan pencatatan yang saling berkaitan antara pembelian barang, jumlah stok, harga modal, harga jual, penjualan, dan keuntungan.

Pada proses sebelumnya, data tersebut dikelola melalui beberapa spreadsheet. Ketika terjadi pembelian atau penjualan, stok dan informasi keuangan harus diperbarui secara manual. Hal ini berpotensi menyebabkan ketidaksesuaian data, kesalahan perhitungan, dan kesulitan dalam memantau kondisi keuangan merchandise.

Oleh karena itu, dibutuhkan sistem yang dapat mengintegrasikan seluruh proses tersebut agar pencatatan lebih terstruktur, perhitungan lebih konsisten, dan laporan dapat dihasilkan berdasarkan transaksi yang tersimpan.

### 1.3 Tujuan Produk

1. Memusatkan pengelolaan data merchandise dalam satu sistem.
2. Mempermudah pencatatan pembelian dan penjualan.
3. Menghitung harga modal menggunakan metode Weighted Average.
4. Menghasilkan rekomendasi harga jual berdasarkan persentase markup.
5. Mengelola stok produk dan komponen bundling secara otomatis.
6. Mempermudah pencatatan dan verifikasi pembayaran.
7. Mencatat pengeluaran operasional.
8. Menghasilkan laporan pembelian, penjualan, persediaan, laba kotor, dan laba bersih.

---

## 2. PRODUCT SCOPE

### 2.1 In Scope

Fitur yang termasuk dalam pengembangan sistem:

- Manajemen produk dan varian.
- Pencatatan pembelian barang dari supplier.
- Perhitungan harga modal menggunakan Weighted Average.
- Rekomendasi harga jual berdasarkan persentase markup.
- Persetujuan harga jual oleh admin.
- Pengelolaan stok dan riwayat pergerakan stok.
- Pengelolaan bundling merchandise.
- Pemesanan produk dan bundling.
- Unggah bukti pembayaran.
- Verifikasi pembayaran secara manual.
- Pencatatan pengeluaran operasional.
- Laporan pembelian, penjualan, persediaan, HPP, laba kotor, dan laba bersih.
- Autentikasi admin.

### 2.2 Out of Scope

Fitur berikut tidak termasuk dalam versi awal:

- Frontend atau aplikasi mobile.
- Integrasi payment gateway.
- Konfirmasi pembayaran otomatis melalui rekening bank atau e-wallet.
- Integrasi jasa pengiriman.
- Integrasi WhatsApp.
- Integrasi langsung dengan spreadsheet.
- Pengelolaan stok rusak atau hilang.

Seluruh endpoint API akan diuji menggunakan Postman.

---

## 3. USER ROLES AND PERMISSIONS

### 3.1 Admin / Finance

Admin merupakan pengguna utama yang bertanggung jawab mengelola seluruh data internal sistem.

Hak akses admin:

- Login dan logout.
- Mengelola data produk dan varian.
- Mencatat transaksi pembelian.
- Mengelola stok.
- Mengatur persentase markup.
- Meninjau dan menyetujui harga jual.
- Mengelola bundling.
- Melihat dan mengelola pesanan.
- Memverifikasi pembayaran.
- Mencatat pengeluaran operasional.
- Mengakses seluruh laporan.

### 3.2 Buyer

Buyer merupakan pihak yang melakukan pembelian merchandise.

Buyer tidak diwajibkan memiliki akun atau login pada versi awal.

Buyer dapat:

- Melihat katalog produk.
- Melihat harga produk dan bundling.
- Membuat pesanan dengan mengisi informasi pembeli.
- Mengunggah bukti pembayaran.
- Melihat status pesanan melalui kode pesanan.

Buyer tidak memiliki akses ke pengelolaan data internal dan laporan keuangan.

---

## 4. FUNCTIONAL REQUIREMENTS

### 4.1 Product Management

Sistem menyediakan fitur pengelolaan data produk dan variannya.

Informasi produk meliputi:

- Nama produk.
- Kategori.
- Deskripsi.
- Varian produk.
- Ukuran atau atribut varian lainnya.
- Harga modal.
- Persentase markup.
- Rekomendasi harga jual.
- Harga jual final.
- Jumlah stok.
- Status produk.

Sistem harus mendukung satu produk yang memiliki beberapa varian dengan harga modal, persentase markup, dan harga jual yang berbeda.

### 4.2 Purchase Management

Admin dapat mencatat transaksi pembelian barang dari supplier.

Satu transaksi pembelian dapat berisi beberapa produk atau varian, termasuk beberapa barang yang dibeli dari supplier yang sama.

Informasi pembelian meliputi:

- Nama supplier.
- Tanggal pembelian.
- Daftar produk dan varian.
- Kuantitas setiap item.
- Harga beli per unit.
- Subtotal setiap item.
- Total transaksi.
- Catatan pembelian.

Ketentuan:

1. Nama supplier dicatat langsung pada transaksi pembelian.
2. Sistem tidak memerlukan master data supplier terpisah pada versi awal.
3. Satu transaksi pembelian dapat memiliki beberapa item.
4. Setiap pembelian yang disimpan akan menambah stok.
5. Sistem memperbarui harga modal menggunakan metode Weighted Average.

### 4.3 Weighted Average Cost

Sistem menggunakan metode Weighted Average untuk menghitung harga modal rata-rata ketika suatu produk atau varian dibeli kembali dengan harga berbeda.

Rumus:

**Harga Modal Rata-rata = Total Nilai Persediaan / Total Kuantitas Persediaan**

Contoh:

Pembelian pertama:
- 10 unit × Rp20.000 = Rp200.000.

Pembelian kedua:
- 10 unit × Rp25.000 = Rp250.000.

Perhitungan:

- Total stok = 20 unit.
- Total nilai persediaan = Rp450.000.
- Harga modal rata-rata = Rp450.000 / 20.

**Harga modal rata-rata baru = Rp22.500 per unit.**

Ketentuan:

1. Perhitungan dilakukan untuk setiap produk dan varian secara terpisah.
2. Harga modal rata-rata diperbarui ketika pembelian baru dicatat.
3. Harga modal rata-rata digunakan sebagai dasar perhitungan HPP dan rekomendasi harga jual.
4. Riwayat pembelian tetap disimpan agar perubahan harga modal dapat ditelusuri.

### 4.4 Pricing Management

Sistem membantu admin menentukan rekomendasi harga jual berdasarkan persentase markup.

Rumus:

**Rekomendasi Harga Jual = Harga Modal × (1 + Persentase Markup)**

#### A. Markup Produk Satuan

Persentase markup yang ditetapkan:

| Produk | Persentase Markup |
|---|---:|
| Sticker | 50% |
| Keychain | 50% |
| Totebag | 20% |
| Pouch | 20% |
| T-shirt | 20% |

Persentase markup diterapkan pada masing-masing produk atau varian sesuai harga modalnya.

#### B. Markup Bundling

Persentase markup bundling ditentukan berdasarkan warna totebag yang terdapat di dalam bundling.

| Komponen Totebag | Persentase Markup |
|---|---:|
| Totebag putih | 30% |
| Totebag hitam | 20% |

Aturan berlaku untuk seluruh bundling, termasuk bundling yang dibuat di kemudian hari.

Contoh penerapan:

| Nama Bundling | Komponen Totebag | Markup |
|---|---|---:|
| Starter Pack | Putih | 30% |
| Starter Pack | Hitam | 20% |
| Daily Techmates | Putih | 30% |
| Daily Techmates | Hitam | 20% |

Jika bundling menggunakan lebih dari satu warna totebag atau tidak menggunakan totebag, persentase markup harus ditentukan secara khusus oleh admin.

#### C. Persetujuan Harga Jual

Ketentuan:

1. Sistem menghitung rekomendasi harga jual secara otomatis.
2. Admin dapat meninjau dan membulatkan rekomendasi harga.
3. Harga jual final hanya berubah setelah disetujui admin.
4. Perubahan harga modal atau markup tidak otomatis mengubah harga jual final.
5. Sistem menyimpan riwayat perubahan harga.

Contoh:

- Harga modal: Rp61.250.
- Markup: 20%.
- Rekomendasi harga jual: Rp73.500.
- Harga jual final setelah pembulatan: Rp75.000.
- Keuntungan per unit: Rp13.750.

### 4.5 Inventory Management

Sistem mengelola jumlah stok setiap produk dan varian.

Perubahan stok terjadi melalui:

- Pembelian barang: stok bertambah.
- Pesanan yang pembayarannya diterima: stok berkurang secara permanen.
- Pesanan yang pembayarannya ditolak: alokasi stok dilepaskan.

Sistem menyimpan riwayat pergerakan stok yang meliputi:

- Produk dan varian.
- Jenis transaksi.
- Jumlah perubahan stok.
- Stok sebelum transaksi.
- Stok sesudah transaksi.
- Referensi transaksi.
- Waktu transaksi.

Sistem harus mencegah pemesanan melebihi jumlah stok yang tersedia.

### 4.6 Bundle Management

Sistem mendukung pembuatan bundling yang terdiri dari beberapa produk atau varian.

Contoh:

**Starter Pack**
- 1 Totebag.
- 1 Pouch.
- 1 Keychain.

**Daily Techmates**
- 1 Totebag.
- 1 T-shirt.

Ketentuan:

1. Bundle terdiri dari beberapa komponen produk.
2. Admin menentukan kuantitas setiap komponen.
3. Satu produk atau varian dapat digunakan dalam beberapa bundling.
4. Harga modal bundling dihitung berdasarkan total harga modal seluruh komponennya.
5. Persentase markup bundling mengikuti aturan warna totebag.
6. Admin menyetujui harga jual final bundling.
7. Bundle tidak memiliki stok fisik tersendiri.
8. Ketersediaan bundle dihitung berdasarkan stok komponen.
9. Ketika bundle terjual, stok setiap komponen berkurang sesuai kuantitas yang ditentukan.
10. Stok komponen yang sama tetap terintegrasi meskipun digunakan dalam beberapa bundling.

Rumus:

**Harga Modal Bundle = Total Harga Modal Seluruh Komponen**

**Stok Bundle = Nilai terkecil dari (Stok Komponen / Kebutuhan Komponen per Bundle)**

Hasil stok bundle dibulatkan ke bawah.

Contoh:

Starter Pack membutuhkan:
- 1 Totebag.
- 1 Pouch.
- 1 Keychain.

Stok tersedia:
- Totebag: 10.
- Pouch: 15.
- Keychain: 20.

Maka stok Starter Pack yang dapat dibuat adalah 10 bundle.

### 4.7 Order Management

Buyer dapat membuat pesanan berdasarkan katalog produk dan bundling.

Informasi pesanan meliputi:

- Kode pesanan.
- Nama pembeli.
- Kontak pembeli.
- Daftar produk atau bundle.
- Kuantitas.
- Harga satuan.
- Subtotal.
- Total pembayaran.
- Tanggal pesanan.
- Status pesanan.

Alur pemesanan:

1. Buyer melihat katalog.
2. Buyer memilih produk atau bundle.
3. Buyer mengisi informasi pembeli.
4. Buyer membuat pesanan.
5. Buyer mengunggah bukti pembayaran.
6. Pesanan menunggu verifikasi admin.
7. Admin memeriksa pembayaran.
8. Jika pembayaran diterima, pesanan dikonfirmasi dan stok dikurangi secara permanen.
9. Jika pembayaran ditolak, pesanan ditolak dan alokasi stok dilepaskan.

Sistem harus memeriksa ketersediaan stok sebelum menerima pesanan.

### 4.8 Payment Management

Sistem menggunakan pembayaran melalui transfer bank atau e-wallet dengan mekanisme unggah bukti pembayaran.

Informasi pembayaran meliputi:

- Kode pembayaran.
- Kode pesanan.
- Metode pembayaran.
- Nominal pembayaran.
- Bukti pembayaran.
- Tanggal pembayaran.
- Status verifikasi.
- Catatan admin.

Status pembayaran:

- Menunggu verifikasi.
- Diterima.
- Ditolak.

Ketentuan:

1. Buyer wajib mengunggah bukti pembayaran.
2. Admin memeriksa bukti pembayaran secara manual.
3. Admin dapat menerima atau menolak pembayaran.
4. Sistem memperbarui status pesanan berdasarkan hasil verifikasi.
5. Sistem tidak melakukan konfirmasi otomatis melalui rekening bank atau e-wallet karena belum menggunakan payment gateway.

### 4.9 Expense Management

Sistem menyediakan fitur pencatatan pengeluaran operasional untuk mendukung perhitungan laba bersih.

Informasi pengeluaran meliputi:

- Deskripsi pengeluaran.
- Kategori pengeluaran.
- Tanggal pengeluaran.
- Nominal.
- Bukti pengeluaran (opsional).
- Catatan.

Contoh kategori:

- Biaya operasional.
- Biaya kemasan.
- Biaya promosi.
- Biaya administrasi.
- Biaya lainnya.

Admin dapat menambah, melihat, mengubah, dan menghapus catatan pengeluaran.

### 4.10 Reporting

Sistem menyediakan laporan untuk membantu admin memantau kondisi merchandise.

#### A. Laporan Pembelian
- Riwayat pembelian.
- Nama supplier.
- Jumlah barang yang dibeli.
- Total biaya pembelian.

#### B. Laporan Persediaan
- Stok setiap produk dan varian.
- Harga modal rata-rata.
- Nilai persediaan.
- Riwayat perubahan stok.

#### C. Laporan Penjualan
- Riwayat pesanan.
- Produk dan bundle terjual.
- Kuantitas penjualan.
- Total pendapatan penjualan.

#### D. Laporan HPP
- Harga modal rata-rata.
- HPP produk terjual.
- HPP bundling berdasarkan komponen yang terjual.

#### E. Laporan Laba Kotor

**Laba Kotor = Pendapatan Penjualan − HPP Penjualan**

#### F. Laporan Pengeluaran
- Riwayat pengeluaran.
- Total pengeluaran operasional.
- Pengeluaran berdasarkan kategori.

#### G. Laporan Laba Bersih

**Laba Bersih = Laba Kotor − Total Pengeluaran Operasional**

Laporan dapat difilter berdasarkan periode tertentu, seperti harian, bulanan, atau rentang tanggal.

---

## 5. BUSINESS RULES

1. Setiap produk dapat memiliki beberapa varian.
2. Setiap varian memiliki harga modal, persentase markup, rekomendasi harga jual, dan harga jual final.
3. Sticker dan keychain menggunakan markup 50%.
4. Totebag, pouch, dan T-shirt menggunakan markup 20%.
5. Seluruh bundling yang menggunakan totebag putih menggunakan markup 30%.
6. Seluruh bundling yang menggunakan totebag hitam menggunakan markup 20%.
7. Bundling tanpa totebag atau dengan lebih dari satu warna totebag memerlukan penentuan markup khusus.
8. Harga modal diperbarui menggunakan metode Weighted Average.
9. Rekomendasi harga jual dihitung berdasarkan harga modal dan persentase markup.
10. Harga jual final harus disetujui admin.
11. Satu transaksi pembelian dapat berisi beberapa produk.
12. Satu produk dapat digunakan dalam beberapa bundling.
13. Bundle tidak memiliki stok fisik tersendiri.
14. Ketersediaan bundle bergantung pada stok seluruh komponennya.
15. Pembelian menambah stok.
16. Pesanan yang menunggu verifikasi menggunakan alokasi stok agar tidak terjadi kelebihan pemesanan.
17. Pembayaran diverifikasi secara manual oleh admin.
18. Pembayaran yang diterima mengurangi stok secara permanen.
19. Pembayaran yang ditolak melepaskan alokasi stok.
20. Laporan laba bersih memperhitungkan pengeluaran operasional yang dicatat dalam sistem.
21. Akses pengelolaan internal hanya diberikan kepada admin yang telah terautentikasi.

---

## 6. DATABASE REQUIREMENTS

Database menggunakan MongoDB Atlas dengan Mongoose.

Koleksi utama yang direncanakan:

### 6.1 users

Menyimpan akun admin.

Field:
- username
- email
- password_hash
- role
- created_at
- updated_at

### 6.2 products

Menyimpan informasi produk dan variannya.

Field:
- name
- category
- description
- variants
- status
- created_at
- updated_at

Informasi varian:
- variant_name
- stock_quantity
- reserved_quantity
- average_cost
- markup_percentage
- recommended_price
- selling_price
- price_history

### 6.3 purchases

Menyimpan transaksi pembelian.

Field:
- supplier_name
- purchase_date
- items
- total_amount
- notes
- created_at

Setiap item berisi:
- product_id
- variant_id
- quantity
- purchase_price
- subtotal

### 6.4 bundles

Menyimpan informasi bundling.

Field:
- bundle_name
- description
- components
- markup_percentage
- recommended_price
- selling_price
- status
- created_at
- updated_at

Setiap komponen berisi:
- product_id
- variant_id
- quantity

### 6.5 orders

Menyimpan data pesanan.

Field:
- order_code
- customer_name
- customer_contact
- items
- total_amount
- order_status
- created_at
- updated_at

### 6.6 payments

Menyimpan informasi pembayaran.

Field:
- order_id
- payment_method
- amount
- proof_image
- verification_status
- verified_by
- verified_at
- notes

### 6.7 stock_movements

Menyimpan riwayat perubahan stok.

Field:
- product_id
- variant_id
- movement_type
- quantity
- stock_before
- stock_after
- reference_id
- created_at

### 6.8 expenses

Menyimpan pengeluaran operasional.

Field:
- description
- category
- amount
- expense_date
- proof_image
- notes
- created_at
- updated_at

Struktur final database dapat disesuaikan pada tahap perancangan dan implementasi, selama seluruh kebutuhan fungsional tetap terpenuhi.

---

## 7. API REQUIREMENTS

Endpoint berikut merupakan rancangan awal REST API.

### 7.1 Authentication
- POST `/api/auth/login`
- GET `/api/auth/me`

### 7.2 Products
- GET `/api/products`
- GET `/api/products/:id`
- POST `/api/products`
- PUT `/api/products/:id`
- DELETE `/api/products/:id`

### 7.3 Purchases
- GET `/api/purchases`
- GET `/api/purchases/:id`
- POST `/api/purchases`

### 7.4 Pricing
- PATCH `/api/products/:id/variants/:variantId/pricing`
- GET `/api/products/:id/price-history`

### 7.5 Inventory
- GET `/api/inventory`
- GET `/api/stock-movements`
- GET `/api/stock-movements/:productId`
- POST `/api/stock-adjustments` (jika penyesuaian manual diaktifkan)

### 7.6 Bundles
- GET `/api/bundles`
- GET `/api/bundles/:id`
- POST `/api/bundles`
- PUT `/api/bundles/:id`
- DELETE `/api/bundles/:id`

### 7.7 Orders
- GET `/api/orders`
- GET `/api/orders/:id`
- POST `/api/orders`
- GET `/api/orders/track/:orderCode`

### 7.8 Payments
- POST `/api/payments`
- GET `/api/payments/:id`
- PATCH `/api/payments/:id/verify`

### 7.9 Expenses
- GET `/api/expenses`
- GET `/api/expenses/:id`
- POST `/api/expenses`
- PUT `/api/expenses/:id`
- DELETE `/api/expenses/:id`

### 7.10 Reports
- GET `/api/reports/summary`
- GET `/api/reports/sales`
- GET `/api/reports/purchases`
- GET `/api/reports/inventory`
- GET `/api/reports/profit`
- GET `/api/reports/expenses`

Endpoint pengelolaan internal wajib dilindungi autentikasi admin. Endpoint katalog, pemesanan, pembayaran, dan pelacakan pesanan hanya membuka akses yang diperlukan buyer.

---

## 8. NON-FUNCTIONAL REQUIREMENTS

### 8.1 Security
- Password admin disimpan dalam bentuk hash.
- Endpoint internal dilindungi autentikasi dan otorisasi.
- Buyer tidak dapat mengakses data internal.
- Bukti pembayaran harus disimpan dan diakses melalui mekanisme yang aman.

### 8.2 Performance
- Sistem dapat memproses operasi CRUD dan transaksi secara efisien.
- Perhitungan harga modal dan stok harus konsisten.

### 8.3 Reliability
- Perubahan stok harus sesuai dengan transaksi pembelian dan pesanan.
- Sistem harus mencegah pengurangan stok ganda.
- Perhitungan laporan harus berdasarkan transaksi yang valid.
- Perubahan stok dan pencatatan transaksi harus dilakukan secara konsisten.

### 8.4 Maintainability
- Struktur kode dibuat modular.
- Pemisahan route, controller, model, middleware, dan konfigurasi.
- API menggunakan format JSON.

---

## 9. TECHNOLOGY STACK

| Komponen | Teknologi |
|---|---|
| Runtime | Node.js |
| Backend Framework | Express.js |
| Database | MongoDB Atlas |
| ODM | Mongoose |
| API Testing | Postman |
| Code Editor | Visual Studio Code |
| Version Control | Git dan GitHub |

---

## 10. ACCEPTANCE CRITERIA

Sistem dinyatakan memenuhi kebutuhan apabila:

1. Admin dapat login dan mengakses fitur internal.
2. Admin dapat mengelola data produk dan varian.
3. Admin dapat mencatat pembelian dengan beberapa item dalam satu transaksi.
4. Sistem dapat memperbarui stok dan menghitung harga modal Weighted Average.
5. Sistem dapat menghitung rekomendasi harga jual berdasarkan markup produk.
6. Sistem menerapkan markup bundling berdasarkan warna totebag.
7. Harga jual final hanya berubah setelah persetujuan admin.
8. Produk yang sama dapat digunakan dalam beberapa bundling.
9. Sistem dapat menghitung ketersediaan bundle berdasarkan stok komponennya.
10. Buyer dapat membuat pesanan dan mengunggah bukti pembayaran.
11. Admin dapat menerima atau menolak bukti pembayaran.
12. Perubahan stok mengikuti status pembayaran dan pesanan.
13. Admin dapat mencatat pengeluaran operasional.
14. Sistem dapat menghasilkan laporan pembelian, penjualan, persediaan, HPP, laba kotor, dan laba bersih.
15. Seluruh endpoint dapat diuji melalui Postman.

---

## 11. DEVELOPMENT PHASES

### Phase 1 – Project Setup
- Menyiapkan Node.js dan Express.js.
- Membuat project backend.
- Menghubungkan MongoDB Atlas.
- Menyiapkan struktur folder.

### Phase 2 – Authentication and Product Management
- Membuat login admin.
- Membuat middleware autentikasi.
- Membuat CRUD produk dan varian.

### Phase 3 – Purchase and Inventory
- Membuat pencatatan pembelian.
- Mengimplementasikan Weighted Average.
- Membuat pengelolaan stok.
- Membuat stock movements.

### Phase 4 – Pricing and Bundling
- Mengimplementasikan rekomendasi harga jual.
- Menerapkan aturan markup produk.
- Menerapkan aturan markup bundling berdasarkan warna totebag.
- Membuat persetujuan harga.
- Membuat pengelolaan bundling dan perhitungan stok komponennya.

### Phase 5 – Order and Payment
- Membuat pemesanan buyer.
- Membuat unggah bukti pembayaran.
- Membuat verifikasi pembayaran admin.
- Mengimplementasikan alokasi dan pengurangan stok.

### Phase 6 – Expense and Reporting
- Membuat pencatatan pengeluaran.
- Membuat laporan pembelian dan penjualan.
- Membuat laporan persediaan dan HPP.
- Mengimplementasikan perhitungan laba kotor dan laba bersih.

### Phase 7 – Testing and Documentation
- Menguji seluruh endpoint menggunakan Postman.
- Menguji validasi dan skenario transaksi.
- Menyusun dokumentasi API.

---

## 12. SUCCESS INDICATORS

Keberhasilan sistem diukur melalui:

1. Data produk, pembelian, stok, dan penjualan tersimpan terpusat.
2. Perubahan stok tercatat otomatis berdasarkan transaksi.
3. Harga modal rata-rata dihitung secara konsisten.
4. Rekomendasi harga jual dapat dihasilkan secara otomatis.
5. Persentase markup diterapkan sesuai ketentuan produk dan bundling.
6. Pengelolaan bundling tidak menyebabkan stok komponen terpisah atau tidak sinkron.
7. Pembayaran dapat diverifikasi melalui sistem.
8. Pengeluaran operasional tercatat dengan baik.
9. Laporan keuangan dapat menampilkan laba bersih berdasarkan pendapatan, HPP, dan pengeluaran.

---

## 13. FINALIZED BUSINESS DECISIONS

| Aspek | Keputusan |
|---|---|
| Metode harga modal | Weighted Average |
| Pengelolaan supplier | Nama supplier dicatat pada transaksi pembelian |
| Pembelian | Satu transaksi dapat berisi beberapa produk |
| Markup Sticker | 50% |
| Markup Keychain | 50% |
| Markup Totebag | 20% |
| Markup Pouch | 20% |
| Markup T-shirt | 20% |
| Markup bundling dengan totebag putih | 30% |
| Markup bundling dengan totebag hitam | 20% |
| Produk dalam beberapa bundling | Diizinkan |
| Autentikasi | Admin saja |
| Pembayaran | Upload bukti pembayaran |
| Verifikasi pembayaran | Manual oleh admin |
| Laporan keuangan | Sampai laba bersih |
| Pengeluaran operasional | Dicatat dalam sistem |
| Frontend | Tidak termasuk |
| Pengujian API | Postman |

**Dokumen ini menjadi acuan utama dalam proses perancangan database, pengembangan REST API, dan pengujian Veterantech Merch Manager.**