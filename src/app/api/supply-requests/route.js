import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import mongoose from 'mongoose';

/* ── Inline model (avoids needing a separate model file) ─── */
const SupplyRequestSchema = new mongoose.Schema({
  medicineId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine', required: true },
  quantity:    { type: Number, required: true, min: 1 },
  notes:       { type: String, default: '' },
  requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: {
    type: String,
    enum: ['PENDING', 'APPROVED', 'REJECTED', 'FULFILLED'],
    default: 'PENDING',
  },
}, { timestamps: true });

const SupplyRequest = mongoose.models.SupplyRequest ||
  mongoose.model('SupplyRequest', SupplyRequestSchema);

/* ── GET — list supply requests (PHARMACEUTICAL / ADMIN) ─── */
export async function GET(req) {
  try {
    const decoded = await getUserFromRequest();
    if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!['PHARMACEUTICAL', 'ADMIN'].includes(decoded.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await dbConnect();
    const requests = await SupplyRequest.find()
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    return NextResponse.json({ requests });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

/* ── POST — create supply request (PHARMACEUTICAL / ADMIN) ── */
export async function POST(req) {
  try {
    const decoded = await getUserFromRequest();
    if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!['PHARMACEUTICAL', 'ADMIN'].includes(decoded.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await dbConnect();
    const body = await req.json();
    const { medicineId, quantity, notes } = body;

    if (!medicineId || !quantity || quantity < 1) {
      return NextResponse.json({ error: 'medicineId and quantity (≥ 1) are required' }, { status: 400 });
    }

    const request = await SupplyRequest.create({
      medicineId,
      quantity: Number(quantity),
      notes: notes || '',
      requestedBy: decoded.id,
    });

    return NextResponse.json({ supplyRequest: request }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
