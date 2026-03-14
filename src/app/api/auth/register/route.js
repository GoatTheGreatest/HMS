import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Patient from '@/models/Patient';
import Doctor from '@/models/Doctor';
import Nurse from '@/models/Nurse';
import Pharmaceutical from '@/models/Pharmaceutical';

export async function POST(req) {
  try {
    await dbConnect();
    const body = await req.json();
    const { email, password, role, firstName, lastName, ...otherData } = body;

    if (!email || !password || !role || !firstName || !lastName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: 'User already exists with this email' }, { status: 400 });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      email,
      password: hashedPassword,
      role,
      firstName,
      lastName,
    });

    // Create role-specific profile
    if (role === 'PATIENT') {
      await Patient.create({
        userId: user._id,
        firstName,
        lastName,
        phone: otherData.phone || '',
        gender: otherData.gender || '',
        bloodGroup: otherData.bloodGroup || '',
      });
    } else if (role === 'DOCTOR') {
      const licenseNumber = otherData.licenseNumber || `PMDC-${Date.now()}`;
      await Doctor.create({
        userId: user._id,
        firstName,
        lastName,
        specialization: otherData.specialization || 'General Medicine',
        licenseNumber,
        licenseBody: otherData.licenseBody || 'PMDC',
        experience: otherData.experience || 0,
        consultationFee: otherData.consultationFee || 0,
        verificationStatus: 'PENDING',
      });
    } else if (role === 'NURSE') {
      const licenseNumber = otherData.licenseNumber || `PNC-${Date.now()}`;
      await Nurse.create({
        userId: user._id,
        firstName,
        lastName,
        licenseNumber,
        licenseBody: otherData.licenseBody || 'PNC',
        specialization: otherData.specialization || '',
        experience: otherData.experience || 0,
        verificationStatus: 'PENDING',
      });
    } else if (role === 'PHARMACEUTICAL') {
      await Pharmaceutical.create({
        userId: user._id,
        firstName,
        lastName,
        companyName: otherData.companyName || '',
        licenseNumber: otherData.licenseNumber || `DRAP-${Date.now()}`,
        verificationStatus: 'PENDING',
      });
    }

    return NextResponse.json({ message: 'User registered successfully. Please login.' }, { status: 201 });
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
