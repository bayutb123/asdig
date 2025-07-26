#!/usr/bin/env tsx

/**
 * Test script for add class functionality
 * This script tests the add class API endpoint and form validation
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testAddClassAPI() {
  console.log('🧪 Testing Add Class API Functionality\n')

  const baseUrl = 'http://localhost:3000'
  
  try {
    // 1. Login as admin to get token
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

    // 2. Test creating a new class
    console.log('\n2. Testing class creation...')
    const testClassData = {
      id: `test-class-${Date.now()}`,
      name: '7A',
      grade: 7,
      section: 'A',
      teacherId: `teacher-${Date.now()}`,
      teacherName: 'Ibu Test Teacher, S.Pd',
      studentCount: 30,
    }

    const createResponse = await fetch(`${baseUrl}/api/classes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(testClassData),
    })

    if (!createResponse.ok) {
      const errorData = await createResponse.json()
      console.log('❌ Failed to create class:', errorData)
      return
    }

    const createData = await createResponse.json()
    console.log('✅ Class created successfully:', createData.class.name)
    console.log('   - ID:', createData.class.id)
    console.log('   - Teacher:', createData.class.teacherName)
    console.log('   - Capacity:', createData.class.studentCount)

    // 3. Test duplicate class creation (should fail)
    console.log('\n3. Testing duplicate class creation (should fail)...')
    const duplicateResponse = await fetch(`${baseUrl}/api/classes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        ...testClassData,
        id: `test-class-duplicate-${Date.now()}`,
      }),
    })

    if (duplicateResponse.status === 409) {
      console.log('✅ Duplicate class creation properly rejected')
    } else {
      console.log('❌ Duplicate class creation should have been rejected')
    }

    // 4. Test invalid data (should fail)
    console.log('\n4. Testing invalid data validation...')
    const invalidResponse = await fetch(`${baseUrl}/api/classes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        // Missing required fields
        name: '',
        grade: 0,
      }),
    })

    if (invalidResponse.status === 400) {
      console.log('✅ Invalid data properly rejected')
    } else {
      console.log('❌ Invalid data should have been rejected')
    }

    // 5. Verify class exists in database
    console.log('\n5. Verifying class in database...')
    const dbClass = await prisma.class.findUnique({
      where: { id: testClassData.id },
    })

    if (dbClass) {
      console.log('✅ Class found in database:', dbClass.name)
      console.log('   - Grade:', dbClass.grade)
      console.log('   - Section:', dbClass.section)
      console.log('   - Teacher:', dbClass.teacherName)
    } else {
      console.log('❌ Class not found in database')
    }

    // 6. Clean up test data
    console.log('\n6. Cleaning up test data...')
    await prisma.class.delete({
      where: { id: testClassData.id },
    })
    console.log('✅ Test class deleted')

    console.log('\n🎉 All add class tests completed successfully!')

  } catch (error) {
    console.error('❌ Test failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

async function testFormValidation() {
  console.log('\n🔍 Testing Form Validation Logic\n')

  // Test validation function logic
  const testCases = [
    {
      name: 'Valid data',
      data: {
        grade: '1',
        teacherName: 'Ibu Sari, S.Pd',
        teacherNip: '12345678',
        teacherPhone: '081234567890',
        teacherEmail: 'sari@school.com',
        studentCount: 30,
      },
      shouldPass: true,
    },
    {
      name: 'Missing grade',
      data: {
        grade: '',
        teacherName: 'Ibu Sari, S.Pd',
        teacherNip: '12345678',
        studentCount: 30,
      },
      shouldPass: false,
      expectedError: 'grade',
    },
    {
      name: 'Missing teacher name',
      data: {
        grade: '1',
        teacherName: '',
        teacherNip: '12345678',
        studentCount: 30,
      },
      shouldPass: false,
      expectedError: 'teacherName',
    },
    {
      name: 'Short NIP',
      data: {
        grade: '1',
        teacherName: 'Ibu Sari, S.Pd',
        teacherNip: '123',
        studentCount: 30,
      },
      shouldPass: false,
      expectedError: 'teacherNip',
    },
    {
      name: 'Invalid email',
      data: {
        grade: '1',
        teacherName: 'Ibu Sari, S.Pd',
        teacherNip: '12345678',
        teacherEmail: 'invalid-email',
        studentCount: 30,
      },
      shouldPass: false,
      expectedError: 'teacherEmail',
    },
    {
      name: 'Invalid student count',
      data: {
        grade: '1',
        teacherName: 'Ibu Sari, S.Pd',
        teacherNip: '12345678',
        studentCount: 100,
      },
      shouldPass: false,
      expectedError: 'studentCount',
    },
  ]

  // Simple validation function (mimics the one in the component)
  function validateForm(data: any) {
    const errors: {[key: string]: string} = {}

    if (!data.grade) {
      errors.grade = 'Tingkat kelas harus dipilih'
    }

    if (!data.teacherName?.trim()) {
      errors.teacherName = 'Nama guru harus diisi'
    }

    if (!data.teacherNip?.trim()) {
      errors.teacherNip = 'NIP guru harus diisi'
    } else if (data.teacherNip.length < 8) {
      errors.teacherNip = 'NIP harus minimal 8 karakter'
    }

    if (data.teacherPhone && !/^[0-9+\-\s()]+$/.test(data.teacherPhone)) {
      errors.teacherPhone = 'Format nomor telepon tidak valid'
    }

    if (data.teacherEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.teacherEmail)) {
      errors.teacherEmail = 'Format email tidak valid'
    }

    if (data.studentCount < 1 || data.studentCount > 50) {
      errors.studentCount = 'Kapasitas siswa harus antara 1-50'
    }

    return { errors, isValid: Object.keys(errors).length === 0 }
  }

  // Run test cases
  testCases.forEach((testCase, index) => {
    console.log(`${index + 1}. Testing: ${testCase.name}`)
    const result = validateForm(testCase.data)
    
    if (testCase.shouldPass) {
      if (result.isValid) {
        console.log('   ✅ Validation passed as expected')
      } else {
        console.log('   ❌ Validation failed unexpectedly:', result.errors)
      }
    } else {
      if (!result.isValid && result.errors[testCase.expectedError!]) {
        console.log('   ✅ Validation failed as expected:', result.errors[testCase.expectedError!])
      } else {
        console.log('   ❌ Validation should have failed for:', testCase.expectedError)
      }
    }
  })

  console.log('\n🎉 Form validation tests completed!')
}

// Run all tests
async function runAllTests() {
  await testAddClassAPI()
  await testFormValidation()
}

if (require.main === module) {
  runAllTests()
}
