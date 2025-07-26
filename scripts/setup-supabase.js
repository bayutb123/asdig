#!/usr/bin/env node

/**
 * Supabase Database Setup Script
 * 
 * This script helps set up Supabase database for Vercel deployment
 * 
 * Usage:
 *   node scripts/setup-supabase.js [supabase_url]
 *   
 * Examples:
 *   node scripts/setup-supabase.js
 *   node scripts/setup-supabase.js "postgresql://postgres:pass@db.ref.supabase.co:6543/postgres?pgbouncer=true"
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

function validateSupabaseUrl(url) {
  try {
    const urlObj = new URL(url);
    if (!urlObj.hostname.includes('supabase.co')) {
      return { valid: false, error: 'URL must be a Supabase database URL' };
    }
    if (urlObj.protocol !== 'postgresql:') {
      return { valid: false, error: 'URL must use postgresql:// protocol' };
    }
    return { valid: true };
  } catch (error) {
    return { valid: false, error: 'Invalid URL format' };
  }
}

async function setupSupabaseDatabase() {
  logBold('\n🟢 SUPABASE DATABASE SETUP', 'cyan');
  log('===============================', 'cyan');

  // Get database URL
  let databaseUrl = providedDatabaseUrl || process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    log('\n📋 Supabase Database Setup Instructions:', 'blue');
    log('1. Go to https://supabase.com/', 'white');
    log('2. Create a new project', 'white');
    log('3. Go to Settings → Database', 'white');
    log('4. Copy the connection string (URI format)', 'white');
    log('5. Use the connection pooling URL (port 6543) for better performance', 'white');
    
    log('\n💡 Example Supabase URL:', 'yellow');
    log('postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:6543/postgres?pgbouncer=true&connection_limit=1', 'cyan');
    
    databaseUrl = await getInput('\nEnter your Supabase DATABASE_URL: ');
    
    if (!databaseUrl) {
      log('\n❌ DATABASE_URL is required. Exiting.', 'red');
      process.exit(1);
    }
  }

  // Validate Supabase URL
  const validation = validateSupabaseUrl(databaseUrl);
  if (!validation.valid) {
    log(`\n❌ ${validation.error}`, 'red');
    log('Expected format: postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:6543/postgres', 'yellow');
    process.exit(1);
  }

  log(`\n📋 Supabase Configuration:`, 'blue');
  const urlParts = new URL(databaseUrl);
  const projectRef = urlParts.hostname.split('.')[1];
  log(`  Project: ${projectRef}`, 'white');
  log(`  Host: ${urlParts.hostname}`, 'white');
  log(`  Port: ${urlParts.port} ${urlParts.port === '6543' ? '(Connection Pooling ✅)' : '(Direct Connection)'}`, 'white');
  log(`  Database: ${urlParts.pathname.substring(1)}`, 'white');
  log(`  Connection Limit: ${urlParts.searchParams.get('connection_limit') || 'default'}`, 'white');

  // Initialize Prisma with Supabase
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl
      }
    }
  });

  try {
    // Test database connection
    log('\n🔍 Testing Supabase connection...', 'blue');
    await prisma.$connect();
    log('✅ Supabase connection successful!', 'green');

    // Check Supabase-specific features
    log('\n🔍 Checking Supabase database state...', 'blue');
    
    // Check if we can query system tables (Supabase-specific)
    try {
      const result = await prisma.$queryRaw`SELECT version()`;
      log('✅ PostgreSQL version check successful', 'green');
    } catch (error) {
      log('⚠️  Could not check PostgreSQL version (this is usually fine)', 'yellow');
    }

    // Check existing data
    const userCount = await prisma.user.count();
    const classCount = await prisma.class.count();
    const studentCount = await prisma.student.count();

    log(`Current database state:`, 'white');
    log(`  👥 Users: ${userCount}`, 'white');
    log(`  🏫 Classes: ${classCount}`, 'white');
    log(`  👨‍🎓 Students: ${studentCount}`, 'white');

    if (userCount === 0) {
      log('\n🚀 Setting up initial data for Supabase...', 'blue');
      
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

      log('\n🎉 Initial Supabase setup completed!', 'green');
    } else {
      log('\n✅ Supabase database already has data. Skipping initial setup.', 'green');
    }

    // Supabase-specific recommendations
    log('\n💡 Supabase Recommendations:', 'blue');
    log('  • Use connection pooling (port 6543) for better serverless performance', 'cyan');
    log('  • Consider enabling Row Level Security (RLS) for additional security', 'cyan');
    log('  • Use Supabase Dashboard for database management and monitoring', 'cyan');
    log('  • Set up database backups in Supabase Dashboard', 'cyan');

    // Final verification
    log('\n🔍 Final verification...', 'blue');
    const finalUserCount = await prisma.user.count();
    const finalClassCount = await prisma.class.count();
    
    log(`Final Supabase database state:`, 'white');
    log(`  👥 Users: ${finalUserCount}`, 'white');
    log(`  🏫 Classes: ${finalClassCount}`, 'white');

    logBold('\n✅ SUPABASE SETUP COMPLETE!', 'green');
    log('===============================', 'green');
    log('Your Supabase database is ready for Vercel deployment.', 'green');
    
    log('\nNext steps:', 'white');
    log('1. Set DATABASE_URL in Vercel environment variables:', 'cyan');
    log(`   ${databaseUrl}`, 'white');
    log('2. Set JWT_SECRET in Vercel environment variables', 'cyan');
    log('3. Deploy your application to Vercel', 'cyan');
    log('4. Test login with: admin / admin123', 'cyan');
    
    log('\nSupabase Dashboard:', 'white');
    log(`   https://supabase.com/dashboard/project/${projectRef}`, 'cyan');

  } catch (error) {
    log('\n💥 Supabase setup failed:', 'red');
    console.error(error);
    
    if (error.code === 'P1001') {
      log('\n💡 Connection failed. Check:', 'yellow');
      log('  • Supabase project is active', 'yellow');
      log('  • Database password is correct', 'yellow');
      log('  • Network connectivity', 'yellow');
      log('  • Connection string format', 'yellow');
    } else if (error.code === 'P1003') {
      log('\n💡 Database access denied. Check:', 'yellow');
      log('  • Database password in connection string', 'yellow');
      log('  • Project is not paused', 'yellow');
    } else if (error.message.includes('timeout')) {
      log('\n💡 Connection timeout. Try:', 'yellow');
      log('  • Using connection pooling URL (port 6543)', 'yellow');
      log('  • Adding connection_limit=1 parameter', 'yellow');
    }
    
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  try {
    await setupSupabaseDatabase();
  } catch (error) {
    log('\n💥 Script failed:', 'red');
    console.error(error);
    process.exit(1);
  }
}

// Show help if requested
if (args.includes('--help') || args.includes('-h')) {
  logBold('\n🟢 SUPABASE DATABASE SETUP', 'cyan');
  log('===============================', 'cyan');
  log('\nUsage:', 'white');
  log('  node scripts/setup-supabase.js [database_url]', 'white');
  log('\nExamples:', 'white');
  log('  node scripts/setup-supabase.js', 'cyan');
  log('  node scripts/setup-supabase.js "postgresql://postgres:pass@db.ref.supabase.co:6543/postgres"', 'cyan');
  log('\nWhat this script does:', 'white');
  log('  • Validates Supabase connection string', 'white');
  log('  • Tests database connection', 'white');
  log('  • Creates admin user (admin/admin123)', 'white');
  log('  • Creates sample class', 'white');
  log('  • Provides Supabase-specific recommendations', 'white');
  log('\nSupabase features:', 'white');
  log('  • PostgreSQL database', 'white');
  log('  • Connection pooling support', 'white');
  log('  • Built-in dashboard', 'white');
  log('  • Real-time capabilities', 'white');
  process.exit(0);
}

// Run the script
main();
