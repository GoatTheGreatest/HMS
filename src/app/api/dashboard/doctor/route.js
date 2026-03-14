import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import Appointment from '@/models/Appointment';
import User from '@/models/User';

export async function GET() {
  try {
    const decoded = await getUserFromRequest();
    if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (decoded.role !== 'DOCTOR') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    await dbConnect();
    const doctorId = decoded.id;
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(todayStart.getTime() + 86400000);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [totalPatients, todayAppointments, monthlyTotal, allCompleted, recentAppointments] = await Promise.all([
      Appointment.countDocuments({ doctorId, status: { $in: ['COMPLETED'] } }),
      Appointment.countDocuments({ doctorId, date: { $gte: todayStart, $lt: todayEnd } }),
      Appointment.countDocuments({ doctorId, date: { $gte: monthStart }, status: { $ne: 'CANCELLED' } }),
      Appointment.countDocuments({ doctorId, status: 'COMPLETED' }),
      Appointment.find({ doctorId })
        .sort({ date: -1 })
        .limit(5)
        .lean(),
    ]);

    // Fetch patient names for recent appointments
    const patientIds = recentAppointments.map(a => a.patientId);
    const patients = await User.find({ _id: { $in: patientIds } }).select('firstName lastName').lean();
    const patientMap = {};
    patients.forEach(p => { patientMap[p._id.toString()] = `${p.firstName} ${p.lastName}`.trim() || p.email; });

    const recentPatients = recentAppointments.map(a => ({
      _id: a._id,
      name: patientMap[a.patientId?.toString()] || 'Unknown Patient',
      diagnosis: a.diagnosis || a.chiefComplaint || '—',
      prescription: a.prescription || '—',
      lastVisit: a.date ? new Date(a.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—',
      status: a.status,
    }));

    // Build last 7 months chart data
    const chartData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const dEnd = new Date(d.getFullYear(), d.getMonth() + 1, 1);
      const count = await Appointment.countDocuments({
        doctorId,
        date: { $gte: d, $lt: dEnd },
        status: { $ne: 'CANCELLED' },
      });
      chartData.push({
        name: d.toLocaleDateString('en-US', { month: 'short' }),
        consultations: count,
      });
    }

    const user = await User.findById(doctorId).lean();

    return NextResponse.json({
      stats: {
        totalPatients,
        todayAppointments,
        pendingPrescriptions: await Appointment.countDocuments({ doctorId, status: 'SCHEDULED', prescription: '' }),
        monthlyConsultations: monthlyTotal,
      },
      recentPatients,
      chartData,
      doctorName: `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Doctor',
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
