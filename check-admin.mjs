import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function checkAdmin() {
  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hms';
  try {
    const conn = await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Bypass Mongoose schemas to avoid NextJS import issues
    const collection = conn.connection.db.collection('users');
    const admin = await collection.findOne({ email: 'admin@hms.com' });
    
    if (!admin) {
      console.log('ADMIN_NOT_FOUND - The seed endpoint was likely not visited.');
    } else {
      console.log('ADMIN_FOUND');
      console.log('Role:', admin.role);
      console.log('Password hash length:', admin.password.length);
    }
    process.exit(0);
  } catch (err) {
    console.error('Error connecting to MongoDB:', err);
    process.exit(1);
  }
}
checkAdmin();
