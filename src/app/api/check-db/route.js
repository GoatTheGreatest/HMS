import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function GET(req) {
  try {
    await dbConnect();
    const admin = await User.findOne({ email: 'admin@hms.com' }).select('+password');
    if (!admin) {
      return NextResponse.json({ found: false, message: 'Admin not found in DB' });
    }
    
    // Check if password matches 'AdminPassword123!'
    const isMatch = await bcrypt.compare('AdminPassword123!', admin.password);
    
    return NextResponse.json({ 
      found: true, 
      role: admin.role, 
      isActive: admin.isActive,
      passwordLength: admin.password.length,
      passwordMatches: isMatch
    });
  } catch (error) {
    return NextResponse.json({ found: false, error: error.message });
  }
}
