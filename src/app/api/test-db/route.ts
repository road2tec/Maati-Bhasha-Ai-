import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

export async function GET() {
  try {
    console.log('Testing database connection...');
    const db = await getDatabase();
    
    // Try to ping the database
    await db.command({ ping: 1 });
    
    console.log('Database connection successful!');
    
    return NextResponse.json({
      success: true,
      message: 'MongoDB connection successful',
      dbName: db.databaseName,
    });
  } catch (error: any) {
    console.error('Database connection failed:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Database connection failed',
        details: error.message,
        stack: error.stack,
      },
      { status: 500 }
    );
  }
}
