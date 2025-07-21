# Fitur Absen Manual - Absen Digital

## Deskripsi
Fitur absen manual memungkinkan wali kelas untuk menginput dan mengedit data absensi siswa secara manual dengan interface yang user-friendly dan komprehensif.

## Fitur Utama

### 🎯 **Input Absensi Manual**
- **Halaman Khusus**: `/absen-manual` untuk input absensi lengkap
- **Filter Otomatis**: Hanya menampilkan siswa dari kelas wali kelas yang login
- **Pilihan Status**: Hadir, Tidak Hadir, Terlambat, Izin
- **Input Waktu**: Jam masuk dan keluar untuk siswa yang hadir/terlambat
- **Keterangan**: Field tambahan untuk catatan khusus

### ✏️ **Edit Inline di Tabel**
- **Edit Langsung**: Klik tombol edit di tabel utama untuk edit cepat
- **Real-time Update**: Perubahan langsung terlihat di statistik
- **Validasi Otomatis**: Jam masuk/keluar hanya aktif untuk status yang relevan

### 📊 **Aksi Massal**
- **Tandai Semua Hadir**: Set semua siswa sebagai hadir dengan waktu otomatis
- **Tandai Semua Tidak Hadir**: Set semua siswa sebagai tidak hadir
- **Reset Semua**: Kembalikan semua data ke status default

### 📈 **Statistik Real-time**
- **Total Siswa**: Jumlah keseluruhan siswa di kelas
- **Hadir**: Jumlah siswa yang hadir
- **Tidak Hadir**: Jumlah siswa yang tidak hadir
- **Terlambat**: Jumlah siswa yang terlambat
- **Izin**: Jumlah siswa yang izin

## Cara Menggunakan

### 1. Akses Fitur Absen Manual

#### Dari Dashboard:
1. Login sebagai wali kelas
2. Klik card "Absen Manual" di quick actions
3. Akan diarahkan ke halaman input manual

#### Dari Tabel Absensi:
1. Klik tombol "Input Manual" di header tabel
2. Atau klik tombol "Edit" di kolom aksi untuk edit individual

### 2. Input Absensi Manual

#### Mode Edit Lengkap:
1. Klik tombol "Edit Absensi" di header halaman
2. Gunakan dropdown untuk mengubah status setiap siswa
3. Input jam masuk/keluar untuk siswa yang hadir/terlambat
4. Tambahkan keterangan jika diperlukan
5. Klik "Simpan" untuk menyimpan perubahan

#### Aksi Massal:
1. Aktifkan mode edit
2. Gunakan tombol aksi massal:
   - **Tandai Semua Hadir**: Otomatis set waktu saat ini
   - **Tandai Semua Tidak Hadir**: Clear semua waktu
   - **Reset Semua**: Kembalikan ke default
3. Sesuaikan individual jika diperlukan
4. Simpan perubahan

### 3. Edit Inline di Tabel

#### Edit Cepat:
1. Klik tombol edit (ikon pensil) di kolom aksi
2. Ubah status menggunakan dropdown
3. Input waktu jika status hadir/terlambat
4. Klik tombol centang untuk simpan
5. Atau klik tombol X untuk batal

## Interface dan Navigasi

### 📱 **Responsive Design**
- **Desktop**: Layout tabel penuh dengan semua kolom
- **Mobile**: Tabel scrollable horizontal untuk akses semua data
- **Touch-friendly**: Tombol dan input yang mudah diakses di mobile

### 🎨 **Visual Indicators**
- **Status Badges**: Warna berbeda untuk setiap status
  - 🟢 Hijau: Hadir
  - 🔴 Merah: Tidak Hadir
  - 🟡 Kuning: Terlambat
  - 🔵 Biru: Izin
- **Loading States**: Indikator saat menyimpan data
- **Success Messages**: Konfirmasi setelah berhasil menyimpan

### ⌨️ **Keyboard Shortcuts**
- **Tab**: Navigasi antar field input
- **Enter**: Simpan edit inline
- **Escape**: Batal edit inline

## Validasi dan Aturan Bisnis

### ✅ **Validasi Input**
- **Jam Masuk/Keluar**: Hanya aktif untuk status Hadir dan Terlambat
- **Format Waktu**: Validasi format HH:MM
- **Konsistensi Data**: Jam keluar tidak boleh lebih awal dari jam masuk

### 🔒 **Aturan Akses**
- **Wali Kelas Only**: Hanya bisa edit siswa dari kelas sendiri
- **Session Validation**: Harus login untuk akses fitur
- **Data Isolation**: Setiap wali kelas hanya lihat data kelasnya

## Data dan Penyimpanan

### 💾 **Struktur Data**
```typescript
interface Student {
  id: string;
  name: string;
  studentId: string;
  class: string;
  status: 'Hadir' | 'Tidak Hadir' | 'Terlambat' | 'Izin';
  checkInTime?: string;
  checkOutTime?: string;
  date: string;
  notes?: string;
}
```

### 🔄 **State Management**
- **Local State**: React useState untuk UI state
- **Real-time Updates**: Immediate feedback pada perubahan
- **Optimistic Updates**: UI update sebelum server response

## Integrasi dengan Sistem

### 🔗 **Navigasi**
- **Breadcrumb**: Navigasi kembali ke dashboard
- **Deep Linking**: URL langsung ke halaman absen manual
- **Context Aware**: Otomatis filter berdasarkan kelas wali kelas

### 📊 **Sinkronisasi Data**
- **Dashboard Stats**: Update otomatis statistik di dashboard
- **Attendance Table**: Sinkronisasi dengan tabel utama
- **Real-time Refresh**: Data terbaru saat navigasi antar halaman

## Pengembangan Selanjutnya

### 🚀 **Fitur Tambahan**
- [ ] Import/Export data absensi
- [ ] Template absensi harian
- [ ] Notifikasi otomatis ke orang tua
- [ ] Laporan absensi per periode
- [ ] Backup dan restore data
- [ ] Audit trail perubahan data

### 🔧 **Peningkatan Teknis**
- [ ] Offline support dengan service worker
- [ ] Real-time collaboration antar wali kelas
- [ ] Advanced filtering dan sorting
- [ ] Bulk operations untuk multiple dates
- [ ] API integration untuk sync dengan sistem sekolah

## Testing

### 🧪 **Skenario Testing**
1. **Input Manual**: Test semua kombinasi status dan waktu
2. **Edit Inline**: Test edit dan cancel functionality
3. **Bulk Actions**: Test aksi massal dengan berbagai kondisi
4. **Validation**: Test validasi input dan error handling
5. **Navigation**: Test navigasi antar halaman dan state persistence

### 📱 **Device Testing**
- **Desktop**: Chrome, Firefox, Safari, Edge
- **Mobile**: iOS Safari, Android Chrome
- **Tablet**: iPad, Android tablet
- **Touch**: Test touch interactions dan gestures
