import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addTestClass() {
  try {
    console.log('🎯 Adding test class for delete functionality...\n');

    // Create a test class with no students
    const testClass = await prisma.class.create({
      data: {
        id: `test-delete-${Date.now()}`,
        name: 'Kelas 7C',
        studentCount: 0
      }
    });

    console.log('✅ Test class created successfully!');
    console.log(`   - ID: ${testClass.id}`);
    console.log(`   - Name: ${testClass.name}`);
    console.log(`   - Student Count: ${testClass.studentCount}`);
    console.log('\n🎮 You can now test the delete function in the web interface!');
    console.log('   1. Go to /kelola-kelas');
    console.log('   2. Find the "7C" class');
    console.log('   3. Click the "Hapus" button');
    console.log('   4. Test the floating dialog with scroll lock');

  } catch (error) {
    console.error('❌ Error creating test class:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addTestClass();
