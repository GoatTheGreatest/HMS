import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import Medicine from '@/models/Medicine';

export async function PUT(req, { params }) {
  try {
    const decoded = await getUserFromRequest();
    if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!['PHARMACEUTICAL', 'ADMIN'].includes(decoded.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await dbConnect();
    const { id } = await params;
    const body = await req.json();
    const medicine = await Medicine.findByIdAndUpdate(id, body, { new: true });
    if (!medicine) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const { emitSocketEvent } = require('@/lib/socket-emit');
    emitSocketEvent('inventoryUpdated', { action: 'update', medicine });

    return NextResponse.json({ medicine });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const decoded = await getUserFromRequest();
    if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!['PHARMACEUTICAL', 'ADMIN'].includes(decoded.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await dbConnect();
    const { id } = await params;
    await Medicine.findByIdAndDelete(id);

    const { emitSocketEvent } = require('@/lib/socket-emit');
    emitSocketEvent('inventoryUpdated', { action: 'delete', id });

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
