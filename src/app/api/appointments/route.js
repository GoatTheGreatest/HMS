import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import Appointment from '@/models/Appointment';
import User from '@/models/User';

export async function GET(req) {
  try {
    const decoded = await getUserFromRequest();
    if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    let query = {};
    if (decoded.role === 'PATIENT') query.patientId = decoded.id;
    else if (decoded.role === 'DOCTOR') query.doctorId = decoded.id;
    else if (decoded.role === 'ADMIN') { /* all */ }
    else return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    if (status) query.status = status;

    const appointments = await Appointment.find(query).sort({ date: -1 }).limit(50).lean();

    const patientIds = appointments.map(a => a.patientId).filter(Boolean);
    const doctorIds  = appointments.map(a => a.doctorId).filter(Boolean);
    const allIds = [...new Set([...patientIds.map(String), ...doctorIds.map(String)])];
    const users = await User.find({ _id: { $in: allIds } }).select('firstName lastName role email').lean();
    
    // Fetch patient profiles to get admissionStatus
    const importPatient = require('@/models/Patient').default || require('@/models/Patient');
    const patients = await importPatient.find({ userId: { $in: patientIds } }).lean();
    const patientMap = {};
    patients.forEach(p => { patientMap[p.userId.toString()] = p; });

    const userMap = {};
    users.forEach(u => { userMap[u._id.toString()] = u; });

    const result = appointments.map(a => {
      const pat = userMap[a.patientId?.toString()];
      const doc = userMap[a.doctorId?.toString()];
      const patProfile = patientMap[a.patientId?.toString()];
      return {
        ...a,
        patientName: pat ? `${pat.firstName} ${pat.lastName}`.trim() : 'Unknown',
        doctorName: doc ? `Dr. ${doc.firstName} ${doc.lastName}`.trim() : 'Unknown',
        admissionStatus: patProfile?.admissionStatus || 'NORMAL',
      };
    });

    return NextResponse.json({ appointments: result });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const decoded = await getUserFromRequest();
    if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (decoded.role !== 'PATIENT') return NextResponse.json({ error: 'Only patients can book appointments' }, { status: 403 });

    await dbConnect();
    const body = await req.json();
    const { doctorId, date, timeSlot, type, chiefComplaint, priority } = body;

    if (!doctorId || !date || !timeSlot) {
      return NextResponse.json({ error: 'doctorId, date, and timeSlot are required' }, { status: 400 });
    }

    const appointment = await Appointment.create({
      patientId: decoded.id,
      doctorId,
      date: new Date(date),
      timeSlot,
      type: type || 'PHYSICAL',
      chiefComplaint: chiefComplaint || '',
      priority: priority || 'NORMAL',
      status: 'PENDING',
    });

    return NextResponse.json({ appointment }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
