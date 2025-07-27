#!/usr/bin/env node

/**
 * Manual Supabase Setup Script
 * 
 * This script manually creates tables and data in Supabase
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const databaseUrl = process.argv[2] || process.env.DATABASE_URL;

if (!databaseUrl) {
  console.log('❌ Please provide DATABASE_URL');
  process.exit(1);
}

console.log('🔄 Manual Supabase Setup Starting...');

const prisma = new PrismaClient({
  datasources: {
    db: { url: databaseUrl }
  }
});

async function createTablesAndData() {
  try {
    console.log('🔍 Testing connection...');
    await prisma.$connect();
    console.log('✅ Connected to Supabase');

    // Create tables using raw SQL
    console.log('🏗️ Creating tables...');
    
    // Drop existing tables if they exist
    await prisma.$executeRaw`DROP TABLE IF EXISTS "attendance_records" CASCADE`;
    await prisma.$executeRaw`DROP TABLE IF EXISTS "students" CASCADE`;
    await prisma.$executeRaw`DROP TABLE IF EXISTS "classes" CASCADE`;
    await prisma.$executeRaw`DROP TABLE IF EXISTS "users" CASCADE`;
    
    // Create enum types
    await prisma.$executeRaw`CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'TEACHER')`;
    await prisma.$executeRaw`CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE')`;
    await prisma.$executeRaw`CREATE TYPE "AttendanceStatus" AS ENUM ('PRESENT', 'ABSENT', 'LATE', 'SICK', 'PERMISSION')`;

    // Create users table
    await prisma.$executeRaw`
      CREATE TABLE "users" (
        "id" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "nip" TEXT NOT NULL,
        "username" TEXT NOT NULL,
        "password" TEXT NOT NULL,
        "role" "UserRole" NOT NULL,
        "phone" TEXT,
        "email" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "classId" TEXT,
        "className" TEXT,
        "subject" TEXT,
        "position" TEXT,
        CONSTRAINT "users_pkey" PRIMARY KEY ("id")
      )
    `;

    // Create classes table
    await prisma.$executeRaw`
      CREATE TABLE "classes" (
        "id" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "grade" INTEGER NOT NULL,
        "section" TEXT NOT NULL,
        "teacherId" TEXT NOT NULL,
        "teacherName" TEXT NOT NULL,
        "studentCount" INTEGER NOT NULL DEFAULT 0,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "classes_pkey" PRIMARY KEY ("id")
      )
    `;

    // Create students table
    await prisma.$executeRaw`
      CREATE TABLE "students" (
        "id" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "classId" TEXT NOT NULL,
        "className" TEXT NOT NULL,
        "nisn" TEXT NOT NULL,
        "gender" "Gender" NOT NULL,
        "birthDate" TEXT NOT NULL,
        "address" TEXT,
        "parentName" TEXT,
        "parentPhone" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "students_pkey" PRIMARY KEY ("id")
      )
    `;

    // Create attendance_records table
    await prisma.$executeRaw`
      CREATE TABLE "attendance_records" (
        "id" TEXT NOT NULL,
        "studentId" TEXT NOT NULL,
        "studentName" TEXT NOT NULL,
        "classId" TEXT NOT NULL,
        "className" TEXT NOT NULL,
        "date" TEXT NOT NULL,
        "status" "AttendanceStatus" NOT NULL,
        "notes" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "attendance_records_pkey" PRIMARY KEY ("id")
      )
    `;

    // Add unique constraints
    await prisma.$executeRaw`ALTER TABLE "users" ADD CONSTRAINT "users_nip_key" UNIQUE ("nip")`;
    await prisma.$executeRaw`ALTER TABLE "users" ADD CONSTRAINT "users_username_key" UNIQUE ("username")`;
    await prisma.$executeRaw`ALTER TABLE "users" ADD CONSTRAINT "users_classId_key" UNIQUE ("classId")`;
    await prisma.$executeRaw`ALTER TABLE "classes" ADD CONSTRAINT "classes_name_key" UNIQUE ("name")`;
    await prisma.$executeRaw`ALTER TABLE "classes" ADD CONSTRAINT "classes_teacherId_key" UNIQUE ("teacherId")`;
    await prisma.$executeRaw`ALTER TABLE "students" ADD CONSTRAINT "students_nisn_key" UNIQUE ("nisn")`;

    console.log('✅ Tables created successfully');

    // Create admin user
    console.log('👤 Creating admin user...');
    const hashedPassword = await bcrypt.hash('admin123', 12);
    const adminId = 'admin-' + Date.now();
    
    await prisma.$executeRaw`
      INSERT INTO "users" ("id", "name", "nip", "username", "password", "role", "createdAt", "updatedAt")
      VALUES (${adminId}, 'Administrator', '123456789', 'admin', ${hashedPassword}, 'ADMIN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `;
    console.log('✅ Admin user created (admin/admin123)');

    // Create sample class
    console.log('🏫 Creating sample class...');
    const classId = 'class-' + Date.now();
    
    await prisma.$executeRaw`
      INSERT INTO "classes" ("id", "name", "grade", "section", "teacherId", "teacherName", "studentCount", "createdAt", "updatedAt")
      VALUES (${classId}, 'Kelas 1A', 1, 'A', ${adminId}, 'Administrator', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `;
    console.log('✅ Sample class created (Kelas 1A)');

    // Verify setup
    console.log('🔍 Verifying setup...');
    const userCount = await prisma.$queryRaw`SELECT COUNT(*) as count FROM "users"`;
    const classCount = await prisma.$queryRaw`SELECT COUNT(*) as count FROM "classes"`;
    
    console.log(`✅ Setup complete:`);
    console.log(`  👥 Users: ${userCount[0].count}`);
    console.log(`  🏫 Classes: ${classCount[0].count}`);
    
    console.log('\n🎉 Supabase database setup completed successfully!');
    console.log('Login credentials: admin / admin123');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

createTablesAndData();
