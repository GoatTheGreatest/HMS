import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import HomeVisit from '@/models/HomeVisit';

export async function GET() {
  try {
    const decoded = await getUserFromRequest();
    if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (decoded.role !== 'NURSE') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    await dbConnect();
    const visits = await HomeVisit.find({ nurseId: decoded.id })
      .sort({ scheduledDate: 1 })
      .lean();
    return NextResponse.json({ visits });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const decoded = await getUserFromRequest();
    if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    const body = await req.json();
    const visit = await HomeVisit.create({
      ...body,
      nurseId: decoded.role === 'NURSE' ? decoded.id : undefined,
    });
    return NextResponse.json({ visit }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
