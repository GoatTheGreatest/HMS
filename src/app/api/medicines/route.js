import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import Medicine from '@/models/Medicine';

export async function GET() {
  try {
    const decoded = await getUserFromRequest();
    if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    const medicines = await Medicine.find().sort({ name: 1 }).lean();
    return NextResponse.json({ medicines });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const decoded = await getUserFromRequest();
    if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!['PHARMACEUTICAL', 'ADMIN'].includes(decoded.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await dbConnect();
    const body = await req.json();
    const { name, category, stock, expiryDate } = body;

    if (!name || !category || stock === undefined || !expiryDate) {
      return NextResponse.json({ error: 'name, category, stock, expiryDate required' }, { status: 400 });
    }

    const medicine = await Medicine.create({ ...body, addedBy: decoded.id });

    const { emitSocketEvent } = require('@/lib/socket-emit');
    emitSocketEvent('inventoryUpdated', { action: 'create', medicine });

    return NextResponse.json({ medicine }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
