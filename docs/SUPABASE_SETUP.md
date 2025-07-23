# Supabase Database Setup Guide

This guide will help you set up Supabase for the Absen Digital attendance management system.

## Prerequisites

- Supabase account (free tier available)
- Node.js and npm installed
- Basic understanding of PostgreSQL

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in to your account
3. Click "New Project"
4. Fill in project details:
   - **Name**: `absen-digital`
   - **Database Password**: Choose a strong password
   - **Region**: Select closest to your users
5. Click "Create new project"
6. Wait for project initialization (2-3 minutes)

## Step 2: Get Project Credentials

1. Go to **Settings** → **API**
2. Copy the following values:
   - **Project URL**: `https://your-project-id.supabase.co`
   - **Anon (public) key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - **Service role key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (keep this secret!)

## Step 3: Configure Environment Variables

1. Create `.env.local` file in your project root:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Other existing variables...
NEXT_PUBLIC_ANALYTICS_ENABLED=true
NEXT_PUBLIC_APP_URL=https://asdig.vercel.app
```

## Step 4: Run Database Migrations

### Option A: Using Supabase Dashboard (Recommended)

1. Go to **SQL Editor** in your Supabase dashboard
2. Copy and paste the content from each migration file:

#### Migration 1: Initial Schema
```sql
-- Copy content from supabase/migrations/001_initial_schema.sql
-- This creates tables: users, classes, students, attendance_records, attendance_sessions
```

#### Migration 2: RLS Policies
```sql
-- Copy content from supabase/migrations/002_rls_policies.sql
-- This sets up Row Level Security for data protection
```

#### Migration 3: Seed Data
```sql
-- Copy content from supabase/migrations/003_seed_data.sql
-- This adds sample users, classes, and students
```

3. Run each migration by clicking "Run" button

### Option B: Using Supabase CLI

```bash
# Install Supabase CLI
npm install -g @supabase/cli

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-id

# Run migrations
supabase db push
```

## Step 5: Verify Database Setup

1. Go to **Table Editor** in Supabase dashboard
2. You should see these tables:
   - `users` (6 sample users)
   - `classes` (6 sample classes)
   - `students` (sample students)
   - `attendance_records` (sample attendance data)
   - `attendance_sessions`

3. Go to **Authentication** → **Users**
4. You should see the sample users created

## Step 6: Test Database Connection

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

3. Try logging in with sample credentials:
   - **Admin**: username: `admin`, password: `admin123`
   - **Teacher**: username: `siti_nurhaliza`, password: `teacher123`

## Step 7: Configure Row Level Security (RLS)

RLS is automatically configured by the migration scripts. It ensures:

- **Admins** can access all data
- **Teachers** can only access their own classes and students
- **Data isolation** between different user roles
- **Secure API access** without exposing sensitive data

## Step 8: Enable Real-time Features

1. Go to **Database** → **Replication**
2. Enable replication for these tables:
   - `attendance_records`
   - `students`
   - `classes`

This enables real-time updates when attendance data changes.

## Default User Accounts

### Admin Accounts
- **Username**: `admin` | **Password**: `admin123`
- **Username**: `kepala_sekolah` | **Password**: `admin123`

### Teacher Accounts
- **Username**: `siti_nurhaliza` | **Password**: `teacher123`
- **Username**: `ahmad_fauzi` | **Password**: `teacher123`
- **Username**: `rina_sari` | **Password**: `teacher123`
- **Username**: `budi_santoso` | **Password**: `teacher123`
- **Username**: `dewi_lestari` | **Password**: `teacher123`
- **Username**: `hendra_wijaya` | **Password**: `teacher123`

## Database Schema Overview

### Users Table
- Stores teachers and administrators
- Includes authentication credentials
- Role-based access control

### Classes Table
- School classes (1A, 2A, 3A, etc.)
- Assigned to specific teachers
- Academic year tracking

### Students Table
- Student information and NISN
- Linked to specific classes
- Parent contact information

### Attendance Records Table
- Daily attendance tracking
- Status: Hadir, Terlambat, Tidak Hadir, Izin
- Time tracking and notes

### Views
- `student_class_view`: Students with class information
- `attendance_summary_view`: Attendance with student/class details

## Security Features

- **Row Level Security (RLS)**: Data access based on user roles
- **API Key Protection**: Separate keys for client and server access
- **Password Hashing**: Secure password storage (implement bcrypt in production)
- **Audit Trail**: Created/updated timestamps on all records

## Production Considerations

1. **Change Default Passwords**: Update all sample user passwords
2. **Implement Password Hashing**: Use bcrypt for secure password storage
3. **Backup Strategy**: Set up automated database backups
4. **Monitoring**: Enable database monitoring and alerts
5. **SSL/TLS**: Ensure all connections use HTTPS
6. **Rate Limiting**: Configure API rate limits

## Troubleshooting

### Connection Issues
- Verify environment variables are correct
- Check Supabase project status
- Ensure API keys are not expired

### Migration Errors
- Check SQL syntax in migration files
- Verify table dependencies
- Review Supabase logs in dashboard

### Authentication Problems
- Verify RLS policies are applied
- Check user credentials in database
- Review authentication flow in code

## Support

- **Supabase Documentation**: [docs.supabase.com](https://docs.supabase.com)
- **Community Support**: [github.com/supabase/supabase](https://github.com/supabase/supabase)
- **Discord**: [discord.supabase.com](https://discord.supabase.com)

## Next Steps

After successful setup:
1. Customize the database schema for your specific needs
2. Add more sample data or import existing data
3. Configure additional security policies
4. Set up automated backups
5. Deploy to production with proper environment variables
