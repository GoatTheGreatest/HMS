import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import Prescription from '@/models/Prescription';
import User from '@/models/User';

export async function GET() {
  try {
    const decoded = await getUserFromRequest();
    if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    let query = {};
    if (decoded.role === 'DOCTOR') query.doctorId = decoded.id;
    else if (decoded.role === 'PATIENT') query.patientId = decoded.id;
    else if (decoded.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const prescriptions = await Prescription.find(query).sort({ createdAt: -1 }).lean();

    const allIds = [...new Set([
      ...prescriptions.map(p => p.doctorId?.toString()),
      ...prescriptions.map(p => p.patientId?.toString()),
    ].filter(Boolean))];
    const users = await User.find({ _id: { $in: allIds } }).select('firstName lastName').lean();
    const uMap = {};
    users.forEach(u => { uMap[u._id.toString()] = `${u.firstName} ${u.lastName}`.trim(); });

    const result = prescriptions.map(p => ({
      ...p,
      doctorName: `Dr. ${uMap[p.doctorId?.toString()] || 'Unknown'}`,
      patientName: uMap[p.patientId?.toString()] || 'Unknown',
    }));

    return NextResponse.json({ prescriptions: result });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const decoded = await getUserFromRequest();
    if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (decoded.role !== 'DOCTOR') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    await dbConnect();
    const body = await req.json();
    const { patientId, diagnosis, medicines, notes, appointmentId, validUntil } = body;

    if (!patientId || !diagnosis) {
      return NextResponse.json({ error: 'patientId and diagnosis required' }, { status: 400 });
    }

    const prescription = await Prescription.create({
      doctorId: decoded.id,
      patientId,
      diagnosis,
      medicines: medicines || [],
      notes: notes || '',
      appointmentId: appointmentId || undefined,
      validUntil: validUntil ? new Date(validUntil) : undefined,
    });

    return NextResponse.json({ prescription }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
