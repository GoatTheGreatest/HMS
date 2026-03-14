import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import User from '@/models/User';
import Doctor from '@/models/Doctor';
import Nurse from '@/models/Nurse';

export async function GET() {
  try {
    const decoded = await getUserFromRequest();
    if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (decoded.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    await dbConnect();
    const now = new Date();

    const [totalUsers, pendingDoctors, pendingNurses] = await Promise.all([
      User.countDocuments(),
      Doctor.find({ verificationStatus: 'PENDING' }).limit(20).lean(),
      Nurse.find({ verificationStatus: 'PENDING' }).limit(20).lean(),
    ]);

    // Users by role counts
    const roleCounts = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);
    const usersByRole = {};
    roleCounts.forEach(r => { usersByRole[r._id] = r.count; });

    const roleData = [
      { name: 'Patients', count: usersByRole['PATIENT'] || 0 },
      { name: 'Doctors', count: usersByRole['DOCTOR'] || 0 },
      { name: 'Nurses', count: usersByRole['NURSE'] || 0 },
      { name: 'Pharma', count: usersByRole['PHARMACEUTICAL'] || 0 },
    ];

    // Registration chart - last 7 months
    const registrationData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const dEnd = new Date(d.getFullYear(), d.getMonth() + 1, 1);
      const count = await User.countDocuments({ createdAt: { $gte: d, $lt: dEnd } });
      registrationData.push({ name: d.toLocaleDateString('en-US', { month: 'short' }), users: count });
    }

    // Merge pending verifications with user info
    const pendingDoctorIds = pendingDoctors.map(d => d.userId);
    const pendingNurseIds  = pendingNurses.map(n => n.userId);
    const allPendingIds = [...pendingDoctorIds, ...pendingNurseIds];
    const pendingUsers = await User.find({ _id: { $in: allPendingIds } }).select('firstName lastName email').lean();
    const userMap = {};
    pendingUsers.forEach(u => { userMap[u._id.toString()] = u; });

    const pendingVerifications = [
      ...pendingDoctors.map(d => ({
        _id: d._id,              // Doctor profile ID (used for verify action)
        userId: d.userId,
        name: `Dr. ${userMap[d.userId?.toString()]?.firstName || ''} ${userMap[d.userId?.toString()]?.lastName || ''}`.trim(),
        email: userMap[d.userId?.toString()]?.email || '',
        role: 'Doctor',
        specialty: d.specialization || '—',
        license: d.licenseNumber || '—',
        submitted: new Date(d.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      })),
      ...pendingNurses.map(n => ({
        _id: n._id,
        userId: n.userId,
        name: `${userMap[n.userId?.toString()]?.firstName || ''} ${userMap[n.userId?.toString()]?.lastName || ''}`.trim(),
        email: userMap[n.userId?.toString()]?.email || '',
        role: 'Nurse',
        specialty: n.specialization || '—',
        license: n.licenseNumber || '—',
        submitted: new Date(n.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      })),
    ];

    return NextResponse.json({
      stats: {
        totalUsers,
        pendingCount: pendingVerifications.length,
        verifiedDoctors: await Doctor.countDocuments({ verificationStatus: 'VERIFIED' }),
        verifiedNurses: await Nurse.countDocuments({ verificationStatus: 'VERIFIED' }),
      },
      pendingVerifications,
      roleData,
      registrationData,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
