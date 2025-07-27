# Vercel Deployment Guide

## Required Environment Variables

To fix the 500 Internal Server Error on login, you need to set these environment variables in your Vercel dashboard:

### 1. Database Configuration (Supabase)
```
# Supabase PostgreSQL connection string
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:6543/postgres?pgbouncer=true&connection_limit=1

# Optional: Supabase additional configs
NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT-REF].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 2. Authentication Configuration
```
JWT_SECRET=your-super-secret-jwt-key-at-least-32-characters-long
JWT_EXPIRES_IN=7d
```

### 3. Next.js Configuration
```
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

## Setting Environment Variables in Vercel

### Method 1: Vercel Dashboard
1. Go to your project in [Vercel Dashboard](https://vercel.com/dashboard)
2. Click on your project
3. Go to **Settings** tab
4. Click **Environment Variables** in the sidebar
5. Add each variable:
   - **Name**: Variable name (e.g., `JWT_SECRET`)
   - **Value**: Variable value
   - **Environment**: Select `Production`, `Preview`, and `Development`
6. Click **Save**

### Method 2: Vercel CLI
```bash
# Set environment variables using Vercel CLI
vercel env add JWT_SECRET
vercel env add DATABASE_URL
vercel env add NODE_ENV
```

## Database Setup for Production

⚠️ **IMPORTANT**: Do NOT use SQLite (dev.db) for Vercel deployment!

### Why Not SQLite on Vercel?
- **Read-only filesystem**: Vercel functions can't write to SQLite files
- **Serverless limitations**: Multiple function instances can't share SQLite
- **Performance issues**: File-based databases don't work well in serverless
- **Data persistence**: Files are ephemeral in serverless environments

### Recommended Production Databases:

### Option 1: PlanetScale (Recommended - MySQL)
```bash
# 1. Create account at https://planetscale.com/
# 2. Create a new database
# 3. Get connection string from dashboard
# 4. Set as DATABASE_URL in Vercel

# Example connection string:
DATABASE_URL="mysql://username:password@host.planetscale.com/database?sslaccept=strict"
```

### Option 2: Railway (MySQL/PostgreSQL)
```bash
# 1. Create account at https://railway.app/
# 2. Create MySQL or PostgreSQL database
# 3. Get connection string from dashboard
# 4. Set as DATABASE_URL in Vercel

# Example connection string:
DATABASE_URL="mysql://root:password@containers-us-west-1.railway.app:6543/railway"
```

### Option 3: Supabase (PostgreSQL) - Recommended for Full-Stack Apps
```bash
# 1. Create account at https://supabase.com/
# 2. Create new project
# 3. Get PostgreSQL connection string from Settings > Database
# 4. Set as DATABASE_URL in Vercel

# Example connection string:
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"

# Alternative with connection pooling (recommended for serverless):
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:6543/postgres?pgbouncer=true&connection_limit=1"
```

#### Supabase Setup Steps:
1. **Create Project**: Go to [supabase.com](https://supabase.com) → New Project
2. **Get Database URL**: Settings → Database → Connection string → URI
3. **Copy Password**: Use the password you set during project creation
4. **Enable Connection Pooling**: Use port 6543 for better serverless performance
5. **Set in Vercel**: Add DATABASE_URL to environment variables

#### Supabase Benefits:
- ✅ **Built-in Auth**: Optional authentication system
- ✅ **Real-time**: WebSocket support for live updates
- ✅ **Storage**: File upload and management
- ✅ **Edge Functions**: Serverless functions
- ✅ **Dashboard**: Built-in database management UI

### Option 4: Vercel Postgres (Native Integration)
```bash
# 1. Go to Vercel Dashboard → Storage
# 2. Create Postgres database
# 3. Connection string automatically added to environment variables
# 4. No manual configuration needed

# Automatically sets:
POSTGRES_URL="postgres://..."
POSTGRES_PRISMA_URL="postgres://..."
POSTGRES_URL_NON_POOLING="postgres://..."
```

## JWT Secret Generation

Generate a secure JWT secret:

```bash
# Method 1: Using Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Method 2: Using OpenSSL
openssl rand -hex 64

# Method 3: Online generator
# Visit: https://generate-secret.vercel.app/64
```

## Deployment Steps

### 1. Set Environment Variables
Set all required environment variables in Vercel dashboard.

### 2. Database Migration & Setup

#### For New Database (First Time Setup):
```bash
# 1. Set your production DATABASE_URL locally for migration
export DATABASE_URL="your_production_database_url"

# 2. Generate Prisma client
npx prisma generate

# 3. Push database schema to production database
npx prisma db push

# 4. (Optional) Seed database with initial data
npx prisma db seed
```

#### For Existing Database (Schema Updates):
```bash
# 1. Create migration files
npx prisma migrate dev --name your_migration_name

# 2. Deploy migrations to production
npx prisma migrate deploy
```

#### Vercel Build Configuration:
Add to your `package.json` for automatic Prisma generation:
```json
{
  "scripts": {
    "build": "prisma generate && next build",
    "postinstall": "prisma generate"
  }
}
```

#### Database Seeding for Production:
Create `prisma/seed.ts` for initial data:
```typescript
import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../src/lib/auth'

const prisma = new PrismaClient()

async function main() {
  // Create admin user
  const hashedPassword = await hashPassword('admin123')

  await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: hashedPassword,
      role: 'ADMIN',
      name: 'Administrator'
    }
  })

  // Create sample class
  await prisma.class.upsert({
    where: { name: 'Kelas 1A' },
    update: {},
    create: {
      name: 'Kelas 1A',
      studentCount: 0
    }
  })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
```

### 3. Deploy
```bash
# Deploy to Vercel
vercel --prod
```

## Troubleshooting Login Issues

### Common Error: 500 Internal Server Error

#### Check 1: Environment Variables
Verify all required environment variables are set:
- `DATABASE_URL`
- `JWT_SECRET`
- `NODE_ENV`

#### Check 2: Database Connection
Test database connection:
```bash
npx prisma db pull
```

#### Check 3: Prisma Client
Ensure Prisma client is generated:
```bash
npx prisma generate
```

#### Check 4: Database Schema
Verify database has required tables:
```bash
npx prisma studio
```

### Error Messages and Solutions

#### "JWT_SECRET environment variable is not set"
**Solution**: Set `JWT_SECRET` in Vercel environment variables

#### "Database configuration error"
**Solution**: Set `DATABASE_URL` in Vercel environment variables

#### "bcrypt is only available on the server side"
**Solution**: This is normal - bcrypt only works server-side

#### "Prisma Client initialization error"
**Solution**: Run `npx prisma generate` and redeploy

## Environment Variables Template

Copy this template to your Vercel environment variables:

```env
# Database
DATABASE_URL=mysql://username:password@host:port/database

# Authentication
JWT_SECRET=your-64-character-hex-string-here
JWT_EXPIRES_IN=7d

# Application
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
NEXT_PUBLIC_APP_NAME=Absen Digital

# Optional: Feature flags
NEXT_PUBLIC_ENABLE_DARK_MODE=true
NEXT_PUBLIC_ENABLE_PRINT_FEATURE=true
NEXT_PUBLIC_ENABLE_EXPORT_FEATURE=true
```

## Database Schema Requirements

Ensure your production database has these tables:
- `users` (for authentication)
- `classes` (for class management)
- `students` (for student data)
- `attendance_records` (for attendance tracking)

## Security Checklist

- [ ] JWT_SECRET is at least 32 characters long
- [ ] JWT_SECRET is different from default value
- [ ] DATABASE_URL uses secure connection (SSL)
- [ ] Environment variables are set for Production environment
- [ ] Database has proper access controls
- [ ] No sensitive data in client-side code

## Testing Deployment

### 1. Test Login
Try logging in with existing credentials:
- Username: `admin`
- Password: `admin123`

### 2. Check API Endpoints
Test these endpoints:
- `GET /api/classes`
- `GET /api/students`
- `POST /api/auth/login`

### 3. Monitor Logs
Check Vercel function logs for errors:
1. Go to Vercel Dashboard
2. Click on your project
3. Go to **Functions** tab
4. Check logs for errors

## Support

If you continue to experience issues:

1. **Check Vercel Logs**: Look for specific error messages
2. **Verify Environment Variables**: Ensure all required variables are set
3. **Test Database Connection**: Verify database is accessible
4. **Check Prisma Schema**: Ensure schema matches database

## Quick Fix Commands

```bash
# Regenerate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Redeploy to Vercel
vercel --prod

# Check environment variables
vercel env ls
```
