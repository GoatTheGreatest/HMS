import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import Appointment from '@/models/Appointment';

export async function PUT(req, { params }) {
  try {
    const decoded = await getUserFromRequest();
    if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    const { id } = await params;
    const body = await req.json();
    const allowed = ['PENDING', 'SCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'];
    const { status, notes, diagnosis, prescription } = body;

    const appointment = await Appointment.findById(id);
    if (!appointment) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    // Authorization: only patient (cancel own) or doctor (their appt) or admin
    const isDoctor  = decoded.role === 'DOCTOR' && appointment.doctorId?.toString() === decoded.id;
    const isPatient = decoded.role === 'PATIENT' && appointment.patientId?.toString() === decoded.id;
    const isAdmin   = decoded.role === 'ADMIN';

    if (!isDoctor && !isPatient && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const updates = {};
    if (status && allowed.includes(status)) updates.status = status;
    if (notes !== undefined) updates.notes = notes;
    if (diagnosis !== undefined) updates.diagnosis = diagnosis;
    if (prescription !== undefined) updates.prescription = prescription;

    const updated = await Appointment.findByIdAndUpdate(id, updates, { new: true });
    return NextResponse.json({ appointment: updated });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function GET(req, { params }) {
  try {
    const decoded = await getUserFromRequest();
    if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await dbConnect();
    const { id } = await params;
    const appt = await Appointment.findById(id).lean();
    if (!appt) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ appointment: appt });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const decoded = await getUserFromRequest();
    if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    const { id } = await params;
    const appointment = await Appointment.findById(id);
    if (!appointment) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    // Authorization: patient can cancel their own; doctor their own; admin can cancel any
    const isPatient = decoded.role === 'PATIENT' && appointment.patientId?.toString() === decoded.id;
    const isDoctor  = decoded.role === 'DOCTOR'  && appointment.doctorId?.toString()  === decoded.id;
    const isAdmin   = decoded.role === 'ADMIN';

    if (!isPatient && !isDoctor && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Prevent cancelling already-completed appointments
    if (appointment.status === 'COMPLETED') {
      return NextResponse.json({ error: 'Cannot cancel a completed appointment' }, { status: 400 });
    }

    // Mark as CANCELLED instead of hard-delete (preserves history)
    appointment.status = 'CANCELLED';
    await appointment.save();

    return NextResponse.json({ success: true, message: 'Appointment cancelled' });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
