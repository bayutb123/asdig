import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function listClasses() {
  try {
    console.log('📋 Current classes in database:\n');

    const classes = await prisma.class.findMany({
      orderBy: [
        { grade: 'asc' },
        { section: 'asc' }
      ],
      include: {
        _count: {
          select: {
            students: true
          }
        }
      }
    });

    classes.forEach((cls, index) => {
      const studentCount = cls._count.students;
      const canDelete = studentCount === 0 ? '✅ Can Delete' : '❌ Has Students';
      
      console.log(`${index + 1}. ${cls.name} (Grade ${cls.grade}${cls.section})`);
      console.log(`   - ID: ${cls.id}`);
      console.log(`   - Teacher: ${cls.teacherName}`);
      console.log(`   - Students: ${studentCount} ${canDelete}`);
      console.log('');
    });

    console.log(`📊 Total classes: ${classes.length}`);
    
    const deletableClasses = classes.filter(cls => cls._count.students === 0);
    console.log(`🗑️  Deletable classes (0 students): ${deletableClasses.length}`);

  } catch (error) {
    console.error('❌ Error listing classes:', error);
  } finally {
    await prisma.$disconnect();
  }
}

listClasses();
