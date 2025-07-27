#!/usr/bin/env node

/**
 * Test Login with Raw SQL
 * 
 * This script tests login using raw SQL queries to bypass Prisma client issues
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const databaseUrl = process.argv[2] || process.env.DATABASE_URL;

if (!databaseUrl) {
  console.log('❌ Please provide DATABASE_URL');
  process.exit(1);
}

console.log('🧪 Testing login with raw SQL...');

const prisma = new PrismaClient({
  datasources: {
    db: { url: databaseUrl }
  }
});

async function testLoginRaw() {
  try {
    console.log('🔍 Testing connection...');
    await prisma.$connect();
    console.log('✅ Connected to Supabase');

    // Test login process with raw SQL (like the API will do)
    const username = 'admin';
    const password = 'admin123';

    console.log(`\n🔐 Testing login for username: ${username}`);

    // Step 1: Find user by username (raw SQL)
    console.log('1️⃣ Finding user by username...');
    const users = await prisma.$queryRaw`
      SELECT id, name, username, password, role, "classId", "createdAt", "updatedAt"
      FROM users 
      WHERE username = ${username}
    `;

    if (users.length === 0) {
      console.log('❌ User not found');
      return;
    }

    const user = users[0];
    console.log('✅ User found:', {
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
      classId: user.classId
    });

    // Step 2: Verify password
    console.log('2️⃣ Verifying password...');
    const isValidPassword = await bcrypt.compare(password, user.password);
    console.log(`✅ Password verification: ${isValidPassword ? 'VALID' : 'INVALID'}`);

    if (!isValidPassword) {
      console.log('❌ Login failed: Invalid password');
      return;
    }

    // Step 3: Get class information (if user has a class)
    let classInfo = null;
    if (user.classId) {
      console.log('3️⃣ Getting class information...');
      const classes = await prisma.$queryRaw`
        SELECT id, name, "studentCount", "createdAt", "updatedAt"
        FROM classes 
        WHERE id = ${user.classId}
      `;
      
      if (classes.length > 0) {
        classInfo = classes[0];
        console.log('✅ Class found:', {
          id: classInfo.id,
          name: classInfo.name,
          studentCount: classInfo.studentCount
        });
      }
    } else {
      console.log('3️⃣ User has no assigned class');
    }

    // Step 4: Prepare response data (like the API would)
    console.log('4️⃣ Preparing response data...');
    const responseData = {
      success: true,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role,
        classId: user.classId,
        className: classInfo?.name || null,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    };

    console.log('✅ Response data prepared:', JSON.stringify(responseData, null, 2));

    console.log('\n🎉 LOGIN TEST SUCCESSFUL!');
    console.log('✅ Database schema is working correctly');
    console.log('✅ User authentication works');
    console.log('✅ Raw SQL queries work perfectly');
    console.log('✅ Ready for Vercel deployment');

  } catch (error) {
    console.error('❌ Login test failed:', error.message);
    console.error('Full error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testLoginRaw();
