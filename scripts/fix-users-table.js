#!/usr/bin/env node

/**
 * Fix Users Table Script
 * 
 * This script adds the missing 'position' column to the users table
 */

const { PrismaClient } = require('@prisma/client');

const databaseUrl = process.argv[2] || process.env.DATABASE_URL;

if (!databaseUrl) {
  console.log('❌ Please provide DATABASE_URL');
  process.exit(1);
}

console.log('🔧 Fixing users table...');

const prisma = new PrismaClient({
  datasources: {
    db: { url: databaseUrl }
  }
});

async function fixUsersTable() {
  try {
    console.log('🔍 Testing connection...');
    await prisma.$connect();
    console.log('✅ Connected to Supabase');

    // Check if position column exists
    console.log('🔍 Checking if position column exists...');
    try {
      const columns = await prisma.$queryRaw`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'position'
      `;
      
      if (columns.length > 0) {
        console.log('✅ Position column already exists');
      } else {
        console.log('➕ Adding position column...');
        await prisma.$executeRaw`ALTER TABLE "users" ADD COLUMN "position" TEXT`;
        console.log('✅ Position column added successfully');
      }
    } catch (error) {
      console.log('❌ Error checking/adding position column:', error.message);
    }

    // Test the user lookup now
    console.log('🔍 Testing user lookup...');
    try {
      const user = await prisma.user.findUnique({
        where: { username: 'admin' },
        include: {
          class: true,
        },
      });
      
      if (user) {
        console.log('✅ User lookup successful!');
        console.log(`  - Username: ${user.username}`);
        console.log(`  - Role: ${user.role}`);
        console.log(`  - ID: ${user.id}`);
      } else {
        console.log('❌ Admin user not found');
      }
    } catch (error) {
      console.log('❌ User lookup still failing:', error.message);
    }

    console.log('🎉 Users table fix completed!');

  } catch (error) {
    console.error('❌ Fix failed:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

fixUsersTable();
