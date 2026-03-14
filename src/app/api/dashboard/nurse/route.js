import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import HomeVisit from '@/models/HomeVisit';
import User from '@/models/User';

export async function GET() {
  try {
    const decoded = await getUserFromRequest();
    if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (decoded.role !== 'NURSE') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    await dbConnect();
    const nurseId = decoded.id;
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(todayStart.getTime() + 86400000);

    const [todayVisits, completedToday, allVisits] = await Promise.all([
      HomeVisit.find({ nurseId, scheduledDate: { $gte: todayStart, $lt: todayEnd }, status: { $ne: 'CANCELLED' } }).lean(),
      HomeVisit.countDocuments({ nurseId, scheduledDate: { $gte: todayStart, $lt: todayEnd }, status: 'COMPLETED' }),
      HomeVisit.find({ nurseId, status: { $nin: ['COMPLETED', 'CANCELLED'] } }).sort({ scheduledDate: 1 }).limit(10).lean(),
    ]);

    const activePatients = await HomeVisit.countDocuments({ nurseId, status: { $nin: ['COMPLETED', 'CANCELLED'] } });

    // Build weekly schedule data (Mon-Sun this week)
    const scheduleData = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((name, i) => ({
      name,
      visits: 0,
    }));
    // Count visits per day this week
    const weekStart = new Date(todayStart);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
    for (let i = 0; i < 7; i++) {
      const dayStart = new Date(weekStart.getTime() + i * 86400000);
      const dayEnd = new Date(dayStart.getTime() + 86400000);
      scheduleData[i].visits = await HomeVisit.countDocuments({
        nurseId,
        scheduledDate: { $gte: dayStart, $lt: dayEnd },
        status: { $ne: 'CANCELLED' },
      });
    }

    const homeVisitRequests = allVisits.map(v => ({
      _id: v._id,
      patient: v.patientName || 'Unknown',
      address: v.address,
      time: v.scheduledTime || '—',
      status: v.status,
      priority: v.priority,
    }));

    const user = await User.findById(nurseId).lean();

    return NextResponse.json({
      stats: {
        todayRequestsCount: todayVisits.length,
        completedToday,
        activePatients,
        pendingReports: await HomeVisit.countDocuments({ nurseId, status: 'COMPLETED', notes: '' }),
      },
      homeVisitRequests,
      scheduleData,
      nurseName: `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Nurse',
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
