import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import HomeVisit from '@/models/HomeVisit';

export async function PUT(req, { params }) {
  try {
    const decoded = await getUserFromRequest();
    if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (decoded.role !== 'NURSE') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    await dbConnect();
    const { id } = await params;
    const body = await req.json();
    const allowed = ['NEW', 'SCHEDULED', 'EN_ROUTE', 'COMPLETED', 'CANCELLED'];
    const updates = {};
    if (body.status && allowed.includes(body.status)) updates.status = body.status;
    if (body.notes !== undefined) updates.notes = body.notes;
    if (body.status === 'COMPLETED') updates.completedAt = new Date();

    const visit = await HomeVisit.findOneAndUpdate(
      { _id: id, nurseId: decoded.id },
      updates,
      { new: true }
    );
    if (!visit) return NextResponse.json({ error: 'Not found or unauthorized' }, { status: 404 });
    return NextResponse.json({ visit });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
