import { NextRequest, NextResponse } from 'next/server';
import { createUser, getUserByEmail } from '@/lib/db-operations';
import { hashPassword, generateToken, setAuthCookie, isAdminEmail } from '@/lib/auth';

const ADMIN_PASS = 'admin123';

export async function POST(request: NextRequest) {
  try {
    console.log('Register endpoint called');
    const body = await request.json();
    console.log('Request body:', { email: body.email, username: body.username });
    const { email, password, username } = body;

    if (!email || !password || !username) {
      console.error('Missing required fields');
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists with this email' },
        { status: 409 }
      );
    }

    // Check if this is admin registration
    const isAdmin = isAdminEmail(email) && password === ADMIN_PASS;

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const userId = await createUser({
      username,
      email,
      password: hashedPassword,
      isAdmin,
      isBlocked: false,
    });

    // Generate token
    const token = generateToken({
      userId,
      email,
      username,
      isAdmin,
    });

    // Set cookie
    await setAuthCookie(token);

    return NextResponse.json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: userId,
        username,
        email,
        isAdmin,
      },
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    console.error('Error stack:', error.stack);
    console.error('Error message:', error.message);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
