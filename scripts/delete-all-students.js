#!/usr/bin/env node

/**
 * Script to delete all students from the database
 * 
 * This script will:
 * 1. Delete all attendance records (to avoid foreign key constraints)
 * 2. Delete all students
 * 3. Reset all class student counts to 0
 * 
 * Usage:
 *   node scripts/delete-all-students.js
 *   
 * Options:
 *   --confirm    Skip confirmation prompt
 *   --dry-run    Show what would be deleted without actually deleting
 */

const { PrismaClient } = require('@prisma/client');
const readline = require('readline');

const prisma = new PrismaClient();

// Parse command line arguments
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const skipConfirmation = args.includes('--confirm');

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

async function getConfirmation(message) {
  if (skipConfirmation) return true;
  
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(`${colors.yellow}${message} (y/N): ${colors.reset}`, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
    });
  });
}

async function getStatistics() {
  try {
    const [studentCount, attendanceCount, classCount] = await Promise.all([
      prisma.student.count(),
      prisma.attendanceRecord.count(),
      prisma.class.count()
    ]);

    return { studentCount, attendanceCount, classCount };
  } catch (error) {
    log(`Error getting statistics: ${error.message}`, 'red');
    throw error;
  }
}

async function deleteAllStudents() {
  try {
    logBold('\n🗑️  DELETE ALL STUDENTS SCRIPT', 'cyan');
    log('=====================================', 'cyan');

    // Get initial statistics
    log('\n📊 Getting current database statistics...', 'blue');
    const initialStats = await getStatistics();
    
    log(`\nCurrent database state:`, 'white');
    log(`  👥 Students: ${initialStats.studentCount}`, 'white');
    log(`  📋 Attendance Records: ${initialStats.attendanceCount}`, 'white');
    log(`  🏫 Classes: ${initialStats.classCount}`, 'white');

    if (initialStats.studentCount === 0) {
      log('\n✅ No students found in database. Nothing to delete.', 'green');
      return;
    }

    // Show what will be deleted
    log('\n⚠️  This script will:', 'yellow');
    log(`  • Delete ALL ${initialStats.studentCount} students`, 'yellow');
    log(`  • Delete ALL ${initialStats.attendanceCount} attendance records`, 'yellow');
    log(`  • Reset student counts in all ${initialStats.classCount} classes to 0`, 'yellow');

    if (isDryRun) {
      log('\n🔍 DRY RUN MODE - No actual deletions will be performed', 'magenta');
    } else {
      log('\n💀 THIS ACTION CANNOT BE UNDONE!', 'red');
    }

    // Get confirmation
    if (!isDryRun) {
      const confirmed = await getConfirmation('\nAre you sure you want to delete ALL students?');
      if (!confirmed) {
        log('\n❌ Operation cancelled by user.', 'yellow');
        return;
      }
    }

    if (isDryRun) {
      log('\n🔍 DRY RUN - Operations that would be performed:', 'magenta');
      log(`  1. Delete ${initialStats.attendanceCount} attendance records`, 'magenta');
      log(`  2. Delete ${initialStats.studentCount} students`, 'magenta');
      log(`  3. Reset student counts in ${initialStats.classCount} classes`, 'magenta');
      log('\n✅ Dry run completed. No actual changes made.', 'green');
      return;
    }

    // Start deletion process
    log('\n🚀 Starting deletion process...', 'blue');

    // Step 1: Delete all attendance records
    log('\n1️⃣  Deleting all attendance records...', 'blue');
    const deletedAttendance = await prisma.attendanceRecord.deleteMany({});
    log(`   ✅ Deleted ${deletedAttendance.count} attendance records`, 'green');

    // Step 2: Delete all students
    log('\n2️⃣  Deleting all students...', 'blue');
    const deletedStudents = await prisma.student.deleteMany({});
    log(`   ✅ Deleted ${deletedStudents.count} students`, 'green');

    // Step 3: Reset all class student counts
    log('\n3️⃣  Resetting class student counts...', 'blue');
    const updatedClasses = await prisma.class.updateMany({
      data: {
        studentCount: 0
      }
    });
    log(`   ✅ Reset student count in ${updatedClasses.count} classes`, 'green');

    // Verify final state
    log('\n🔍 Verifying final state...', 'blue');
    const finalStats = await getStatistics();
    
    log(`\nFinal database state:`, 'white');
    log(`  👥 Students: ${finalStats.studentCount}`, 'white');
    log(`  📋 Attendance Records: ${finalStats.attendanceCount}`, 'white');
    log(`  🏫 Classes: ${finalStats.classCount}`, 'white');

    // Summary
    logBold('\n🎉 DELETION COMPLETED SUCCESSFULLY!', 'green');
    log('=====================================', 'green');
    log(`✅ Deleted ${deletedStudents.count} students`, 'green');
    log(`✅ Deleted ${deletedAttendance.count} attendance records`, 'green');
    log(`✅ Reset ${updatedClasses.count} class student counts`, 'green');

  } catch (error) {
    log(`\n❌ Error during deletion: ${error.message}`, 'red');
    log('Stack trace:', 'red');
    console.error(error);
    throw error;
  }
}

async function main() {
  try {
    await deleteAllStudents();
  } catch (error) {
    log('\n💥 Script failed with error:', 'red');
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Handle script interruption
process.on('SIGINT', async () => {
  log('\n\n⚠️  Script interrupted by user', 'yellow');
  await prisma.$disconnect();
  process.exit(0);
});

// Show help if requested
if (args.includes('--help') || args.includes('-h')) {
  logBold('\n🗑️  DELETE ALL STUDENTS SCRIPT', 'cyan');
  log('=====================================', 'cyan');
  log('\nUsage:', 'white');
  log('  node scripts/delete-all-students.js [options]', 'white');
  log('\nOptions:', 'white');
  log('  --confirm    Skip confirmation prompt', 'white');
  log('  --dry-run    Show what would be deleted without actually deleting', 'white');
  log('  --help, -h   Show this help message', 'white');
  log('\nExamples:', 'white');
  log('  node scripts/delete-all-students.js', 'cyan');
  log('  node scripts/delete-all-students.js --dry-run', 'cyan');
  log('  node scripts/delete-all-students.js --confirm', 'cyan');
  process.exit(0);
}

// Run the script
main();
