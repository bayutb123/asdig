#!/usr/bin/env tsx

/**
 * Migration script to add enrollmentStatus field to Student model
 * This separates student enrollment status (ACTIVE/INACTIVE) from attendance status (HADIR/TIDAK_HADIR/etc)
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🚀 Starting migration: Add enrollmentStatus field to students...')

  try {
    // First, let's check current schema
    console.log('📊 Checking current students...')
    const studentCount = await prisma.student.count()
    console.log(`Found ${studentCount} students in database`)

    if (studentCount === 0) {
      console.log('✅ No students found, migration not needed')
      return
    }

    // The migration will be handled by Prisma when we run prisma db push
    // This script is just for verification and data migration if needed
    
    console.log('✅ Migration preparation complete!')
    console.log('📝 Next steps:')
    console.log('   1. Run: npx prisma db push')
    console.log('   2. All existing students will get enrollmentStatus = ACTIVE by default')
    console.log('   3. The status field will remain for attendance tracking')

  } catch (error) {
    console.error('❌ Migration failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .catch((error) => {
    console.error('❌ Migration script failed:', error)
    process.exit(1)
  })
