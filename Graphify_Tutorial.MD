# 🚀 Tutorial Graphify — Tim Frontend (LMS V2)

Dokumen ini memandu pengembang Frontend untuk menggunakan dan memperbarui grafik pengetahuan (*knowledge graph*) proyek menggunakan **Graphify** dan **Google Antigravity**. Grafik ini merekam struktur halaman Next.js (App Router), tata letak komponen React, integrasi state modal dasbor, dan pemanggilan endpoint API backend.

---

## 📋 Persyaratan Awal (Prerequisites)
Sebelum memulai, pastikan laptop Anda sudah memiliki:
1. **Python 3.10+** (Unduh dari [python.org](https://www.python.org/downloads/) atau manajer paket Anda).
2. **uv** (Manajer paket Python ultra-cepat, direkomendasikan):
   - **Windows (PowerShell)**: `winget install astral-sh.uv`
   - **macOS (Homebrew)**: `brew install uv`
   - **Linux**: `curl -LsSf https://astral.sh/uv/install.sh | sh`

---

## 🛠️ Langkah Instalasi (Satu Kali Saja)

1. **Instal package CLI Graphify**:
   ```bash
   uv tool install graphifyy
   ```
   *(Pastikan terminal Anda dapat memanggil perintah `graphify --version`. Jika error "command not found", buka terminal baru atau jalankan `uv tool update-shell` untuk menyegarkan PATH).*

2. **Daftarkan skill secara global di Asisten AI**:
   ```bash
   graphify install
   ```

3. **Aktifkan aturan Google Antigravity di folder proyek ini**:
   Masuk ke folder `frontend` lalu daftarkan aturan lokal:
   ```bash
   cd frontend
   graphify antigravity install
   ```
   *Langkah ini menghubungkan instruksi asisten di `.agents/rules/graphify.md` agar Antigravity selalu berkonsultasi ke grafik sebelum menjawab pertanyaan Anda.*

4. **Aktifkan Git Commit Hook (Sangat Direkomendasikan)**:
   Di root folder `frontend`, jalankan:
   ```bash
   graphify hook install
   ```
   *Hook ini akan memicu pembaruan grafik otomatis secara lokal (AST-only, tanpa biaya LLM API) setiap kali Anda melakukan `git commit`. Ini juga memasang driver merge otomatis untuk mencegah konflik git pada file `graph.json`.*

---

## 🔄 Cara Melanjutkan & Memperbarui Grafik

Karena file `graphify-out/` sudah ter-commit di Git, Anda tidak perlu mengekstrak grafik dari nol. Grafik sudah siap digunakan langsung setelah `git pull`.

Jika Anda melakukan perubahan kode (seperti mengedit halaman dasbor, merombak komponen React, atau menambahkan styling Next.js) dan ingin memperbarui grafiknya:

### Metode 1: Lewat Chat Google Antigravity (Rekomendasi)
Ketik perintah berikut di dalam chat Google Antigravity Anda:
```text
/graphify . --update
```

### Metode 2: Lewat Terminal CLI (Headless / Offline)
Jika ingin memperbarui cepat lewat terminal tanpa membuka chat asisten:
```bash
graphify extract . --update
```

---

## 🔍 Cara Bertanya & Kueri Grafik

Saat berdiskusi dengan Google Antigravity, asisten secara otomatis akan membaca grafik. Namun, Anda juga dapat secara eksplisit memintanya mencari dengan perintah:

1. **Kueri Pertanyaan Bebas**:
   ```text
   /graphify query "komponen apa saja yang dipakai untuk merender dasbor admin?"
   ```
2. **Menelusuri Relasi Antar Halaman & Endpoint**:
   ```text
   /graphify path "DashboardPage" "AdminDashboard"
   ```
3. **Mempelajari Detail Komponen**:
   ```text
   /graphify explain "ThemeToggle"
   ```

### 📊 Visualisasi Interaktif
Anda dapat membuka file [frontend/graphify-out/graph.html](graphify-out/graph.html) langsung di browser Anda (Double-click file tersebut). Grafik interaktif ini menampilkan peta visual dependensi struktur Next.js frontend kita yang dapat diklik dan difilter per-node.
