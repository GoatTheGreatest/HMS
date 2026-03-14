import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export async function GET(req) {
  try {
    await dbConnect();
    const doctors = await User.find({ role: 'DOCTOR' }).limit(1).lean();
    const patients = await User.find({ role: 'PATIENT' }).limit(1).lean();
    const pharmaceuticals = await User.find({ role: 'PHARMACEUTICAL' }).limit(1).lean();

    return NextResponse.json({
      doctorToken: doctors.length ? `simulated-token-for-${doctors[0]._id}` : null,
      patientToken: patients.length ? `simulated-token-for-${patients[0]._id}` : null,
      pharmaceuticalToken: pharmaceuticals.length ? `simulated-token-for-${pharmaceuticals[0]._id}` : null,
      doctorId: doctors[0]?._id,
      patientId: patients[0]?._id,
      pharmaceuticalId: pharmaceuticals[0]?._id,
    });
  } catch (err) {
    return NextResponse.json({ error: 'error' });
  }
}
