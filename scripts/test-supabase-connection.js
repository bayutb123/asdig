#!/usr/bin/env node

/**
 * Quick Supabase Connection Test
 * 
 * Usage: node scripts/test-supabase-connection.js "your_database_url"
 */

const { PrismaClient } = require('@prisma/client');

const databaseUrl = process.argv[2] || process.env.DATABASE_URL;

if (!databaseUrl) {
  console.log('❌ Please provide DATABASE_URL as argument or environment variable');
  console.log('Usage: node scripts/test-supabase-connection.js "postgresql://..."');
  process.exit(1);
}

console.log('🔍 Testing Supabase connection...');
console.log('URL:', databaseUrl.replace(/:([^:@]+)@/, ':****@')); // Hide password

const prisma = new PrismaClient({
  datasources: {
    db: { url: databaseUrl }
  }
});

async function testConnection() {
  try {
    await prisma.$connect();
    console.log('✅ Supabase connection successful!');
    
    // Test a simple query
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Database query successful!');
    
    await prisma.$disconnect();
    console.log('✅ Connection test completed successfully!');
  } catch (error) {
    console.log('❌ Connection failed:', error.message);
    
    if (error.message.includes('password authentication failed')) {
      console.log('💡 Check your database password in the connection string');
    } else if (error.message.includes('timeout')) {
      console.log('💡 Try using connection pooling: port 6543 with ?pgbouncer=true');
    } else if (error.message.includes('ENOTFOUND')) {
      console.log('💡 Check your project reference in the hostname');
    }
    
    process.exit(1);
  }
}

testConnection();
