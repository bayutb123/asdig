#!/usr/bin/env node

/**
 * Production Database Setup Script
 * 
 * This script helps set up the production database for Vercel deployment
 * 
 * Usage:
 *   node scripts/setup-production-db.js [database_url]
 *   
 * Examples:
 *   node scripts/setup-production-db.js
 *   node scripts/setup-production-db.js "mysql://user:pass@host:port/db"
 */

const { PrismaClient } = require('@prisma/client');
const readline = require('readline');

// Parse command line arguments
const args = process.argv.slice(2);
const providedDatabaseUrl = args[0];

// Colors for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'white') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logBold(message, color = 'white') {
  console.log(`${colors.bold}${colors[color]}${message}${colors.reset}`);
}

async function getInput(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(`${colors.yellow}${question}${colors.reset}`, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

async function setupProductionDatabase() {
  logBold('\n🗄️  PRODUCTION DATABASE SETUP', 'cyan');
  log('=====================================', 'cyan');

  // Get database URL
  let databaseUrl = providedDatabaseUrl || process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    log('\n⚠️  No DATABASE_URL found in environment variables.', 'yellow');
    log('Please provide your production database URL:', 'white');
    log('Examples:', 'white');
    log('  MySQL: mysql://user:pass@host:port/database', 'cyan');
    log('  PostgreSQL: postgresql://user:pass@host:port/database', 'cyan');
    
    databaseUrl = await getInput('\nEnter DATABASE_URL: ');
    
    if (!databaseUrl) {
      log('\n❌ DATABASE_URL is required. Exiting.', 'red');
      process.exit(1);
    }
  }

  // Validate database URL format
  try {
    new URL(databaseUrl);
  } catch (error) {
    log('\n❌ Invalid DATABASE_URL format.', 'red');
    log('Expected format: protocol://user:pass@host:port/database', 'yellow');
    process.exit(1);
  }

  log(`\n📋 Database Configuration:`, 'blue');
  const urlParts = new URL(databaseUrl);
  log(`  Protocol: ${urlParts.protocol}`, 'white');
  log(`  Host: ${urlParts.hostname}:${urlParts.port || 'default'}`, 'white');
  log(`  Database: ${urlParts.pathname.substring(1)}`, 'white');
  log(`  User: ${urlParts.username}`, 'white');

  // Initialize Prisma with production database
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl
      }
    }
  });

  try {
    // Test database connection
    log('\n🔍 Testing database connection...', 'blue');
    await prisma.$connect();
    log('✅ Database connection successful!', 'green');

    // Check if database is empty
    log('\n📊 Checking database state...', 'blue');
    const userCount = await prisma.user.count();
    const classCount = await prisma.class.count();
    const studentCount = await prisma.student.count();

    log(`Current database state:`, 'white');
    log(`  👥 Users: ${userCount}`, 'white');
    log(`  🏫 Classes: ${classCount}`, 'white');
    log(`  👨‍🎓 Students: ${studentCount}`, 'white');

    if (userCount === 0) {
      log('\n🚀 Setting up initial data...', 'blue');
      
      // Create admin user
      log('Creating admin user...', 'blue');
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('admin123', 12);
      
      await prisma.user.create({
        data: {
          username: 'admin',
          password: hashedPassword,
          role: 'ADMIN',
          name: 'Administrator'
        }
      });
      log('✅ Admin user created (username: admin, password: admin123)', 'green');

      // Create sample class
      log('Creating sample class...', 'blue');
      await prisma.class.create({
        data: {
          name: 'Kelas 1A',
          studentCount: 0
        }
      });
      log('✅ Sample class created (Kelas 1A)', 'green');

      log('\n🎉 Initial setup completed!', 'green');
    } else {
      log('\n✅ Database already has data. Skipping initial setup.', 'green');
    }

    // Final verification
    log('\n🔍 Final verification...', 'blue');
    const finalUserCount = await prisma.user.count();
    const finalClassCount = await prisma.class.count();
    
    log(`Final database state:`, 'white');
    log(`  👥 Users: ${finalUserCount}`, 'white');
    log(`  🏫 Classes: ${finalClassCount}`, 'white');

    logBold('\n✅ PRODUCTION DATABASE SETUP COMPLETE!', 'green');
    log('=====================================', 'green');
    log('Your database is ready for Vercel deployment.', 'green');
    log('\nNext steps:', 'white');
    log('1. Set DATABASE_URL in Vercel environment variables', 'cyan');
    log('2. Deploy your application to Vercel', 'cyan');
    log('3. Test login with: admin / admin123', 'cyan');

  } catch (error) {
    log('\n💥 Database setup failed:', 'red');
    console.error(error);
    
    if (error.code === 'P1001') {
      log('\n💡 Connection failed. Check:', 'yellow');
      log('  • Database server is running', 'yellow');
      log('  • Connection string is correct', 'yellow');
      log('  • Network connectivity', 'yellow');
      log('  • Firewall settings', 'yellow');
    } else if (error.code === 'P1003') {
      log('\n💡 Database does not exist. Check:', 'yellow');
      log('  • Database name in connection string', 'yellow');
      log('  • Database has been created', 'yellow');
    } else if (error.code === 'P1000') {
      log('\n💡 Authentication failed. Check:', 'yellow');
      log('  • Username and password', 'yellow');
      log('  • User permissions', 'yellow');
    }
    
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  try {
    await setupProductionDatabase();
  } catch (error) {
    log('\n💥 Script failed:', 'red');
    console.error(error);
    process.exit(1);
  }
}

// Show help if requested
if (args.includes('--help') || args.includes('-h')) {
  logBold('\n🗄️  PRODUCTION DATABASE SETUP', 'cyan');
  log('=====================================', 'cyan');
  log('\nUsage:', 'white');
  log('  node scripts/setup-production-db.js [database_url]', 'white');
  log('\nExamples:', 'white');
  log('  node scripts/setup-production-db.js', 'cyan');
  log('  node scripts/setup-production-db.js "mysql://user:pass@host:port/db"', 'cyan');
  log('\nWhat this script does:', 'white');
  log('  • Tests database connection', 'white');
  log('  • Creates admin user (admin/admin123)', 'white');
  log('  • Creates sample class', 'white');
  log('  • Verifies setup completion', 'white');
  log('\nSupported databases:', 'white');
  log('  • MySQL (PlanetScale, Railway)', 'white');
  log('  • PostgreSQL (Supabase, Railway, Vercel)', 'white');
  process.exit(0);
}

// Run the script
main();
