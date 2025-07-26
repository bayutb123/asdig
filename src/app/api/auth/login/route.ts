import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyPassword, generateToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  console.log('🚀 LOGIN ATTEMPT STARTED', {
    timestamp: new Date().toISOString(),
    userAgent: request.headers.get('user-agent'),
    ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
    origin: request.headers.get('origin'),
  });

  try {
    // Check environment variables
    console.log('🔍 Checking environment variables...');

    if (!process.env.JWT_SECRET) {
      console.error('❌ CRITICAL: JWT_SECRET environment variable is not set');
      console.log('Available env vars:', Object.keys(process.env).filter(key =>
        key.includes('JWT') || key.includes('SECRET') || key.includes('AUTH')
      ));
      return NextResponse.json(
        { error: 'Server configuration error: JWT_SECRET missing' },
        { status: 500 }
      )
    }
    console.log('✅ JWT_SECRET is set, length:', process.env.JWT_SECRET.length);

    if (!process.env.DATABASE_URL) {
      console.error('❌ CRITICAL: DATABASE_URL environment variable is not set');
      console.log('Available env vars:', Object.keys(process.env).filter(key =>
        key.includes('DATABASE') || key.includes('DB')
      ));
      return NextResponse.json(
        { error: 'Database configuration error: DATABASE_URL missing' },
        { status: 500 }
      )
    }
    console.log('✅ DATABASE_URL is set, starts with:', process.env.DATABASE_URL.substring(0, 20) + '...');

    // Parse request body
    console.log('📝 Parsing request body...');
    let requestBody;
    try {
      requestBody = await request.json();
      console.log('✅ Request body parsed successfully');
    } catch (parseError) {
      console.error('❌ Failed to parse request body:', parseError);
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      )
    }

    const { username, password } = requestBody;
    console.log('📋 Login attempt for username:', username ? `"${username}"` : 'undefined');

    // Validate input
    if (!username || !password) {
      console.error('❌ Missing credentials:', {
        hasUsername: !!username,
        hasPassword: !!password,
        usernameType: typeof username,
        passwordType: typeof password
      });
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      )
    }
    console.log('✅ Input validation passed');

    // Database connection test
    console.log('🗄️ Testing database connection...');
    try {
      await prisma.$connect();
      console.log('✅ Database connection successful');
    } catch (dbConnectError) {
      console.error('❌ Database connection failed:', dbConnectError);
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      )
    }

    // Find user by username
    console.log('🔍 Searching for user in database...');
    let user;
    try {
      user = await prisma.user.findUnique({
        where: { username },
        include: {
          class: true,
        },
      });
      console.log('✅ Database query completed');
      console.log('👤 User found:', !!user);
      if (user) {
        console.log('📊 User details:', {
          id: user.id,
          username: user.username,
          role: user.role,
          hasClass: !!user.class,
          classId: user.classId,
          createdAt: user.createdAt
        });
      }
    } catch (dbQueryError) {
      console.error('❌ Database query failed:', dbQueryError);
      return NextResponse.json(
        { error: 'Database query failed' },
        { status: 500 }
      )
    }

    if (!user) {
      console.log('❌ User not found for username:', username);
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Verify password
    console.log('🔐 Verifying password...');
    let isValidPassword;
    try {
      isValidPassword = await verifyPassword(password, user.password);
      console.log('✅ Password verification completed');
      console.log('🔑 Password valid:', isValidPassword);
    } catch (passwordError) {
      console.error('❌ Password verification failed:', passwordError);
      return NextResponse.json(
        { error: 'Password verification failed' },
        { status: 500 }
      )
    }

    if (!isValidPassword) {
      console.log('❌ Invalid password for user:', username);
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Generate JWT token
    console.log('🎫 Generating JWT token...');
    let token;
    try {
      token = generateToken({
        userId: user.id,
        username: user.username,
        role: user.role,
        classId: user.classId || undefined,
      });
      console.log('✅ JWT token generated successfully');
      console.log('📝 Token length:', token.length);
    } catch (tokenError) {
      console.error('❌ JWT token generation failed:', tokenError);
      return NextResponse.json(
        { error: 'Token generation failed' },
        { status: 500 }
      )
    }

    // Return user data (without password) and token
    const { password: _password, ...userWithoutPassword } = user;

    console.log('🎉 LOGIN SUCCESSFUL', {
      userId: user.id,
      username: user.username,
      role: user.role,
      duration: Date.now() - startTime + 'ms'
    });

    return NextResponse.json({
      success: true,
      user: userWithoutPassword,
      token,
    })
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('💥 LOGIN FAILED - UNHANDLED ERROR', {
      duration: duration + 'ms',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : 'Unknown',
      cause: error instanceof Error ? error.cause : undefined
    });

    // Log environment info for debugging
    console.log('🔧 DEBUG INFO', {
      nodeEnv: process.env.NODE_ENV,
      hasJwtSecret: !!process.env.JWT_SECRET,
      jwtSecretLength: process.env.JWT_SECRET?.length,
      hasDatabaseUrl: !!process.env.DATABASE_URL,
      databaseUrlPrefix: process.env.DATABASE_URL?.substring(0, 10),
      prismaVersion: 'unknown', // Prisma version info
      platform: process.platform,
      nodeVersion: process.version
    });

    // Provide more specific error information in development
    const isDevelopment = process.env.NODE_ENV === 'development'
    const errorMessage = isDevelopment && error instanceof Error
      ? `Internal server error: ${error.message}`
      : 'Internal server error'

    return NextResponse.json(
      {
        error: errorMessage,
        timestamp: new Date().toISOString(),
        ...(isDevelopment && {
          stack: error instanceof Error ? error.stack : undefined,
          details: error instanceof Error ? {
            name: error.name,
            message: error.message,
            cause: error.cause
          } : undefined
        })
      },
      { status: 500 }
    )
  } finally {
    // Always disconnect from database
    try {
      await prisma.$disconnect();
      console.log('🔌 Database disconnected');
    } catch (disconnectError) {
      console.error('⚠️ Database disconnect error:', disconnectError);
    }
  }
}
