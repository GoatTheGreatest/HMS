import { NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { getUserFromRequest } from '@/lib/auth';
import crypto from 'crypto';

// Initialize S3 Client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'mock_access_key',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'mock_secret_key',
  },
});

export async function POST(request) {
  try {
    await connectDB();
    const payload = await getUserFromRequest();
    
    if (!payload?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { filename, contentType, action, avatarUrl } = await request.json();

    // ACTION: Save final URL
    if (action === 'save') {
      if (!avatarUrl) return NextResponse.json({ error: 'Missing avatarUrl' }, { status: 400 });
      const user = await User.findById(payload.userId);
      if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
      
      user.avatarUrl = avatarUrl;
      await user.save();
      
      return NextResponse.json({ message: 'Avatar saved', avatarUrl });
    }

    // ACTION: Generate Presigned URL
    if (action === 'presign') {
      if (!filename || !contentType) {
        return NextResponse.json({ error: 'Missing filename or contentType' }, { status: 400 });
      }

      // Validate MIME type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(contentType)) {
        return NextResponse.json({ error: 'Invalid file type. Only JPEG and PNG are allowed.' }, { status: 400 });
      }

      const ext = filename.split('.').pop();
      const randomString = crypto.randomBytes(8).toString('hex');
      const objectKey = `avatars/${payload.userId}-${randomString}.${ext}`;

      const command = new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME || 'hms-avatars',
        Key: objectKey,
        ContentType: contentType,
      });

      const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });
      
      // The final public URL (assuming bucket is public or behind CloudFront)
      const publicUrl = `https://${process.env.AWS_S3_BUCKET_NAME || 'hms-avatars'}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${objectKey}`;

      return NextResponse.json({ presignedUrl, publicUrl });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('Error in avatar upload:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
