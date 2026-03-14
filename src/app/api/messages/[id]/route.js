import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import Message from '@/models/Message';

export async function PATCH(req, { params }) {
  try {
    const decoded = await getUserFromRequest();
    if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    const { id } = await params;
    const body = await req.json();

    const message = await Message.findOne({ _id: id });
    if (!message) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    // Only receiver can mark as read
    if (message.receiverId.toString() !== decoded.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (typeof body.isRead === 'boolean') {
      message.isRead = body.isRead;
      await message.save();
    }

    return NextResponse.json({ success: true, message });
  } catch (err) {
    console.error('Message PATCH error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const decoded = await getUserFromRequest();
    if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    const { id } = await params;

    const message = await Message.findOne({ _id: id });
    if (!message) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    // Ensure only sender or receiver can delete
    if (message.senderId.toString() !== decoded.id && message.receiverId.toString() !== decoded.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await Message.deleteOne({ _id: id });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Message DELETE error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
