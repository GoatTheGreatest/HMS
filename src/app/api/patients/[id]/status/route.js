import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import Patient from '@/models/Patient';
import User from '@/models/User';

export async function PATCH(req, { params }) {
  try {
    const decoded = await getUserFromRequest();
    if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!['DOCTOR', 'ADMIN'].includes(decoded.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await dbConnect();
    const { id: patientUserId } = await params;
    
    // Validate that the user exists
    const user = await User.findById(patientUserId);
    if (!user) return NextResponse.json({ error: 'Patient not found' }, { status: 404 });

    const body = await req.json();
    const { admissionStatus } = body;

    const validStatuses = ['NORMAL', 'ADMITTED', 'DISCHARGED', 'TREATED'];
    if (!admissionStatus || !validStatuses.includes(admissionStatus)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    // Upsert the patient document to update admissionStatus
    const patient = await Patient.findOneAndUpdate(
      { userId: patientUserId },
      { admissionStatus },
      { new: true, upsert: true }
    );

    const { emitSocketEvent } = require('@/lib/socket-emit');
    emitSocketEvent('patientStatusUpdated', {
      patientId: patientUserId,
      admissionStatus: patient.admissionStatus
    });
    
    return NextResponse.json({ success: true, admissionStatus: patient.admissionStatus });
  } catch (err) {
    console.error('Patient Status Update Error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
