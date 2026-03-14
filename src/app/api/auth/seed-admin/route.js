import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export async function GET(req) {
  try {
    await dbConnect();
    
    const adminEmail = 'admin@hms.com';
    const adminPassword = 'AdminPassword123!';

    const existingAdmin = await User.findOne({ email: adminEmail });
    if (existingAdmin) {
      return NextResponse.json({ 
        message: 'Admin user already exists. You can now login.', 
        email: adminEmail,
        password: adminPassword
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminPassword, salt);

    await User.create({
      email: adminEmail,
      password: hashedPassword,
      role: 'ADMIN',
      isActive: true,
    });

    return NextResponse.json({ 
      message: 'Admin user created successfully! Please login with the following credentials:', 
      email: adminEmail, 
      password: adminPassword 
    }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
