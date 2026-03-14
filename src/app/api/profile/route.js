import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import Patient from '@/models/Patient';
import Doctor from '@/models/Doctor';
import Nurse from '@/models/Nurse';
import Pharmaceutical from '@/models/Pharmaceutical';
import { getUserFromRequest } from '@/lib/auth';

const RATE_LIMITS = new Map();

// Helper to check rate limits (simple in-memory approach)
function checkRateLimit(ip, limit = 10, windowMs = 60000) {
  const now = Date.now();
  const record = RATE_LIMITS.get(ip) || { count: 0, startTime: now };
  
  if (now - record.startTime > windowMs) {
    record.count = 1;
    record.startTime = now;
  } else {
    record.count++;
  }
  
  RATE_LIMITS.set(ip, record);
  return record.count <= limit;
}

export async function GET(request) {
  try {
    await connectDB();
    const payload = await getUserFromRequest();
    
    if (!payload?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await User.findById(payload.userId);
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    let profileData = null;
    switch (user.role) {
      case 'PATIENT':
        profileData = await Patient.findOne({ userId: user._id });
        break;
      case 'DOCTOR':
        profileData = await Doctor.findOne({ userId: user._id });
        break;
      case 'NURSE':
        profileData = await Nurse.findOne({ userId: user._id });
        break;
      case 'PHARMACEUTICAL':
        profileData = await Pharmaceutical.findOne({ userId: user._id });
        break;
    }

    return NextResponse.json({
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        displayName: user.displayName,
        phone: user.phone,
        avatarUrl: user.avatarUrl || user.avatar, // fallback to legacy field if any
        updatedAt: user.updatedAt,
      },
      profile: profileData || {},
    }, { status: 200 });

  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
    if (!checkRateLimit(ip, 20, 60000)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    await connectDB();
    const payload = await getUserFromRequest();
    
    if (!payload?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { firstName, lastName, displayName, phone, ...roleSpecificData } = body;

    const user = await User.findById(payload.userId);
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // Sanitize and update allowed user fields
    if (firstName !== undefined) user.firstName = firstName.trim();
    if (lastName !== undefined) user.lastName = lastName.trim();
    if (displayName !== undefined) user.displayName = displayName.trim();
    if (phone !== undefined) user.phone = phone.trim();
    
    await user.save();

    // Update role specific data
    let roleProfile;
    switch (user.role) {
      case 'PATIENT':
        roleProfile = await Patient.findOne({ userId: user._id });
        if (roleProfile) {
          if (firstName !== undefined) roleProfile.firstName = firstName.trim();
          if (lastName !== undefined) roleProfile.lastName = lastName.trim();
          if (displayName !== undefined) roleProfile.displayName = displayName.trim();
          if (phone !== undefined) roleProfile.phone = phone.trim();
          
          if (roleSpecificData.bloodGroup !== undefined) roleProfile.bloodGroup = roleSpecificData.bloodGroup;
          if (roleSpecificData.gender !== undefined) roleProfile.gender = roleSpecificData.gender;
          if (roleSpecificData.address !== undefined) roleProfile.address = roleSpecificData.address;
          await roleProfile.save();
        }
        break;
      case 'DOCTOR':
        roleProfile = await Doctor.findOne({ userId: user._id });
        if (roleProfile) {
          if (firstName !== undefined) roleProfile.firstName = firstName.trim();
          if (lastName !== undefined) roleProfile.lastName = lastName.trim();
          if (displayName !== undefined) roleProfile.displayName = displayName.trim();
          if (phone !== undefined) roleProfile.phone = phone.trim();
          
          if (roleSpecificData.bio !== undefined) roleProfile.bio = roleSpecificData.bio;
          if (roleSpecificData.consultationFee !== undefined) roleProfile.consultationFee = roleSpecificData.consultationFee;
          await roleProfile.save();
        }
        break;
      case 'NURSE':
        roleProfile = await Nurse.findOne({ userId: user._id });
        if (roleProfile) {
          if (firstName !== undefined) roleProfile.firstName = firstName.trim();
          if (lastName !== undefined) roleProfile.lastName = lastName.trim();
          if (displayName !== undefined) roleProfile.displayName = displayName.trim();
          if (phone !== undefined) roleProfile.phone = phone.trim();
          
          if (roleSpecificData.bio !== undefined) roleProfile.bio = roleSpecificData.bio;
          await roleProfile.save();
        }
        break;
      case 'PHARMACEUTICAL':
        roleProfile = await Pharmaceutical.findOne({ userId: user._id });
        if (roleProfile) {
          if (firstName !== undefined) roleProfile.firstName = firstName.trim();
          if (lastName !== undefined) roleProfile.lastName = lastName.trim();
          if (displayName !== undefined) roleProfile.displayName = displayName.trim();
          if (phone !== undefined) roleProfile.phone = phone.trim();
          
          if (roleSpecificData.companyName !== undefined) roleProfile.companyName = roleSpecificData.companyName;
          await roleProfile.save();
        }
        break;
    }

    return NextResponse.json({ message: 'Profile updated successfully', user }, { status: 200 });

  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
