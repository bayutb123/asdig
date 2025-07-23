# 🚀 SUPABASE QUICK SETUP - ABSEN DIGITAL

## ⚡ 5-Minute Setup Guide

### Step 1: Open Supabase SQL Editor
1. Go to your Supabase project: https://sbmvkezhsoqyfgbbjpfz.supabase.co
2. Click **SQL Editor** in the left sidebar
3. Click **New Query**

### Step 2: Run Database Setup
1. Copy the **ENTIRE** content from `supabase/complete_setup.sql`
2. Paste it into the SQL Editor
3. Click **Run** button (or press Ctrl+Enter)
4. Wait for completion (should take ~10 seconds)

### Step 3: Verify Setup
Go to **Table Editor** and verify these tables exist:
- ✅ `users` (8 rows)
- ✅ `classes` (6 rows) 
- ✅ `students` (8 rows)
- ✅ `attendance_records` (14 rows)
- ✅ `attendance_sessions` (0 rows)

### Step 4: Test Login
```bash
npm run dev
```

**Login Credentials:**
- **Admin**: `admin` / `admin123`
- **Teacher**: `siti_nurhaliza` / `teacher123`

---

## 🎯 What You Get

### 📊 **Sample Data**
- **2 Admins**: Administrator, Kepala Sekolah
- **6 Teachers**: Siti, Ahmad, Rina, Budi, Dewi, Hendra
- **6 Classes**: Kelas 1A through 6A
- **8 Students**: 5 in Kelas 1A, 3 in Kelas 2A
- **14 Attendance Records**: Today and yesterday data

### 🔐 **Security Features**
- Row Level Security (RLS) enabled
- Role-based access control
- Data isolation between users
- Secure API endpoints

### ⚡ **Real-time Features**
- Live attendance updates
- Multi-user collaboration
- Instant data synchronization
- WebSocket connections

---

## 🔑 **All Login Accounts**

### Admin Accounts
| Username | Password | Role | Name |
|----------|----------|------|------|
| `admin` | `admin123` | admin | Administrator |
| `kepala_sekolah` | `admin123` | admin | Kepala Sekolah |

### Teacher Accounts
| Username | Password | Role | Class | Name |
|----------|----------|------|-------|------|
| `siti_nurhaliza` | `teacher123` | teacher | Kelas 1A | Siti Nurhaliza |
| `ahmad_fauzi` | `teacher123` | teacher | Kelas 2A | Ahmad Fauzi |
| `rina_sari` | `teacher123` | teacher | Kelas 3A | Rina Sari |
| `budi_santoso` | `teacher123` | teacher | Kelas 4A | Budi Santoso |
| `dewi_lestari` | `teacher123` | teacher | Kelas 5A | Dewi Lestari |
| `hendra_wijaya` | `teacher123` | teacher | Kelas 6A | Hendra Wijaya |

---

## 🧪 **Testing Scenarios**

### Test 1: Admin Access
1. Login as `admin` / `admin123`
2. Should see all 6 classes
3. Can view all students and attendance

### Test 2: Teacher Access
1. Login as `siti_nurhaliza` / `teacher123`
2. Should see only Kelas 1A
3. Can manage attendance for 5 students

### Test 3: Real-time Updates
1. Open two browser windows
2. Login as different users
3. Make attendance changes
4. See live updates across windows

---

## 🔧 **Environment Variables**

Your `.env.local` is already configured with:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://sbmvkezhsoqyfgbbjpfz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 🚨 **Troubleshooting**

### Database Setup Failed?
- Check SQL syntax errors in Supabase logs
- Ensure you copied the complete SQL file
- Try running sections separately if needed

### Login Not Working?
- Verify users table has data
- Check username/password exactly as shown
- Clear browser cache and try again

### Real-time Not Working?
- Go to Database → Replication
- Enable replication for all tables
- Refresh the application

---

## 🎉 **You're Ready!**

Your Absen Digital system now has:
- ✅ **Professional PostgreSQL Database**
- ✅ **Real-time Collaboration**
- ✅ **Secure Multi-user Access**
- ✅ **Sample Data for Testing**
- ✅ **Production-ready Architecture**

**Start the app and begin managing attendance!** 🚀
