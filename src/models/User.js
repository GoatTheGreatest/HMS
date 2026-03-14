import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please fill a valid email address',
    ],
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 6,
    select: false,
  },
  role: {
    type: String,
    enum: ['PATIENT', 'DOCTOR', 'NURSE', 'PHARMACEUTICAL', 'ADMIN'],
    required: [true, 'Please provide a role'],
  },
  firstName: { type: String, default: '' },
  lastName:  { type: String, default: '' },
  displayName: { type: String, default: '' },
  phone:     { type: String, default: '' },
  avatar:    { type: String, default: '' },
  avatarUrl: { type: String, default: '' },
  isActive: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true });

export default mongoose.models.User || mongoose.model('User', UserSchema);
