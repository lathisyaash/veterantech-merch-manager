Veterantech Merch Manager



Backend API untuk mengelola operasional penjualan merchandise Veterantech.



Fitur Utama



Manajemen produk dan varian produk



Manajemen bundling merchandise



Pencatatan pembelian dan penambahan stok



Perhitungan harga jual



Manajemen pesanan dan verifikasi pembayaran



Upload bukti pembayaran



Pengelolaan inventaris dan pergerakan stok



Pencatatan biaya operasional



Laporan pendapatan, HPP, laba kotor, dan laba bersih



Pembatalan otomatis pesanan kedaluwarsa



Teknologi



Node.js



Express.js



MongoDB



Mongoose



Multer



Postman



Persyaratan



Node.js dan npm



MongoDB lokal dengan replica set rs0



Database: veterantech\_merch



Instalasi



Clone repository:



git clone URL-REPOSITORY



Masuk ke folder project:



cd veterantech-merch-manager



Install dependencies:



npm install



Jalankan server:



npm start



Server berjalan di http://localhost:3000.



Endpoint API



Method



Endpoint



Fungsi



GET



/



Memeriksa status server



Various



/api/products



Manajemen produk



Various



/api/bundles



Manajemen bundling



Various



/api/purchases



Pencatatan pembelian



Various



/api/pricing



Perhitungan harga jual



Various



/api/inventory



Pengelolaan inventaris



Various



/api/orders



Manajemen pesanan



Various



/api/expenses



Biaya operasional



GET



/api/reports/summary



Ringkasan laporan



Pengujian



Pengujian API dilakukan menggunakan Postman, mencakup produk, bundling, pesanan, pembayaran, stok, pengeluaran, dan laporan keuangan.



Catatan



Project ini merupakan backend API tanpa frontend. Demonstrasi sistem dilakukan melalui Postman.

