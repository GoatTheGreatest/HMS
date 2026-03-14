import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import Message from '@/models/Message';
import User from '@/models/User';
import { emitSocketEvent } from '@/lib/socket-emit';

export async function GET(req) {
  try {
    const decoded = await getUserFromRequest();
    if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    // Fetch messages where user is either sender or receiver
    const messages = await Message.find({
      $or: [{ senderId: decoded.id }, { receiverId: decoded.id }]
    }).sort({ createdAt: -1 }).lean();

    // Attach sender/receiver names
    const userIds = [...new Set(messages.flatMap(m => [m.senderId, m.receiverId]))];
    const users = await User.find({ _id: { $in: userIds } }).select('firstName lastName role').lean();
    const userMap = {};
    users.forEach(u => {
      userMap[u._id.toString()] = u;
    });

    const enrichedMessages = messages.map(m => {
      const sender = userMap[m.senderId?.toString()];
      const receiver = userMap[m.receiverId?.toString()];
      return {
        ...m,
        senderName: sender ? `${sender.firstName} ${sender.lastName}`.trim() : 'Unknown',
        receiverName: receiver ? `${receiver.firstName} ${receiver.lastName}`.trim() : 'Unknown'
      };
    });

    return NextResponse.json({ messages: enrichedMessages });
  } catch (err) {
    console.error('Messages GET error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const decoded = await getUserFromRequest();
    if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    const { receiverId, subject, content } = await req.json();

    if (!receiverId || !content) {
      return NextResponse.json({ error: 'receiverId and content are required' }, { status: 400 });
    }

    const message = await Message.create({
      senderId: decoded.id,
      receiverId,
      content,
      isRead: false
    });

    // Populate sender name for the socket payload
    const sender = await User.findById(decoded.id).select('firstName lastName').lean();
    const senderName = sender ? `${sender.firstName} ${sender.lastName}`.trim() : 'Unknown';
    
    // Also include subject in the socket payload, though it's not in the db schema, or we can add it?
    // Wait, let's look at Message schema.
    const socketPayload = {
      ...message.toObject(),
      senderName,
      subject: subject || 'New Message'
    };

    emitSocketEvent('newMessage', socketPayload);

    return NextResponse.json({ message: socketPayload }, { status: 201 });
  } catch (err) {
    console.error('Messages POST error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
