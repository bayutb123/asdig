#!/usr/bin/env node

/**
 * Check Database Script
 * 
 * This script checks what exists in the database
 */

const { PrismaClient } = require('@prisma/client');

const databaseUrl = process.argv[2] || process.env.DATABASE_URL;

if (!databaseUrl) {
  console.log('❌ Please provide DATABASE_URL');
  process.exit(1);
}

console.log('🔍 Checking database state...');

const prisma = new PrismaClient({
  datasources: {
    db: { url: databaseUrl }
  }
});

async function checkDatabase() {
  try {
    console.log('🔍 Testing connection...');
    await prisma.$connect();
    console.log('✅ Connected to Supabase');

    // Check what tables exist
    console.log('\n📋 Checking existing tables...');
    try {
      const tables = await prisma.$queryRaw`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        ORDER BY table_name
      `;
      console.log('✅ Tables found:', tables.length);
      tables.forEach(table => {
        console.log(`  - ${table.table_name}`);
      });
    } catch (error) {
      console.log('❌ Error checking tables:', error.message);
    }

    // Check what enum types exist
    console.log('\n📋 Checking existing enum types...');
    try {
      const enums = await prisma.$queryRaw`
        SELECT typname 
        FROM pg_type 
        WHERE typtype = 'e'
        ORDER BY typname
      `;
      console.log('✅ Enum types found:', enums.length);
      enums.forEach(enumType => {
        console.log(`  - ${enumType.typname}`);
      });
    } catch (error) {
      console.log('❌ Error checking enums:', error.message);
    }

    // Check database version
    console.log('\n📋 Checking PostgreSQL version...');
    try {
      const version = await prisma.$queryRaw`SELECT version()`;
      console.log('✅ PostgreSQL version:', version[0].version.split(' ')[0] + ' ' + version[0].version.split(' ')[1]);
    } catch (error) {
      console.log('❌ Error checking version:', error.message);
    }

  } catch (error) {
    console.error('❌ Check failed:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();
