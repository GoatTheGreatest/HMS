import mongoose from 'mongoose';
import User from './src/models/User.js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function checkAdmin() {
  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hms';
  await mongoose.connect(MONGODB_URI);
  
  const admin = await User.findOne({ email: 'admin@hms.com' }).select('+password');
  if (!admin) {
    console.log('ADMIN_NOT_FOUND');
  } else {
    console.log('ADMIN_FOUND');
    console.log('Role:', admin.role);
    console.log('IsActive:', admin.isActive);
    console.log('Password Hash starts with:', admin.password.substring(0, 10));
  }
  process.exit(0);
}
checkAdmin();
