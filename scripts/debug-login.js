#!/usr/bin/env node

/**
 * Debug Login Script
 * 
 * This script debugs the login process step by step
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const databaseUrl = process.argv[2] || process.env.DATABASE_URL;

if (!databaseUrl) {
  console.log('❌ Please provide DATABASE_URL');
  process.exit(1);
}

console.log('🔍 Debug Login Process...');

const prisma = new PrismaClient({
  datasources: {
    db: { url: databaseUrl }
  }
});

async function debugLogin() {
  try {
    console.log('🔍 Testing connection...');
    await prisma.$connect();
    console.log('✅ Connected to Supabase');

    // Check if users table exists
    console.log('\n📋 Checking database tables...');
    try {
      const tables = await prisma.$queryRaw`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        ORDER BY table_name
      `;
      console.log('✅ Tables found:', tables.map(t => t.table_name));
    } catch (error) {
      console.log('❌ Error checking tables:', error.message);
    }

    // Check users table structure
    console.log('\n📋 Checking users table structure...');
    try {
      const columns = await prisma.$queryRaw`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_name = 'users' AND table_schema = 'public'
        ORDER BY ordinal_position
      `;
      console.log('✅ Users table columns:');
      columns.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
      });
    } catch (error) {
      console.log('❌ Error checking users table:', error.message);
    }

    // Check all users in database
    console.log('\n👥 Checking users in database...');
    try {
      const users = await prisma.$queryRaw`SELECT id, username, name, role FROM users`;
      console.log('✅ Users found:', users.length);
      users.forEach(user => {
        console.log(`  - ID: ${user.id}, Username: ${user.username}, Name: ${user.name}, Role: ${user.role}`);
      });
    } catch (error) {
      console.log('❌ Error querying users:', error.message);
    }

    // Test specific user lookup (like in login)
    console.log('\n🔍 Testing user lookup for "admin"...');
    try {
      const user = await prisma.user.findUnique({
        where: { username: 'admin' },
        include: {
          class: true,
        },
      });
      
      if (user) {
        console.log('✅ Admin user found:');
        console.log(`  - ID: ${user.id}`);
        console.log(`  - Username: ${user.username}`);
        console.log(`  - Name: ${user.name}`);
        console.log(`  - Role: ${user.role}`);
        console.log(`  - Password hash: ${user.password.substring(0, 20)}...`);
        console.log(`  - Class: ${user.class ? user.class.name : 'None'}`);
        
        // Test password verification
        console.log('\n🔐 Testing password verification...');
        const isValid = await bcrypt.compare('admin123', user.password);
        console.log(`✅ Password "admin123" is valid: ${isValid}`);
        
      } else {
        console.log('❌ Admin user not found');
      }
    } catch (error) {
      console.log('❌ Error in user lookup:', error.message);
      console.log('Full error:', error);
    }

    // Test raw SQL user lookup
    console.log('\n🔍 Testing raw SQL user lookup...');
    try {
      const rawUser = await prisma.$queryRaw`
        SELECT id, username, name, role, password 
        FROM users 
        WHERE username = 'admin'
      `;
      console.log('✅ Raw SQL user lookup:', rawUser.length > 0 ? 'Found' : 'Not found');
      if (rawUser.length > 0) {
        console.log(`  - Username: ${rawUser[0].username}`);
        console.log(`  - Role: ${rawUser[0].role}`);
      }
    } catch (error) {
      console.log('❌ Error in raw SQL lookup:', error.message);
    }

  } catch (error) {
    console.error('❌ Debug failed:', error.message);
    console.error('Full error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugLogin();
