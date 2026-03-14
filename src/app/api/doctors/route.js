import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import Doctor from '@/models/Doctor';
import User from '@/models/User';

export async function GET(req) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const specialty = searchParams.get('specialty') || '';

    const query = { verificationStatus: 'VERIFIED' };
    if (specialty) query.specialization = { $regex: specialty, $options: 'i' };

    const doctors = await Doctor.find(query).sort({ rating: -1, totalPatients: -1 }).lean();
    const userIds = doctors.map(d => d.userId);
    const users = await User.find({ _id: { $in: userIds } }).select('firstName lastName email').lean();
    const userMap = {};
    users.forEach(u => { userMap[u._id.toString()] = u; });

    const result = doctors.map(d => {
      const u = userMap[d.userId?.toString()] || {};
      return {
        _id: d._id,
        userId: d.userId,
        name: `Dr. ${u.firstName || ''} ${u.lastName || ''}`.trim(),
        email: u.email || '',
        specialization: d.specialization,
        experience: d.experience,
        consultationFee: d.consultationFee,
        rating: d.rating,
        totalPatients: d.totalPatients,
        bio: d.bio,
        location: d.location,
        availableDays: d.availableDays,
      };
    });

    return NextResponse.json({ doctors: result });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
