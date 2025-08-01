// Server-side auth utilities (Node.js only)
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-require-imports */
let jwt: any = null
let bcrypt: any = null

// Dynamically import server-side libraries
if (typeof window === 'undefined') {
  jwt = require('jsonwebtoken')
  bcrypt = require('bcryptjs')
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'

// Validate JWT_SECRET in production
if (typeof window === 'undefined' && process.env.NODE_ENV === 'production' && JWT_SECRET === 'your-secret-key-change-in-production') {
  console.error('SECURITY WARNING: JWT_SECRET is using default value in production!')
}

export interface JWTPayload {
  userId: string
  username: string
  role: 'TEACHER' | 'ADMIN'
  classId?: string
  iat?: number
  exp?: number
}

// Hash password (server-side only)
export async function hashPassword(password: string): Promise<string> {
  if (!bcrypt) {
    throw new Error('bcrypt is only available on the server side')
  }
  const saltRounds = 12
  return bcrypt.hash(password, saltRounds)
}

// Verify password (server-side only)
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  console.log('🔐 verifyPassword called', {
    hasPassword: !!password,
    passwordLength: password?.length,
    hasHashedPassword: !!hashedPassword,
    hashedPasswordLength: hashedPassword?.length,
    hashedPasswordPrefix: hashedPassword?.substring(0, 10)
  });

  if (!bcrypt) {
    console.error('❌ bcrypt not available on server side');
    throw new Error('bcrypt is only available on the server side')
  }

  try {
    const result = await bcrypt.compare(password, hashedPassword);
    console.log('✅ bcrypt.compare completed, result:', result);
    return result;
  } catch (bcryptError) {
    console.error('❌ bcrypt.compare failed:', bcryptError);
    throw bcryptError;
  }
}

// Generate JWT token (server-side only)
export function generateToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
  console.log('🎫 generateToken called', {
    payload: {
      userId: payload.userId,
      username: payload.username,
      role: payload.role,
      classId: payload.classId
    },
    jwtSecretLength: JWT_SECRET.length,
    expiresIn: JWT_EXPIRES_IN
  });

  if (!jwt) {
    console.error('❌ JWT not available on server side');
    throw new Error('JWT generation is only available on the server side')
  }

  try {
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    console.log('✅ JWT token generated successfully', {
      tokenLength: token.length,
      tokenPrefix: token.substring(0, 20) + '...'
    });
    return token;
  } catch (jwtError) {
    console.error('❌ JWT generation failed:', jwtError);
    throw jwtError;
  }
}

// Verify JWT token (server-side only)
export function verifyToken(token: string): JWTPayload | null {
  if (!jwt) {
    console.warn('JWT verification is only available on the server side')
    return null
  }
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  } catch (error) {
    console.error('JWT verification failed:', error)
    return null
  }
}

// Extract token from Authorization header
export function extractTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }
  return authHeader.substring(7)
}

// Get user from token (server-side only)
export function getUserFromToken(token: string): JWTPayload | null {
  return verifyToken(token)
}

// Client-side JWT utilities (basic parsing without verification)
export function parseJWTPayload(token: string): JWTPayload | null {
  try {
    // Split the token and decode the payload (without verification)
    const parts = token.split('.')
    if (parts.length !== 3) {
      return null
    }

    const payload = parts[1]
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')))

    // Check if token is expired
    if (decoded.exp && Date.now() >= decoded.exp * 1000) {
      return null
    }

    return decoded as JWTPayload
  } catch (error) {
    console.error('Failed to parse JWT payload:', error)
    return null
  }
}

// Check if token is expired (client-side safe)
export function isTokenExpired(token: string): boolean {
  const payload = parseJWTPayload(token)
  return !payload
}
