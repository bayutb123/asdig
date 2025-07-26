#!/usr/bin/env node

/**
 * Clean Supabase Setup Script
 * 
 * This script creates the cleaned database schema and initial data
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const databaseUrl = process.argv[2] || process.env.DATABASE_URL;

if (!databaseUrl) {
  console.log('❌ Please provide DATABASE_URL');
  process.exit(1);
}

console.log('🔄 Setting up clean Supabase database...');

const prisma = new PrismaClient({
  datasources: {
    db: { url: databaseUrl }
  }
});

async function setupCleanDatabase() {
  try {
    console.log('🔍 Testing connection...');
    await prisma.$connect();
    console.log('✅ Connected to Supabase');

    // Drop existing tables and enums
    console.log('🧹 Cleaning existing database...');
    await prisma.$executeRaw`DROP TABLE IF EXISTS "attendance_records" CASCADE`;
    await prisma.$executeRaw`DROP TABLE IF EXISTS "students" CASCADE`;
    await prisma.$executeRaw`DROP TABLE IF EXISTS "classes" CASCADE`;
    await prisma.$executeRaw`DROP TABLE IF EXISTS "users" CASCADE`;
    
    // Drop existing enums
    await prisma.$executeRaw`DROP TYPE IF EXISTS "AttendanceStatus" CASCADE`;
    await prisma.$executeRaw`DROP TYPE IF EXISTS "Gender" CASCADE`;
    await prisma.$executeRaw`DROP TYPE IF EXISTS "UserRole" CASCADE`;
    await prisma.$executeRaw`DROP TYPE IF EXISTS "EnrollmentStatus" CASCADE`;
    
    console.log('✅ Database cleaned');

    // Create new enum types
    console.log('🏗️ Creating enum types...');
    await prisma.$executeRaw`CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'TEACHER')`;
    await prisma.$executeRaw`CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE')`;
    await prisma.$executeRaw`CREATE TYPE "AttendanceStatus" AS ENUM ('PRESENT', 'ABSENT', 'LATE', 'SICK', 'PERMISSION')`;
    console.log('✅ Enum types created');

    // Create users table
    console.log('👥 Creating users table...');
    await prisma.$executeRaw`
      CREATE TABLE "users" (
        "id" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "username" TEXT NOT NULL,
        "password" TEXT NOT NULL,
        "role" "UserRole" NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "classId" TEXT,
        CONSTRAINT "users_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "users_username_key" UNIQUE ("username"),
        CONSTRAINT "users_classId_key" UNIQUE ("classId")
      )
    `;
    console.log('✅ Users table created');

    // Create classes table
    console.log('🏫 Creating classes table...');
    await prisma.$executeRaw`
      CREATE TABLE "classes" (
        "id" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "studentCount" INTEGER NOT NULL DEFAULT 0,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "classes_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "classes_name_key" UNIQUE ("name")
      )
    `;
    console.log('✅ Classes table created');

    // Create students table
    console.log('👨‍🎓 Creating students table...');
    await prisma.$executeRaw`
      CREATE TABLE "students" (
        "id" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "classId" TEXT NOT NULL,
        "nisn" TEXT NOT NULL,
        "gender" "Gender" NOT NULL,
        "birthDate" TEXT NOT NULL,
        "address" TEXT,
        "parentName" TEXT,
        "parentPhone" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "students_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "students_nisn_key" UNIQUE ("nisn")
      )
    `;
    console.log('✅ Students table created');

    // Create attendance_records table
    console.log('📋 Creating attendance_records table...');
    await prisma.$executeRaw`
      CREATE TABLE "attendance_records" (
        "id" TEXT NOT NULL,
        "studentId" TEXT NOT NULL,
        "classId" TEXT NOT NULL,
        "date" TEXT NOT NULL,
        "status" "AttendanceStatus" NOT NULL,
        "notes" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "attendance_records_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "attendance_records_studentId_date_key" UNIQUE ("studentId", "date")
      )
    `;
    console.log('✅ Attendance records table created');

    // Add foreign key constraints
    console.log('🔗 Adding foreign key constraints...');
    await prisma.$executeRaw`ALTER TABLE "users" ADD CONSTRAINT "users_classId_fkey" FOREIGN KEY ("classId") REFERENCES "classes"("id") ON DELETE SET NULL ON UPDATE CASCADE`;
    await prisma.$executeRaw`ALTER TABLE "students" ADD CONSTRAINT "students_classId_fkey" FOREIGN KEY ("classId") REFERENCES "classes"("id") ON DELETE RESTRICT ON UPDATE CASCADE`;
    await prisma.$executeRaw`ALTER TABLE "attendance_records" ADD CONSTRAINT "attendance_records_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE`;
    await prisma.$executeRaw`ALTER TABLE "attendance_records" ADD CONSTRAINT "attendance_records_classId_fkey" FOREIGN KEY ("classId") REFERENCES "classes"("id") ON DELETE RESTRICT ON UPDATE CASCADE`;
    console.log('✅ Foreign key constraints added');

    // Create admin user
    console.log('👤 Creating admin user...');
    const hashedPassword = await bcrypt.hash('admin123', 12);
    const adminId = 'admin-' + Date.now();
    
    await prisma.$executeRaw`
      INSERT INTO "users" ("id", "name", "username", "password", "role", "createdAt", "updatedAt")
      VALUES (${adminId}, 'Administrator', 'admin', ${hashedPassword}, 'ADMIN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `;
    console.log('✅ Admin user created (admin/admin123)');

    // Create sample class
    console.log('🏫 Creating sample class...');
    const classId = 'class-' + Date.now();
    
    await prisma.$executeRaw`
      INSERT INTO "classes" ("id", "name", "studentCount", "createdAt", "updatedAt")
      VALUES (${classId}, 'Kelas 1A', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `;
    console.log('✅ Sample class created (Kelas 1A)');

    // Verify setup
    console.log('🔍 Verifying setup...');
    const userCount = await prisma.$queryRaw`SELECT COUNT(*) as count FROM "users"`;
    const classCount = await prisma.$queryRaw`SELECT COUNT(*) as count FROM "classes"`;
    
    console.log(`✅ Setup complete:`);
    console.log(`  👥 Users: ${userCount[0].count}`);
    console.log(`  🏫 Classes: ${classCount[0].count}`);
    
    console.log('\n🎉 Clean Supabase database setup completed successfully!');
    console.log('🔑 Login credentials: admin / admin123');
    console.log('📊 Database is ready for Vercel deployment');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    console.error('Full error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

setupCleanDatabase();
