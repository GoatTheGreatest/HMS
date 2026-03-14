import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import Appointment from '@/models/Appointment';
import Document from '@/models/Document';
import User from '@/models/User';

export async function GET() {
  try {
    const decoded = await getUserFromRequest();
    if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (decoded.role !== 'PATIENT') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    await dbConnect();
    const patientId = decoded.id;
    const now = new Date();

    const [upcomingRaw, pastRaw, documents] = await Promise.all([
      Appointment.find({ patientId, date: { $gte: now }, status: { $nin: ['CANCELLED'] } })
        .sort({ date: 1 })
        .limit(5)
        .lean(),
      Appointment.find({ patientId, status: 'COMPLETED' })
        .sort({ date: -1 })
        .limit(3)
        .lean(),
      Document.find({ patientId }).sort({ createdAt: -1 }).limit(3).lean(),
    ]);

    // Doctor names
    const doctorIds = [...upcomingRaw, ...pastRaw].map(a => a.doctorId).filter(Boolean);
    const doctors = await User.find({ _id: { $in: doctorIds } }).select('firstName lastName').lean();
    const doctorMap = {};
    doctors.forEach(d => { doctorMap[d._id.toString()] = `Dr. ${d.firstName} ${d.lastName}`.trim(); });

    const upcomingAppointments = upcomingRaw.map(a => ({
      _id: a._id,
      doctor: doctorMap[a.doctorId?.toString()] || 'Unknown Doctor',
      date: a.date ? new Date(a.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—',
      time: a.timeSlot || '—',
      status: a.status,
    }));

    const lastVisit = pastRaw[0] ? {
      doctor: doctorMap[pastRaw[0].doctorId?.toString()] || 'Unknown',
      date: new Date(pastRaw[0].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    } : null;

    const recentDocuments = documents.map(d => ({
      _id: d._id,
      name: d.fileName,
      type: d.documentType?.replace('_', ' ') || 'Document',
      date: new Date(d.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    }));

    // Visit chart - last 7 months
    const chartData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const dEnd = new Date(d.getFullYear(), d.getMonth() + 1, 1);
      const count = await Appointment.countDocuments({ patientId, date: { $gte: d, $lt: dEnd }, status: 'COMPLETED' });
      chartData.push({ name: d.toLocaleDateString('en-US', { month: 'short' }), visits: count });
    }

    const totalRecords = await Appointment.countDocuments({ patientId });
    const totalDocs = await Document.countDocuments({ patientId });
    const user = await User.findById(patientId).lean();

    return NextResponse.json({
      stats: {
        lastVisit,
        upcomingCount: upcomingAppointments.length,
        totalRecords,
        totalDocuments: totalDocs,
      },
      upcomingAppointments,
      recentDocuments,
      chartData,
      patientName: `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Patient',
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
