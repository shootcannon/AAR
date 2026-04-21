<img width="1071" height="309" alt="Screenshot 2026-04-21 152558" src="https://github.com/user-attachments/assets/b5c9a631-476c-4498-bc7f-b072626f420e" />

# ⚔️ AAR Games Adventure

**AAR Games Adventure** adalah sebuah game *2D Top-Down Action RPG / Dungeon Crawler* berbasis web yang dimainkan secara *real-time*. Game ini menampilkan sistem pertarungan yang mulus, grafik dan animasi prosedural (tanpa menggunakan gambar/aset eksternal), pencahayaan dinamis (*dynamic lighting*), serta dukungan penuh untuk dimainkan di PC maupun *smartphone* (Mobile-Responsive).

<img width="5479" height="8192" alt="Player Animation and Game-2026-04-21-090243" src="https://github.com/user-attachments/assets/8addfbad-7dbc-47f0-bdc7-5a938c7f3a52" />

Game ini murni dibangun dari awal (dari nol) tanpa menggunakan *game engine* pihak ketiga demi mengoptimalkan performa dan pemahaman fundamental pembuatan game web.

---

## 🚀 Teknologi yang Digunakan

Game ini dikembangkan menggunakan **Vanilla Web Stack** dengan arsitektur **ES6 Modules**. Tidak ada *framework* atau *library* eksternal yang diinstal.

### Bahasa Pemrograman & API:
*   **HTML5**: Struktur utama antarmuka dan penggunaan elemen `<canvas>` sebagai wadah perenderan grafis game.
*   **CSS3**: Desain antarmuka (UI), filter visual bergaya retro (*Vignette* dan *CRT Scanlines*), serta antarmuka tombol sentuh yang responsif untuk perangkat seluler.
*   **Vanilla JavaScript (ES6+)**: Inti dari seluruh logika game, termasuk *Game Loop* (60 FPS), *Fisika & Interpolasi (Lerp)*, Deteksi Tabrakan, *Artificial Intelligence* (AI) Musuh, dan Sistem Partikel.
*   **HTML5 Canvas API**: Seluruh karakter, monster, lingkungan, bayangan, pedang, hingga jubah yang berkibar **digambar murni menggunakan kode matematika dan Canvas API** (Procedural Drawing), bukan gambar `.png` atau `.jpg`.

### Server (Backend):
*   **Node.js**: Digunakan sebagai *local static file server* (menggunakan *built-in module* `http`, `fs`, dan `path`) untuk men-serve file ES6 Modules (`.js`) tanpa melanggar kebijakan keamanan *CORS browser*.

---

## ✨ Fitur Utama

1.  **Real-Time Action Combat**: Bertarung melawan monster secara langsung. Dilengkapi dengan efek *Invincibility Frame (I-Frame)*, efek dorongan mundur (*knockback*), tebasan pedang, dan teks *damage* (Partikel).
2.  **Endless Dungeon & Procedural Map**: Peta dan rintangan digenerate secara acak. Monster akan terus bereproduksi (*spawn*) di area gelap yang jauh dari pandangan Ksatria.
3.  **Dynamic Lighting System**: Menggunakan gradien radial kanvas dipadukan dengan *composite operations* untuk membuat ruang bawah tanah gelap dengan cahaya obor yang berpusat pada karakter utama.
4.  **Story Cutscene Engine**: Dilengkapi kotak dialog bergaya JRPG dengan efek *Typewriter* dan potret karakter di awal permainan.
5.  **Procedural Animation**: Karakter bernafas, jubah berkibar, langkah kaki, dan slime yang memantul, semuanya dianimasikan secara matematis berdasarkan waktu (Trigonometri Sine/Cosine).
6.  **Cross-Platform (Mobile Ready)**: Mendeteksi ukuran layar secara otomatis dan memunculkan *Virtual D-Pad* serta Tombol Aksi di layar sentuh.

---

## 🛠️ Panduan Instalasi & Setup (Setup Guide)

Karena game ini dipecah menjadi beberapa file Modul ES6, kita tidak bisa sekadar membuka file `index.html` dengan klik ganda (karena sistem keamanan browser mencegah pemuatan modul file lokal `file:///`). Anda harus menjalankannya lewat server lokal Node.js.

### Prasyarat
Pastikan Anda sudah menginstal **Node.js** di komputer/laptop Anda.

### Langkah-langkah Menjalankan Game

**1. Struktur Folder**
Pastikan file Anda tersusun rapi dengan struktur berikut:
```text
AAR-Games-Adventure/
├── index.html
├── README.md
└── script/
    ├── constants.js
    ├── entity.js
    ├── items.js
    ├── main.js
    ├── map.js
    ├── server.js
    └── ui.js
```

**2. Buka Terminal / Command Prompt**
Arahkan terminal Anda ke dalam folder proyek utama (`AAR`).

**3. Jalankan Server Node.js**
Ketik perintah berikut di terminal untuk menyalakan server lokal:
```bash
node script/server.js
```
*Catatan: Anda akan melihat pesan "Game Server berjalan! Buka http://localhost:3000 di Browser Anda."*

**4. Mainkan Gamenya**
Buka Web Browser favorit Anda (Google Chrome, Firefox, Microsoft Edge, atau Safari) dan kunjungi alamat URL:
```text
http://localhost:3000
```

---

## 🎮 Kontrol Permainan

### Di Komputer (PC / Laptop)
*   `W`, `A`, `S`, `D` : Berjalan / Bergerak.
*   `SPASI` : Mengayunkan Pedang (Menyerang) & Melanjutkan dialog cerita.
*   `H` : Meminum Ramuan Penyembuh (Health Potion) dari Inventaris.
*   `ESC` : Jeda Permainan (Pause / Resume).
*   `R` : Bangkit kembali (Restart) setelah Layar Game Over.

### Di Perangkat Seluler (Smartphone)
*   **D-Pad Kiri**: Sentuh tombol arah (W,A,S,D) untuk bergerak.
*   **Tombol Kanan**: 
    *   **ATK**: Menyerang / Lanjut cerita.
    *   **HEAL**: Meminum Health Potion.

---
