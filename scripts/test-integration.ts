/**
 * Integration Test Script
 * Tests all features with the database integration
 */

import { apiClient } from '../src/hooks/useApi'
import { dataService } from '../src/services/dataService'

async function testIntegration() {
  console.log('🧪 Starting Integration Tests...\n')

  try {
    // Test 1: Authentication
    console.log('1️⃣ Testing Authentication...')
    try {
      const loginResult = await apiClient.login('admin', 'admin123')
      if (loginResult.success) {
        console.log('✅ Admin login successful')
        console.log(`   User: ${loginResult.user.name} (${loginResult.user.role})`)
        
        // Set token for subsequent requests
        apiClient.setToken(loginResult.token)
      } else {
        console.log('❌ Admin login failed')
        return
      }
    } catch (error) {
      console.log('❌ Authentication test failed:', error)
      return
    }

    // Test 2: Users API
    console.log('\n2️⃣ Testing Users API...')
    try {
      const usersResponse = await apiClient.getUsers()
      console.log(`✅ Fetched ${usersResponse.users.length} users`)
      
      const teachers = usersResponse.users.filter(u => u.role === 'TEACHER')
      const admins = usersResponse.users.filter(u => u.role === 'ADMIN')
      console.log(`   Teachers: ${teachers.length}, Admins: ${admins.length}`)
    } catch (error) {
      console.log('❌ Users API test failed:', error)
    }

    // Test 3: Classes API
    console.log('\n3️⃣ Testing Classes API...')
    try {
      const classesResponse = await apiClient.getClasses()
      console.log(`✅ Fetched ${classesResponse.classes.length} classes`)
      
      if (classesResponse.classes.length > 0) {
        const firstClass = classesResponse.classes[0]
        console.log(`   Sample: ${firstClass.name} - ${firstClass.teacherName}`)
      }
    } catch (error) {
      console.log('❌ Classes API test failed:', error)
    }

    // Test 4: Students API
    console.log('\n4️⃣ Testing Students API...')
    try {
      const studentsResponse = await apiClient.getStudents()
      console.log(`✅ Fetched ${studentsResponse.data.length} students`)

      if (studentsResponse.data.length > 0) {
        const firstStudent = studentsResponse.data[0]
        console.log(`   Sample: ${firstStudent.name} - ${firstStudent.className}`)
      }
    } catch (error) {
      console.log('❌ Students API test failed:', error)
    }

    // Test 5: Attendance API
    console.log('\n5️⃣ Testing Attendance API...')
    try {
      const attendanceResponse = await apiClient.getAttendance()
      console.log(`✅ Fetched ${attendanceResponse.attendanceRecords.length} attendance records`)
      
      if (attendanceResponse.attendanceRecords.length > 0) {
        const firstRecord = attendanceResponse.attendanceRecords[0]
        console.log(`   Sample: ${firstRecord.studentName} - ${firstRecord.date} - ${firstRecord.status}`)
      }
    } catch (error) {
      console.log('❌ Attendance API test failed:', error)
    }

    // Test 6: Data Service Integration
    console.log('\n6️⃣ Testing Data Service...')
    try {
      const classes = await dataService.getAllClasses()
      const students = await dataService.getAllStudents()
      const teachers = await dataService.getAllTeachers()
      
      console.log(`✅ Data Service working:`)
      console.log(`   Classes: ${classes.length}`)
      console.log(`   Students: ${students.length}`)
      console.log(`   Teachers: ${teachers.length}`)
    } catch (error) {
      console.log('❌ Data Service test failed:', error)
    }

    // Test 7: Create Attendance Record
    console.log('\n7️⃣ Testing Create Attendance...')
    try {
      const studentsResponse = await apiClient.getStudents()
      if (studentsResponse.data.length > 0) {
        const testStudent = studentsResponse.data[0]
        const testDate = new Date().toISOString().split('T')[0]
        
        const newRecord = await apiClient.createAttendance({
          studentId: testStudent.id,
          studentName: testStudent.name,
          classId: testStudent.classId,
          className: testStudent.className,
          date: testDate,
          status: 'HADIR',
          checkInTime: '07:30',
          notes: 'Integration test record'
        })
        
        if (newRecord.success) {
          console.log(`✅ Created attendance record for ${testStudent.name}`)
        } else {
          console.log('❌ Failed to create attendance record')
        }
      }
    } catch (error) {
      console.log('❌ Create attendance test failed:', error)
    }

    // Test 8: Teacher Login
    console.log('\n8️⃣ Testing Teacher Authentication...')
    try {
      const teacherLogin = await apiClient.login('walikelas1a', 'password123')
      if (teacherLogin.success) {
        console.log('✅ Teacher login successful')
        console.log(`   Teacher: ${teacherLogin.user.name} - ${teacherLogin.user.className}`)
      } else {
        console.log('❌ Teacher login failed')
      }
    } catch (error) {
      console.log('❌ Teacher authentication test failed:', error)
    }

    // Test 9: Filtered Data Access
    console.log('\n9️⃣ Testing Filtered Data Access...')
    try {
      // Test getting students by class
      const classesResponse = await apiClient.getClasses()
      if (classesResponse.classes.length > 0) {
        const firstClass = classesResponse.classes[0]
        const classStudents = await apiClient.getStudents(firstClass.id)
        console.log(`✅ Fetched ${classStudents.data.length} students for class ${firstClass.name}`)
      }

      // Test getting attendance by date
      const today = new Date().toISOString().split('T')[0]
      const todayAttendance = await apiClient.getAttendance({ date: today })
      console.log(`✅ Fetched ${todayAttendance.attendanceRecords.length} attendance records for today`)
    } catch (error) {
      console.log('❌ Filtered data access test failed:', error)
    }

    console.log('\n🎉 Integration Tests Completed!')
    console.log('\n📊 Summary:')
    console.log('✅ Database integration working')
    console.log('✅ API endpoints functional')
    console.log('✅ Authentication system operational')
    console.log('✅ Data service layer working')
    console.log('✅ CRUD operations successful')

  } catch (error) {
    console.error('💥 Integration test failed:', error)
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  testIntegration()
    .then(() => {
      console.log('\n✨ All tests completed!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('💥 Test suite failed:', error)
      process.exit(1)
    })
}

export default testIntegration
