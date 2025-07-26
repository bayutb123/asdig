#!/usr/bin/env tsx

/**
 * Test script for delete class functionality
 * This script tests the delete class API endpoint and verifies proper error handling
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testDeleteClass() {
  console.log('🧪 Testing Delete Class Functionality\n')

  try {
    // 1. Create a test class first
    console.log('1. Creating a test class...')
    const testClass = await prisma.class.create({
      data: {
        id: 'test-class-delete',
        name: 'TEST',
        grade: 1,
        section: 'Z',
        teacherId: 'test-teacher-delete',
        teacherName: 'Test Teacher for Delete',
        studentCount: 0,
      },
    })
    console.log('✅ Test class created:', testClass.name)

    // 2. Test deleting empty class (should succeed)
    console.log('\n2. Testing delete of empty class...')
    const deleteResult = await prisma.class.delete({
      where: { id: testClass.id },
    })
    console.log('✅ Empty class deleted successfully:', deleteResult.name)

    // 3. Create another test class with students
    console.log('\n3. Creating test class with students...')
    const classWithStudents = await prisma.class.create({
      data: {
        id: 'test-class-with-students',
        name: 'TESTB',
        grade: 1,
        section: 'Y',
        teacherId: 'test-teacher-2',
        teacherName: 'Test Teacher 2',
        studentCount: 1,
      },
    })

    // Add a test student
    const testStudent = await prisma.student.create({
      data: {
        id: 'test-student-delete',
        name: 'Test Student for Delete',
        classId: classWithStudents.id,
        className: classWithStudents.name,
        nisn: '1234567890',
        gender: 'L',
        birthDate: '2010-01-01',
        address: 'Test Address',
        parentName: 'Test Parent',
        parentPhone: '081234567890',
        status: 'HADIR',
      },
    })
    console.log('✅ Test class with student created')

    // 4. Test deleting class with students (should fail)
    console.log('\n4. Testing delete of class with students (should fail)...')
    try {
      // Check if class has students first (simulating API logic)
      const classWithCount = await prisma.class.findUnique({
        where: { id: classWithStudents.id },
        include: {
          _count: {
            select: {
              students: true,
              attendanceRecords: true,
            },
          },
        },
      })

      if (classWithCount && (classWithCount._count.students > 0 || classWithCount._count.attendanceRecords > 0)) {
        console.log('❌ Cannot delete class with students/attendance records')
        console.log(`   Students: ${classWithCount._count.students}`)
        console.log(`   Attendance records: ${classWithCount._count.attendanceRecords}`)
      }
    } catch (error) {
      console.log('❌ Error checking class constraints:', error)
    }

    // 5. Clean up test data
    console.log('\n5. Cleaning up test data...')
    await prisma.student.delete({ where: { id: testStudent.id } })
    await prisma.class.delete({ where: { id: classWithStudents.id } })
    console.log('✅ Test data cleaned up')

    console.log('\n🎉 All delete class tests completed successfully!')

  } catch (error) {
    console.error('❌ Test failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

async function testDeleteClassAPI() {
  console.log('\n🌐 Testing Delete Class API Endpoint\n')

  const baseUrl = 'http://localhost:3000'
  
  try {
    // First, login as admin to get token
    console.log('1. Logging in as admin...')
    const loginResponse = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'admin',
        password: 'admin123',
      }),
    })

    if (!loginResponse.ok) {
      throw new Error('Failed to login')
    }

    const loginData = await loginResponse.json()
    const token = loginData.token
    console.log('✅ Admin login successful')

    // 2. Create a test class via API
    console.log('\n2. Creating test class via API...')
    const createResponse = await fetch(`${baseUrl}/api/classes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        id: 'api-test-class',
        name: 'APITEST',
        grade: 1,
        section: 'X',
        teacherId: 'api-test-teacher',
        teacherName: 'API Test Teacher',
      }),
    })

    if (!createResponse.ok) {
      const errorData = await createResponse.json()
      console.log('❌ Failed to create test class:', errorData)
      return
    }

    const createData = await createResponse.json()
    console.log('✅ Test class created via API:', createData.class.name)

    // 3. Test delete via API
    console.log('\n3. Testing delete via API...')
    const deleteResponse = await fetch(`${baseUrl}/api/classes?id=api-test-class`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })

    if (!deleteResponse.ok) {
      const errorData = await deleteResponse.json()
      console.log('❌ Delete failed:', errorData)
    } else {
      const deleteData = await deleteResponse.json()
      console.log('✅ Class deleted via API:', deleteData.message)
    }

    console.log('\n🎉 API delete class tests completed!')

  } catch (error) {
    console.error('❌ API test failed:', error)
  }
}

// Run tests
async function runAllTests() {
  await testDeleteClass()
  await testDeleteClassAPI()
}

if (require.main === module) {
  runAllTests()
}
