import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import User from '@/models/User';
import Doctor from '@/models/Doctor';
import Nurse from '@/models/Nurse';
import Patient from '@/models/Patient';
import Pharmaceutical from '@/models/Pharmaceutical';

export async function GET() {
  try {
    const decoded = await getUserFromRequest();
    if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    const user = await User.findById(decoded.id).lean();
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    let profile = null;
    const role = user.role;

    if (role === 'DOCTOR') {
      profile = await Doctor.findOne({ userId: decoded.id }).lean();
    } else if (role === 'NURSE') {
      profile = await Nurse.findOne({ userId: decoded.id }).lean();
    } else if (role === 'PATIENT') {
      profile = await Patient.findOne({ userId: decoded.id }).lean();
    } else if (role === 'PHARMACEUTICAL') {
      profile = await Pharmaceutical.findOne({ userId: decoded.id }).lean();
    }

    return NextResponse.json({
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        firstName: user.firstName || profile?.firstName || '',
        lastName: user.lastName || profile?.lastName || '',
        phone: user.phone || '',
        avatar: user.avatar || '',
      },
      profile,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const decoded = await getUserFromRequest();
    if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    const body = await req.json();
    const { firstName, lastName, phone, avatar, ...profileData } = body;

    const userUpdate = {};
    if (firstName !== undefined) userUpdate.firstName = firstName;
    if (lastName !== undefined) userUpdate.lastName = lastName;
    if (phone !== undefined) userUpdate.phone = phone;
    if (avatar !== undefined) userUpdate.avatar = avatar;

    await User.findByIdAndUpdate(decoded.id, userUpdate);

    const role = decoded.role;
    if (role === 'DOCTOR' && Object.keys(profileData).length > 0) {
      await Doctor.findOneAndUpdate({ userId: decoded.id }, profileData, { upsert: true });
    } else if (role === 'NURSE' && Object.keys(profileData).length > 0) {
      await Nurse.findOneAndUpdate({ userId: decoded.id }, profileData, { upsert: true });
    } else if (role === 'PATIENT' && Object.keys(profileData).length > 0) {
      await Patient.findOneAndUpdate({ userId: decoded.id }, profileData, { upsert: true });
    } else if (role === 'PHARMACEUTICAL' && Object.keys(profileData).length > 0) {
      await Pharmaceutical.findOneAndUpdate({ userId: decoded.id }, profileData, { upsert: true });
    }

    return NextResponse.json({ success: true, message: 'Profile updated' });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
