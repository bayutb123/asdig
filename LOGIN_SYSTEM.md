# Sistem Login Wali Kelas - Absen Digital

## Deskripsi
Sistem login untuk wali kelas yang memungkinkan akses ke dashboard manajemen absensi siswa dengan autentikasi yang aman.

## Fitur Utama

### 🔐 Autentikasi
- Login dengan username dan password
- Validasi kredensial
- Session management dengan localStorage
- Auto-redirect untuk user yang sudah login
- Protected routes untuk halaman yang memerlukan autentikasi

### 👨‍🏫 Dashboard Wali Kelas
- Informasi profil wali kelas (nama, kelas, NIP)
- Statistik absensi siswa
- Tabel absensi dengan filter
- Quick actions untuk manajemen
- Logout functionality

### 🎨 UI/UX
- Design responsif untuk desktop dan mobile
- Dark mode support
- Loading states dan error handling
- Animasi dan transisi yang smooth
- Bahasa Indonesia (localized)

## Akun Demo

Gunakan kredensial berikut untuk testing:

| Username    | Password    | Nama                    | Kelas    | NIP               |
|-------------|-------------|-------------------------|----------|-------------------|
| walikelas1  | password123 | Ibu Sari Dewi, S.Pd     | 12 IPA 1 | 196801011990032001|
| walikelas2  | password123 | Bapak Ahmad Wijaya, S.Pd| 12 IPA 2 | 197205151995121002|
| walikelas3  | password123 | Ibu Maya Sari, S.Pd     | 12 IPS 1 | 198003201998032003|
| walikelas4  | password123 | Bapak Dedi Kurniawan, S.Pd| 12 IPS 2 | 197812101999031004|

## Struktur File

```
src/
├── app/
│   ├── login/
│   │   └── page.tsx          # Halaman login
│   ├── dashboard/
│   │   └── page.tsx          # Dashboard wali kelas
│   ├── layout.tsx            # Root layout dengan AuthProvider
│   └── page.tsx              # Homepage dengan tombol login
├── components/
│   ├── AttendanceTable.tsx   # Komponen tabel absensi
│   └── ProtectedRoute.tsx    # HOC untuk protected routes
└── contexts/
    └── AuthContext.tsx       # Context untuk state management auth
```

## Cara Menggunakan

### 1. Akses Halaman Login
- Buka aplikasi di browser
- Klik tombol "Login Wali Kelas" di homepage
- Atau akses langsung `/login`

### 2. Login
- Masukkan username dan password dari tabel demo di atas
- Klik tombol "Masuk"
- Sistem akan memvalidasi dan redirect ke dashboard

### 3. Dashboard
- Lihat informasi kelas dan profil
- Gunakan quick actions untuk manajemen
- Akses tabel absensi dengan filter
- Logout dengan tombol "Keluar"

## Teknologi yang Digunakan

- **Next.js 15** - React framework dengan App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling dan responsive design
- **React Context** - State management untuk autentikasi
- **localStorage** - Session persistence (demo purposes)

## Keamanan

⚠️ **Catatan Penting**: Implementasi ini menggunakan localStorage untuk demo. Untuk production:

1. Gunakan JWT tokens dengan HTTP-only cookies
2. Implementasi refresh token mechanism
3. Server-side session validation
4. HTTPS untuk semua komunikasi
5. Rate limiting untuk login attempts
6. Password hashing dengan bcrypt/argon2

## Pengembangan Selanjutnya

### Fitur yang Bisa Ditambahkan:
- [ ] Forgot password functionality
- [ ] Multi-factor authentication (MFA)
- [ ] Role-based access control (RBAC)
- [ ] Audit logging
- [ ] Session timeout
- [ ] Password strength requirements
- [ ] Account lockout after failed attempts
- [ ] Email notifications
- [ ] Mobile app support
- [ ] SSO integration

### Integrasi Database:
- [ ] User management dengan database
- [ ] Encrypted password storage
- [ ] Session management di server
- [ ] Real-time data synchronization

## Testing

Untuk testing sistem login:

1. **Happy Path**: Login dengan kredensial yang benar
2. **Error Handling**: Coba login dengan kredensial salah
3. **Protected Routes**: Akses `/dashboard` tanpa login
4. **Session Persistence**: Refresh browser setelah login
5. **Logout**: Test logout functionality

## Support

Jika ada pertanyaan atau issue, silakan buat ticket di repository ini.
