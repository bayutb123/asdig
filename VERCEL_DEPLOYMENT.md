# Vercel Deployment Guide

## Required Environment Variables

To fix the 500 Internal Server Error on login, you need to set these environment variables in your Vercel dashboard:

### 1. Database Configuration
```
DATABASE_URL=your_production_database_url
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

### Option 1: PlanetScale (Recommended)
1. Create account at [PlanetScale](https://planetscale.com/)
2. Create a new database
3. Get connection string from dashboard
4. Set as `DATABASE_URL` in Vercel

### Option 2: Railway
1. Create account at [Railway](https://railway.app/)
2. Create MySQL database
3. Get connection string
4. Set as `DATABASE_URL` in Vercel

### Option 3: Supabase
1. Create account at [Supabase](https://supabase.com/)
2. Create new project
3. Get PostgreSQL connection string
4. Set as `DATABASE_URL` in Vercel

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

### 2. Database Migration
Run Prisma migrations on your production database:

```bash
# Generate Prisma client
npx prisma generate

# Push database schema
npx prisma db push

# (Optional) Seed database
npx prisma db seed
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
