# Infinite Learning LMS v2 - Design System & Guide (DESIGN.MD)

Dokumen ini menjelaskan sistem desain, filosofi antarmuka, tipografi, palet warna, serta spesifikasi komponen yang digunakan dalam pengembangan Learning Management System (LMS) Infinite Learning Fase 1.

---

## 1. Filosofi Desain

Sistem desain LMS Infinite Learning mengintegrasikan dua filosofi utama:
1. **Google Classroom Layout Structure**: Mengadopsi struktur tata letak yang bersih, navigasi modular, penggunaan kartu (*cards*) yang ringkas, serta ruang putih (*white space*) yang lega untuk meminimalkan beban kognitif pengguna (terutama siswa).
2. **Anthropic Claude Minimalist Aesthetics**: Mengadopsi tipografi modern yang tajam, kontras elemen visual yang tinggi, garis batas tipis yang elegan, serta mikro-interaksi minimalis untuk memberikan impresi produk premium, cepat, dan profesional.

---

## 2. Panduan Gaya (Style Guide)

### A. Tipografi
* **Font Header**: `Lexend Deca` (ui-sans-serif, system-ui, sans-serif)
  * Digunakan untuk: Judul utama halaman (H1), judul seksi (H2), nama halaman, hero text, dan angka statistik besar.
  * Karakter: Bersih, geometris, modern, dan memberikan struktur penegasan yang kuat.
* **Font Body & UI**: `Inclusive Sans` (ui-sans-serif, system-ui, sans-serif)
  * Digunakan untuk: Paragraf deskripsi, teks tombol, label input, placeholder, tabel, menu navigasi, dan konten umum.
  * Karakter: Ramah aksesibilitas (*highly legible*), memiliki keterbacaan yang sangat baik di berbagai ukuran layar.

### B. Palet Warna (Color Palette)

| Warna | Hex Code | Variabel CSS | Penggunaan Utama |
| :--- | :--- | :--- | :--- |
| **Brand Purple** | `#8A3DFF` | `var(--primary)` | Warna identitas utama, tombol CTA primer, indikator aktif, dan aksen navigasi. |
| **Brand Purple Hover** | `#667EFF` | `var(--primary-hover)` | Status hover/fokus untuk elemen interaktif berbasis ungu. |
| **Brand Yellow** | `#FFCD29` | `var(--secondary)` | Elemen gamifikasi, penanda peringatan, bintang pencapaian, dan aksen sorotan. |
| **Brand Gray** | `#8E8E93` | `var(--muted-foreground)` | Teks sekunder, border komponen, teks placeholder, dan elemen non-aktif. |
| **Pure White** | `#FFFFFF` | `var(--background)` | Warna latar belakang utama, isi kartu, dan teks kontras pada latar belakang gelap. |
| **Pure Black** | `#000000` | `var(--foreground)` | Teks utama, judul tebal, ikon utama, dan batas penekanan kontras. |
| **Purple Gradient** | `#8A3DFF` ke `#667EFF` | `linear-gradient` | Latar belakang hero section, panel autentikasi sisi kiri, dan spanduk premium. |

---

## 3. Komponen Desain & Spesifikasi

### A. Tombol (Buttons)
Menggunakan variasi dari pustaka komponen Shadcn UI dengan animasi transisi yang lembut:
* **Tombol Primer (Primary)**:
  * Gaya: Latar belakang `#8A3DFF` (Ungu), teks `#FFFFFF` (Putih).
  * Hover: Warna bergeser ke `#667EFF` dengan pergeseran halus (`transition-colors duration-200`).
* **Tombol Sekunder (Secondary / Outline)**:
  * Gaya: Border tipis `1px` berwarna `#8E8E93` (Abu-abu), latar belakang transparan, teks `#000000` (atau `#FFFFFF` pada mode gelap).
  * Hover: Latar belakang berubah menjadi abu-abu tipis transparan.

### B. Bidang Isian Form (Inputs & Labels)
* **Labels**: Menggunakan `Inclusive Sans`, ukuran teks kecil (`text-xs` / `text-sm`), ketebalan medium (`font-semibold`), warna abu-abu gelap.
* **Input Fields**:
  * Gaya dasar: Border tipis `1px` berwarna `#8E8E93` dengan sudut tumpul (`rounded-lg`), latar belakang bersih.
  * Efek Fokus (Focus State): Border berubah menjadi `#8A3DFF` (Ungu) disertai efek bayangan/glow ungu tipis (`ring-1 ring-brand-purple`).
  * Autocomplete & Spellcheck dinonaktifkan jika tidak diperlukan untuk performa forms yang cepat.

### C. Tabel Pengguna (CRUD Table)
* **Layout**: Datar (*flat*), bersudut tumpul (`rounded-xl`), memiliki pembatas tipis (`border-border`), dan mendukung scroll horizontal di perangkat seluler.
* **Row Hover**: Setiap baris tabel berubah latar belakangnya menjadi abu-abu transparan saat didekati kursor (`hover:bg-secondary/15`).
* **Pilihan Ganda (Checkbox)**: Checkbox menggunakan aksen warna ungu utama untuk menyelaraskan dengan sistem desain.

### D. Dialog Konfirmasi (Custom Alert Dialog)
* **Modal Overlay**: Menggunakan efek blur latar belakang tipis (`backdrop-blur-xs`) dengan kegelapan 80% (`bg-background/80`).
* **Entrance Animation**: Animasi membesar perlahan (`scale-95` to `scale-100`) menggunakan Framer Motion untuk impresi sentuhan modern.

---

## 4. Struktur & Aturan Tata Letak Halaman

### A. Landing Page
* **Struktur**: Navigasi Atas (Logo Kiri, CTA Kanan) → Hero Section (Teks Lexend Deca besar, CTA ganda) → Grid Program 4 Kolom → Preview Dasbor LMS → Footer.
* **Signature Element**: Hero section menggunakan paduan spanduk ungu solid/gradasi bersih dengan lengkungan lembut di bagian transisi bawah untuk memisahkan dengan konten putih.

### B. Login Page
* **Layout**: Terbagi menjadi 2 kolom (Split-Screen) pada layar desktop:
  * **Kolom Kiri**: Spanduk visual besar dengan latar belakang Gradasi Ungu dan logo Infinite Learning.
  * **Kolom Kanan**: Form login bersih dengan tombol masuk tunggal menggunakan tombol OAuth Google "Masuk dengan Google".
* **Aksesibilitas**: Pesan error memiliki wadah `aria-live="polite"` untuk pembaca layar tunanetra.

### C. Dasbor Admin (Dashboard)
* **Sub-Tab Navigation**: Menggunakan baris tab horizontal dengan indikator garis bawah warna ungu aktif.
* **Data Management**: Pengeditan data tidak dilakukan langsung dalam baris tabel untuk menghindari kerusakan dimensi tata letak (*layout shifting*), melainkan melalui **Slide-Over Panel / Modal Dialog** di sisi tengah layar.
