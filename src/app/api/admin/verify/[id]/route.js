import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import Doctor from '@/models/Doctor';
import Nurse from '@/models/Nurse';
import User from '@/models/User';

export async function PUT(req, { params }) {
  try {
    const decoded = await getUserFromRequest();
    if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (decoded.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    await dbConnect();
    const { id } = await params;
    const { action, role, reason } = await req.json();
    // action: 'approve' | 'reject'
    // role: 'doctor' | 'nurse'

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'action must be approve or reject' }, { status: 400 });
    }

    const newStatus = action === 'approve' ? 'VERIFIED' : 'REJECTED';
    const updates = {
      verificationStatus: newStatus,
      verifiedBy: decoded.id,
      verifiedAt: new Date(),
    };
    if (action === 'reject' && reason) updates.rejectionReason = reason;

    let profile = null;
    if (role === 'nurse') {
      profile = await Nurse.findByIdAndUpdate(id, updates, { new: true });
    } else {
      profile = await Doctor.findByIdAndUpdate(id, updates, { new: true });
    }

    if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 });

    return NextResponse.json({
      success: true,
      message: `${role === 'nurse' ? 'Nurse' : 'Doctor'} ${action === 'approve' ? 'approved' : 'rejected'} successfully`,
      profile,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
